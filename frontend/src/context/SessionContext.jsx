import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const { isAdmin, user } = useAuth();
  const [driverName, setDriverName] = useState('');
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
        .select('*, photos(id, storage_path, data)') // Include 'data' if available or just rely on storage_path
        .order('start_time', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching sessions:', error);
      } else {
        setSessions(data || []);
      }
      setLoading(false);
    };

    fetchSessions();

    // Real-time subscription for new sessions
    const subscription = supabase
      .channel('public:sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSessions(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setSessions(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
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
      return true;
    } catch (error) {
      console.error('Driver login error:', error);
      return false;
    }
  }, []);

  const logoutDriver = useCallback(() => {
    setDriverName('');
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
        location_verified: false, // Local state
        location_type: null,
        comments: ''
      });

      return data;
    } catch (error) {
      console.error('Error starting session:', error);
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        toast.error('Database setup required. Please run the schema.sql script in Supabase.');
      } else {
        toast.error('Failed to start session. Please try again.');
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
      photos: prev.photos.filter(p => p.id !== photoId)
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

  const submitSession = useCallback(async () => {
    if (!currentSession) return;

    try {
      const payload = {
        status: 'uploaded',
        end_time: new Date().toISOString(),
        comments: currentSession.comments,
        gps_lat: currentSession.location_verified ? 0 : null, // Replace with real coords if available
        gps_lng: currentSession.location_verified ? 0 : null
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

      const enrichedPhotos = (data.photos || []).map(p => ({
        ...p,
        url: supabase.storage.from('photos').getPublicUrl(p.storage_path).data.publicUrl
      }));

      // Fallback: If DB photos lookup is delayed/not structured, use currentSession.photos
      // But submitSession awaits, so data should be fresh.
      // Note: Relation 'photos' must exist in DB for the join to work.

      setLastCompletedSession({
        ...data,
        photos: enrichedPhotos.length > 0 ? enrichedPhotos : currentSession.photos
      });

      // Reset local current session
      setCurrentSession(null);
      toast.success("Session submitted successfully!");

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
    addPhoto,
    removePhoto,
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
    addPhoto,
    removePhoto,
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
