import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const { isAdmin, user } = useAuth();
  const [driverName, setDriverName] = useState(() => localStorage.getItem('driver_name') || '');
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [lastCompletedSession, setLastCompletedSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch recent sessions on mount or when admin status changes
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('*, photos(id, storage_path)') // 'data' does not exist in DB, it's base64 local only
        .order('start_time', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching sessions:', JSON.stringify(error, null, 2));
      } else {
        setSessions(data || []);
      }
      setLoading(false);
    };

    fetchSessions();

    // Real-time subscription for new sessions
    // Using a slight delay to prevent strict-mode double-mounting from instantly aborting the websocket handshake.
    let channel;
    const timeoutId = setTimeout(() => {
      channel = supabase
        .channel('public:sessions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setSessions(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setSessions(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
          }
        });
      channel.subscribe();
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isAdmin]);

  // Actions
  const loginDriver = useCallback(async (name, pin) => {
    try {
      if (!name || !pin) throw new Error('Name and PIN are required');

      const { data, error } = await supabase
        .rpc('verify_user_credentials', {
          p_name: name,
          p_pin: pin,
          p_role: 'driver'
        })
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Invalid credentials');

      setDriverName(data.user_name);
      localStorage.setItem('driver_name', data.user_name);
      return true;
    } catch (error) {
      console.error('Driver login error:', error);
      return false;
    }
  }, []);

  const logoutDriver = useCallback(() => {
    setDriverName('');
    localStorage.removeItem('driver_name');
    setCurrentSession(null);
    setLastCompletedSession(null);
  }, []);

  const startNewSession = useCallback(async (chassisId) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          chassis_id: chassisId,
          driver_name: driverName,
          status: 'started',
          start_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Initialize local current session state with the DB record
      setCurrentSession({
        ...data,
        photos: [], // Photos will be fetched/added separately
        uploadedPhotos: [], // Previouly uploaded session photos
        location_verified: false, // Local state
        location_type: null,
        gps_lat: null,
        gps_lng: null,
        comments: ''
      });

      return data;
    } catch (error) {
      console.error('Error starting session FULL:', JSON.stringify(error, null, 2));
      console.error('Error starting session OBJ:', error);
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        toast.error('Database setup required. Please run the schema.sql script in Supabase.');
      } else {
        toast.error(`Start failed: ${error.message || 'Unknown error'}`);
      }
      throw error;
    }
  }, [driverName]);

  const updateLocationStatus = useCallback((status, type) => {
    setCurrentSession(prev => prev ? ({ ...prev, location_verified: status, location_type: type }) : null);
    // Optionally update DB immediately
    if (currentSession?.id) {
      // This is a local update optimized for UI, final sync on submit
    }
  }, [currentSession]);

  const updateSessionComment = useCallback((comment) => {
    setCurrentSession(prev => prev ? ({ ...prev, comments: comment }) : null);
  }, []);

  const updateSessionCoords = useCallback((lat, lng) => {
    setCurrentSession(prev => prev ? ({ ...prev, gps_lat: parseFloat(lat), gps_lng: parseFloat(lng) }) : null);
  }, []);

  const addPhoto = useCallback(async (photoDataUrl) => {
    if (!currentSession) return;

    try {
      // 1. Convert Data URL to Blob
      const res = await fetch(photoDataUrl);
      const blob = await res.blob();
      const fileExt = 'jpg';
      const fileName = `${currentSession.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      // 3. Get Public URL (or just store path)
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);

      // 4. Insert into photos table
      const { data: photoRecord, error: dbError } = await supabase
        .from('photos')
        .insert({
          session_id: currentSession.id,
          storage_path: filePath,
          photo_type: 'standard',
          gps_lat: currentSession.gps_lat,
          gps_lng: currentSession.gps_lng,
          taken_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 5. Update local state
      setCurrentSession(prev => prev ? ({
        ...prev,
        photos: [...prev.photos, { ...photoRecord, data: photoDataUrl }] // Keep base64 for immediate UI feedback, or use publicUrl
      }) : null);

      toast.success("Photo uploaded successfully");

    } catch (error) {
      console.error('Error adding photo:', error);
      toast.error('Failed to upload photo.');
    }
  }, [currentSession]);

  // Remove photo from DB and Storage
  const removePhoto = useCallback(async (photoId, storagePath) => {
    if (!currentSession) return;

    // Optimistic UI update
    setCurrentSession(prev => prev ? ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== photoId),
      uploadedPhotos: (prev.uploadedPhotos || []).filter(p => p.id !== photoId)
    }) : null);

    try {
      // Delete from DB
      const { error: dbError } = await supabase.from('photos').delete().eq('id', photoId);
      if (dbError) throw dbError;

      // Delete from Storage if path provided
      if (storagePath) {
        const { error: storageError } = await supabase.storage.from('photos').remove([storagePath]);
        if (storageError) console.warn("Failed to delete from storage", storageError);
      }

    } catch (error) {
      console.error("Error deleting photo", error);
      toast.error("Failed to delete photo from server");
      // Revert UI if needed (complex)
    }
  }, [currentSession]);

  const updatePhotoComment = useCallback(async (photoId, comment) => {
    if (!currentSession) return;

    try {
      // Update local state first (Optimistic)
      setCurrentSession(prev => prev ? ({
        ...prev,
        photos: prev.photos.map(p => p.id === photoId ? { ...p, comments: comment } : p),
        uploadedPhotos: (prev.uploadedPhotos || []).map(p => p.id === photoId ? { ...p, comments: comment } : p)
      }) : null);

      // Persist to DB
      const { error } = await supabase
        .from('photos')
        .update({ comments: comment })
        .eq('id', photoId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating photo comment:', error);
      toast.error('Failed to save comment.');
    }
  }, [currentSession]);

  const submitSession = useCallback(async (overrideComments = null) => {
    if (!currentSession) return;

    try {
      const existingComments = currentSession.comments || '';
      const newComments = overrideComments
        ? (existingComments ? existingComments + '\n---\n' + overrideComments : overrideComments)
        : existingComments;

      const payload = {
        status: 'uploaded',
        end_time: new Date().toISOString(),
        comments: newComments,
        gps_lat: currentSession.gps_lat,
        gps_lng: currentSession.gps_lng
      };

      console.log('--- SESSION SUBMISSION AUDIT ---');
      console.log('Target Table: sessions');
      console.log('Insert Payload:', payload);

      const { data, error } = await supabase
        .from('sessions')
        .update(payload)
        .eq('id', currentSession.id)
        .select('*, photos(*)') // Select updated session AND related photos
        .single();

      if (error) {
        console.error('Supabase Update Error:', error);
        console.log('RLS Check: If error is 403, check RLS policies.');
        throw error;
      }

      console.log('Returned Data:', data);
      console.log('Comment in Data:', data.comments);
      console.log('--------------------------------');

      // Update sessions list locally to include the latest changes immediately
      setSessions(prev => [data, ...prev.filter(s => s.id !== data.id)]);

      // Set the last completed session for the confirmation screen
      // Merge with currentSession photos if DB photos are empty/loading (though .select('*, photos(*)') should handle it)
      // The DB photos join might return objects with storage_path but not data url.
      // We want to preserve the data URLs from currentSession.photos for immediate display if possible, 
      // OR generate publicRow URLs.
      // Let's use the DB return but map the photos to include URLs.

      const enrichedPhotos = (data.photos || []).map(p => {
        // Find existing local photo to preserve base64 data URL for fast UI
        const existingLocal = currentSession.photos.find(local => local.id === p.id);
        const existingUploaded = (currentSession.uploadedPhotos || []).find(up => up.id === p.id);
        return {
          ...p,
          url: supabase.storage.from('photos').getPublicUrl(p.storage_path).data.publicUrl,
          data: existingLocal?.data || existingUploaded?.data // Keep base64 if available
        };
      });

      // Keep session open instead of clearing it, but reset the photos to empty array so the UI clears out
      setCurrentSession(prev => ({
        ...prev,
        ...data,
        photos: [], // Empty out the photos from the UI
        uploadedPhotos: enrichedPhotos // Keep track of successfully uploaded ones
      }));

      toast.success("Photos uploaded successfully!");

    } catch (error) {
      console.error('Error submitting session:', error);
      toast.error('Failed to submit session.');
      throw error;
    }
  }, [currentSession, driverName]);

  const resetSession = useCallback(() => {
    setCurrentSession(null);
    setLastCompletedSession(null);
  }, []);

  const value = useMemo(() => ({
    driverName,
    currentSession,
    lastCompletedSession, // Export this
    sessions,
    isAdmin,
    loginDriver,
    logoutDriver,
    startNewSession,
    updateLocationStatus,
    updateSessionComment,
    updateSessionCoords,
    addPhoto,
    removePhoto,
    updatePhotoComment,
    submitSession,
    resetSession,
    loading
  }), [
    driverName,
    currentSession,
    lastCompletedSession,
    sessions,
    isAdmin,
    loginDriver,
    logoutDriver,
    startNewSession,
    updateLocationStatus,
    updateSessionComment,
    updateSessionCoords,
    addPhoto,
    removePhoto,
    updatePhotoComment,
    submitSession,
    resetSession,
    loading
  ]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
