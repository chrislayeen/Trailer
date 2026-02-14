import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  // Persistent State: Driver Name
  const [driverName, setDriverName] = useState(() => {
    try {
      return localStorage.getItem('driverName') || '';
    } catch {
      return '';
    }
  });

  // Persistent State: All Sessions (History)
  const [sessions, setSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sessions') || '[]');
    } catch {
      return [];
    }
  });

  // Persistent State: Current Active Session (Recovery)
  const [currentSession, setCurrentSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('currentSession') || 'null');
    } catch {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState(false);

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem('driverName', driverName);
    } catch (e) {
      console.warn('LocalStorage limit exceeded or unavailable', e);
    }
  }, [driverName]);

  useEffect(() => {
    try {
      // Sanitize sessions: Remove large image data, keep metadata
      const sanitizedSessions = sessions.map(session => ({
        ...session,
        photos: session.photos.map(p => ({ ...p, data: null })) // Strip base64
      }));
      localStorage.setItem('sessions', JSON.stringify(sanitizedSessions));
    } catch (e) {
      console.warn('LocalStorage limit for sessions exceeded', e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      if (currentSession) {
        // Sanitize currentSession: Remove large image data
        const sanitizedSession = {
          ...currentSession,
          photos: currentSession.photos.map(p => ({ ...p, data: null }))
        };
        localStorage.setItem('currentSession', JSON.stringify(sanitizedSession));
      } else {
        localStorage.removeItem('currentSession');
      }
    } catch (e) {
      console.warn('LocalStorage limit for currentSession exceeded', e);
    }
  }, [currentSession]);

  // Actions (Memoized)
  const loginDriver = useCallback((name) => {
    setDriverName(name);
  }, []);

  const logoutDriver = useCallback(() => {
    setDriverName('');
    setCurrentSession(null);
  }, []);

  const startNewSession = useCallback((chassisId) => {
    setCurrentSession({
      id: Date.now().toString(),
      chassisId,
      startTime: new Date().toISOString(),
      photos: [],
      locationVerified: false,
      locationType: null, // 'gps' | 'manual'
      comment: ''
    });
  }, []);

  const updateLocationStatus = useCallback((status, type) => {
    setCurrentSession(prev => prev ? ({ ...prev, locationVerified: status, locationType: type }) : null);
  }, []);

  const updateSessionComment = useCallback((comment) => {
    setCurrentSession(prev => prev ? ({ ...prev, comment }) : null);
  }, []);

  const addPhoto = useCallback((photoDataUrl) => {
    setCurrentSession(prev => prev ? ({
      ...prev,
      photos: [...prev.photos, { id: Date.now(), data: photoDataUrl }]
    }) : null);
  }, []);

  const removePhoto = useCallback((photoId) => {
    setCurrentSession(prev => prev ? ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== photoId)
    }) : null);
  }, []);

  const submitSession = useCallback(() => {
    setCurrentSession(prev => {
      if (!prev) return null;
      const completedSession = {
        ...prev,
        endTime: new Date().toISOString(),
        driverName
      };
      setSessions(curr => [completedSession, ...curr]);
      return null; // Clear current session
    });
  }, [driverName]);

  const resetSession = useCallback(() => {
    setCurrentSession(null);
  }, []);

  const loginAdmin = useCallback((username, pin) => {
    if (username === 'admin' && pin === '123456') {
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
  }, []);

  // Memoize Context Value
  const value = React.useMemo(() => ({
    driverName,
    currentSession,
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
    loginAdmin,
    logoutAdmin
  }), [
    driverName,
    currentSession,
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
    loginAdmin,
    logoutAdmin
  ]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
