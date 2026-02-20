import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '../context/SessionContext';
import { Button } from '../components/UI';
import { MapPin, Camera, Trash2, Upload, MessageSquare, CloudUpload, CheckCircle, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { calculateBlurScore, calculateBrightness, applyPostProcessing } from '../utils/imageProcessing';
import { motion, AnimatePresence } from 'framer-motion';

const PhotoCapture = () => {
    const navigate = useNavigate();
    const { currentSession, addPhoto, removePhoto, updateLocationStatus, submitSession, updateSessionCoords, resetSession, logoutDriver } = useSession();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [photoNotes, setPhotoNotes] = useState({});

    const [previewImage, setPreviewImage] = useState(null);

    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    // Geolocation Effect (Auto-fetch)
    useEffect(() => {
        if ("geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    updateSessionCoords(position.coords.latitude, position.coords.longitude);
                    updateLocationStatus(true, 'gps');
                },
                (error) => {
                    console.error("Error getting location", error);
                    updateLocationStatus(false, 'manual');
                }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            updateLocationStatus(false, 'manual');
        }
    }, [updateLocationStatus]);

    const handleNativeCapture = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setCapturing(true);
        let processedCount = 0;

        try {
            for (const file of files) {
                const bitmap = await createImageBitmap(file);
                const MAX_DIMENSION = 2560;
                let width = bitmap.width;
                let height = bitmap.height;

                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
                    width = Math.floor(width * scale);
                    height = Math.floor(height * scale);
                }

                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                canvas.width = width;
                canvas.height = height;
                context.drawImage(bitmap, 0, 0, width, height);

                const imageData = context.getImageData(0, 0, width, height);
                const blurScore = calculateBlurScore(imageData);
                const brightness = calculateBrightness(imageData);

                if (blurScore < 40) {
                    toast.error(t('session.blur_error', { name: file.name }), { position: 'top-center' });
                    continue;
                }
                if (brightness < 20) {
                    toast.error(t('session.dark_error', { name: file.name }), { position: 'top-center' });
                    continue;
                }

                applyPostProcessing(context, width, height);

                let dataUrl = canvas.toDataURL('image/webp', 0.85);
                if (dataUrl.startsWith('data:image/png')) {
                    dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                }

                await addPhoto(dataUrl);
                processedCount++;
            }

            if (processedCount > 0) {
                toast.success(t('session.optimized_verified', { count: processedCount }));
            }
        } catch (err) {
            console.error("Image processing error:", err);
            toast.error(t('session.processing_error'));
        } finally {
            setCapturing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (galleryInputRef.current) galleryInputRef.current.value = '';
        }
    };

    const triggerNativeCamera = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const triggerGallery = () => {
        if (galleryInputRef.current) galleryInputRef.current.click();
    };

    const handleNoteChange = (id, value) => {
        setPhotoNotes(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const combinedNotes = Object.entries(photoNotes)
                .filter(([_, note]) => note.trim() !== '')
                .map(([, note], index) => `Photo ${index + 1}: ${note}`)
                .join('\n');

            await submitSession(combinedNotes || null);

            setPhotoNotes({});
            toast.success(t('session.upload_success'));

        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteSession = () => {
        resetSession();
        logoutDriver();
        navigate('/');
    };

    useEffect(() => {
        if (!currentSession) {
            navigate('/');
        }
    }, [currentSession, navigate]);

    if (!currentSession) return null;

    return (
        <div style={{ paddingBottom: '90px' }}>
            {/* Header Block Matches Mockup */}
            <div style={{ background: 'white', padding: '16px 20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '4px' }}>{t('session.chassis')}</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>{currentSession.chassis_id}</div>
                    </div>
                    {currentSession.location_verified ? (
                        <div style={{ width: 'fit-content', height: 'fit-content', border: '1px solid #10b981', color: '#10b981', background: '#eafff2', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} strokeWidth={2.5} /> {t('session.gps_lock')}
                        </div>
                    ) : (
                        <div style={{ width: 'fit-content', height: 'fit-content', border: '1px solid #f59e0b', color: '#d97706', background: '#fffbeb', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} strokeWidth={2.5} /> {t('session.gps_failed')}
                        </div>
                    )}
                </div>
                {!currentSession.location_verified && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <input
                            type="number"
                            step="any"
                            placeholder={`${t('session.latitude')} (e.g. 34.05)`}
                            value={currentSession.gps_lat ?? ''}
                            onChange={(e) => updateSessionCoords(e.target.value !== '' ? e.target.value : null, currentSession.gps_lng ?? null)}
                            style={{ flex: 1, minWidth: 0, width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #fbbf24', background: '#fffbeb', fontSize: '14px', outline: 'none', color: '#b45309', fontWeight: 600 }}
                        />
                        <input
                            type="number"
                            step="any"
                            placeholder={`${t('session.longitude')} (e.g. -118.24)`}
                            value={currentSession.gps_lng ?? ''}
                            onChange={(e) => updateSessionCoords(currentSession.gps_lat ?? null, e.target.value !== '' ? e.target.value : null)}
                            style={{ flex: 1, minWidth: 0, width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #fbbf24', background: '#fffbeb', fontSize: '14px', outline: 'none', color: '#b45309', fontWeight: 600 }}
                        />
                    </div>
                )}
            </div>

            {/* Hidden inputs */}
            <input type="file" ref={galleryInputRef} accept="image/*" onChange={handleNativeCapture} style={{ display: 'none' }} />
            <input type="file" ref={fileInputRef} accept="image/*" capture="environment" onChange={handleNativeCapture} style={{ display: 'none' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Previously Uploaded Items Preview */}
            {currentSession.uploadedPhotos && currentSession.uploadedPhotos.length > 0 && (
                <div style={{
                    marginBottom: '32px',
                    background: 'white',
                    padding: '20px',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                    border: '1px solid rgba(0,0,0,0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ background: '#ecfdf5', padding: '6px', borderRadius: '8px' }}>
                                <CheckCircle size={14} color="#10b981" strokeWidth={3} />
                            </div>
                            <div style={{ fontSize: '13px', color: '#111827', fontWeight: 800, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                                {t('session.securely_uploaded')}
                            </div>
                        </div>
                        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, background: '#f3f4f6', padding: '4px 10px', borderRadius: '999px' }}>
                            {currentSession.uploadedPhotos.length}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                        {currentSession.uploadedPhotos.map((photo, i) => (
                            <div
                                key={photo.id}
                                onClick={() => setPreviewImage({
                                    url: photo.data || photo.url,
                                    comment: photo.comments || '',
                                    gpsLat: photo.gps_lat,
                                    gpsLng: photo.gps_lng,
                                    takenAt: photo.taken_at,
                                    chassisId: currentSession.chassis_id
                                })}
                                style={{
                                    width: '72px', height: '72px',
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    position: 'relative',
                                    border: '2px solid white',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    opacity: 0,
                                    cursor: 'pointer',
                                    animation: `fadeInRight 0.4s ease-out ${i * 0.05}s forwards` // Requires a global keyframe, or just omit if no pure CSS available inline easily, but we can do a simple translation
                                }}>
                                <img src={photo.data || photo.url} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ))}
                    </div>
                    {/* Inline styles for the animation if needed, but we can just use simple opacity 1 for safety to avoid injecting huge style blocks */}
                    <style>{`
                        @keyframes fadeInRight {
                            from { opacity: 0; transform: translateX(10px); }
                            to { opacity: 1; transform: translateX(0); }
                        }
                    `}</style>
                </div>
            )}

            {/* Upload / Capture Buttons */}
            {currentSession.photos.length === 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                    <button onClick={triggerGallery} disabled={capturing} style={{
                        padding: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#334155', fontSize: '15px', fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ background: '#f1f5f9', borderRadius: '50%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Upload size={20} color="#475569" strokeWidth={2.5} />
                        </div>
                        {t('session.upload_file')}
                    </button>
                    <button onClick={triggerNativeCamera} disabled={capturing} style={{
                        padding: '16px', background: '#2563eb', border: 'none', borderRadius: '16px', color: 'white', fontSize: '15px', fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                    }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Camera size={20} color="white" strokeWidth={2.5} />
                        </div>
                        {t('session.capture')}
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                    <button onClick={triggerGallery} disabled={capturing} style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', color: '#111827', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                        <Upload size={18} /> {t('session.upload_file')}
                    </button>
                    <button onClick={triggerNativeCamera} disabled={capturing} style={{ flex: 1, padding: '14px', background: '#2563eb', border: 'none', borderRadius: '16px', color: 'white', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
                        <Camera size={18} /> {t('session.capture')}
                    </button>
                </div>
            )}

            {/* Captured Items */}
            <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 700, marginBottom: '24px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                {t('session.captured_items', { count: currentSession.photos.length || 0 })}
            </div>

            {currentSession.photos.length === 0 && (!currentSession.uploadedPhotos || currentSession.uploadedPhotos.length === 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', textAlign: 'center' }}>
                    <div style={{ width: '96px', height: '96px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        <ImageIcon size={40} color="#cbd5e1" strokeWidth={1.5} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                        {t('session.no_photos_title')}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b', maxWidth: '250px', lineHeight: '1.5' }}>
                        {t('session.no_photos_desc')}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                {currentSession.photos.map(photo => (
                    <div key={photo.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div
                                onClick={() => setPreviewImage({
                                    url: photo.data || photo.url,
                                    comment: photoNotes[photo.id] || '',
                                    gpsLat: photo.gps_lat,
                                    gpsLng: photo.gps_lng,
                                    takenAt: photo.taken_at,
                                    chassisId: currentSession.chassis_id
                                })}
                                style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}
                            >
                                <img src={photo.data || photo.url} alt="Captured item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: photo.gps_lat ? '#10b981' : '#f59e0b' }}></div>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#4b5563', letterSpacing: '0.5px' }}>
                                        {photo.gps_lat ? t('session.uploaded') : t('session.pending')}
                                    </span>
                                </div>
                                <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>
                                    {new Date(photo.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div style={{ fontSize: '13px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MapPin size={12} color={photo.gps_lat ? "#10b981" : "#f59e0b"} />
                                    {photo.gps_lat ? t('session.gps_logged') : t('session.no_gps')}
                                </div>
                                <button onClick={() => removePhoto(photo.id)} style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                    <Trash2 size={20} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>
                        {/* Individual Notes Input */}
                        <div style={{ position: 'relative' }}>
                            <MessageSquare size={16} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder={t('session.tap_add_notes')}
                                value={photoNotes[photo.id] || ''}
                                onChange={(e) => handleNoteChange(photo.id, e.target.value)}
                                style={{ width: '100%', background: '#f9fafb', border: 'none', padding: '14px 16px 14px 40px', borderRadius: '12px', fontSize: '14px', color: '#374151', outline: 'none' }}
                            />
                        </div>
                    </div>
                ))}
            </div>


            {/* Bottom Floating Submit Action */}
            <div style={{ position: 'fixed', bottom: '24px', left: 0, right: 0, padding: '0 24px', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', pointerEvents: 'none' }}>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || currentSession.photos.length === 0}
                    style={{
                        pointerEvents: 'auto',
                        width: '100%',
                        maxWidth: '500px',
                        padding: '18px',
                        background: '#2563eb',
                        color: 'white',
                        borderRadius: '16px',
                        fontSize: '16px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                        opacity: (isSubmitting || currentSession.photos.length === 0) ? 0.5 : 1,
                        cursor: (isSubmitting || currentSession.photos.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                >
                    <CloudUpload size={22} strokeWidth={2.5} /> {isSubmitting ? t('session.uploading') : t('session.upload_photos')}
                </button>

                <button
                    onClick={handleCompleteSession}
                    style={{
                        pointerEvents: 'auto',
                        width: '100%',
                        maxWidth: '500px',
                        padding: '18px',
                        background: 'white',
                        color: '#4b5563',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        fontSize: '16px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                >
                    Logout
                </button>
            </div>


            {/* Full Screen Image Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setPreviewImage(null)}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0, 0, 0, 0.92)', zIndex: 2000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '24px', backdropFilter: 'blur(8px)'
                        }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.25)' }}
                            whileTap={{ scale: 0.9 }}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ delay: 0.1 }}
                            onClick={() => setPreviewImage(null)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', padding: '10px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <X size={24} />
                        </motion.button>
                        <motion.img
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            src={previewImage.url}
                            alt="Preview"
                            style={{ maxWidth: '100%', maxHeight: '85%', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        {(previewImage.comment || previewImage.chassisId) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ delay: 0.1 }}
                                style={{
                                    position: 'absolute',
                                    bottom: '32px',
                                    left: '24px',
                                    background: 'rgba(0,0,0,0.75)',
                                    color: 'white',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    maxWidth: 'calc(100% - 48px)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px'
                                }}
                            >
                                {previewImage.comment && (
                                    <div style={{ fontSize: '15px' }}>{previewImage.comment}</div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', color: '#cbd5e1', fontSize: '12px' }}>
                                    {previewImage.chassisId && (
                                        <span style={{ fontWeight: 800, color: 'white', letterSpacing: '0.5px' }}>{previewImage.chassisId}</span>
                                    )}
                                    {previewImage.takenAt && (
                                        <span>• {new Date(previewImage.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    )}
                                    {(previewImage.gpsLat || previewImage.gpsLng) && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            • <MapPin size={12} color="#10b981" />
                                            GPS {previewImage.gpsLat ? previewImage.gpsLat.toFixed(4) : ''}, {previewImage.gpsLng ? previewImage.gpsLng.toFixed(4) : ''}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PhotoCapture;
