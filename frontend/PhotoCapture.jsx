import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '../context/SessionContext';
import { Button } from '../components/UI';
import { MapPin, Camera, Trash2, Upload, MessageSquare, CloudUpload, CheckCircle, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { calculateBlurScore, calculateBrightness, applyPostProcessing } from '../utils/imageProcessing';
import { motion, AnimatePresence } from 'framer-motion';

const PhotoCapture = () => {
    const navigate = useNavigate();
    const { currentSession, addPhoto, removePhoto, updateLocationStatus, submitSession, updateSessionCoords, resetSession } = useSession();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [photoNotes, setPhotoNotes] = useState({});
    const [uploadState, setUploadState] = useState({ show: false, status: 'idle', count: 0 });
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
                    toast.error(`Image "${file.name}" not sharp enough.`, { position: 'top-center' });
                    continue;
                }
                if (brightness < 20) {
                    toast.error(`Image "${file.name}" is too dark.`, { position: 'top-center' });
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
                toast.success(`Optimized & Verified ${processedCount} images`);
            }
        } catch (err) {
            console.error("Image processing error:", err);
            toast.error("Failed to process some photos.");
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
        const count = currentSession.photos.length;

        // Show Loading UI immediately
        setUploadState({ show: true, status: 'loading', count: 0 });

        try {
            const combinedNotes = Object.entries(photoNotes)
                .filter(([_, note]) => note.trim() !== '')
                .map(([id, note], index) => `Photo ${index + 1}: ${note}`)
                .join('\n');

            await submitSession(combinedNotes || null);

            // Show Success UI
            setUploadState({ show: true, status: 'success', count });
            setPhotoNotes({});

            setTimeout(() => {
                setUploadState({ show: false, status: 'idle', count: 0 });
            }, 2500);

        } catch (error) {
            console.error(error);
            setUploadState({ show: false, status: 'idle', count: 0 });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteSession = () => {
        resetSession();
        navigate('/');
    };

    if (!currentSession) return null;

    return (
        <div style={{ paddingBottom: '90px' }}>
            {/* Header Block Matches Mockup */}
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>CHASSIS</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>{currentSession.chassis_id}</div>
                </div>
                <div style={{ border: '1px solid #10b981', color: '#10b981', background: '#ecfdf5', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} /> GPS LOCK
                </div>
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
                                Securely Uploaded
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
                                onClick={() => setPreviewImage(photo.data || photo.url)}
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
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'linear-gradient(to top, rgba(16,185,129,0.3) 0%, transparent 40%)'
                                }}></div>
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
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                <button onClick={triggerGallery} disabled={capturing} style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '999px', color: '#111827', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Upload size={18} /> Upload File
                </button>
                <button onClick={triggerNativeCamera} disabled={capturing} style={{ flex: 1, padding: '14px', background: '#2563eb', border: 'none', borderRadius: '999px', color: 'white', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
                    <Camera size={18} /> Capture
                </button>
            </div>

            {/* Captured Items */}
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.5px' }}>
                CAPTURED ITEMS ({currentSession.photos.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                {currentSession.photos.map(photo => (
                    <div key={photo.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                <img src={photo.data || photo.url} alt="Captured item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: photo.gps_lat ? '#10b981' : '#f59e0b' }}></div>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#4b5563', letterSpacing: '0.5px' }}>
                                        {photo.gps_lat ? 'UPLOADED' : 'PENDING'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>
                                    {new Date(photo.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div style={{ fontSize: '13px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MapPin size={12} color={photo.gps_lat ? "#10b981" : "#f59e0b"} />
                                    {photo.gps_lat ? 'GPS Logged' : 'No GPS'}
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
                                placeholder="Tap to add notes..."
                                value={photoNotes[photo.id] || ''}
                                onChange={(e) => handleNoteChange(photo.id, e.target.value)}
                                style={{ width: '100%', background: '#f9fafb', border: 'none', padding: '14px 16px 14px 40px', borderRadius: '12px', fontSize: '14px', color: '#374151', outline: 'none' }}
                            />
                        </div>
                    </div>
                ))}
            </div>


            {/* Bottom Floating Submit Action */}
            <div style={{ position: 'fixed', bottom: '24px', left: 0, right: 0, padding: '0 24px', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', pointerEvents: 'none' }}>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || currentSession.photos.length === 0}
                    style={{
                        pointerEvents: 'auto',
                        width: '100%',
                        maxWidth: '400px',
                        padding: '16px',
                        background: '#2563eb',
                        color: 'white',
                        borderRadius: '999px',
                        fontSize: '16px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                        opacity: (isSubmitting || currentSession.photos.length === 0) ? 0.6 : 1,
                        cursor: (isSubmitting || currentSession.photos.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                >
                    <CloudUpload size={20} /> {isSubmitting ? 'Uploading...' : 'Upload All Photos'}
                </button>

                <button
                    onClick={handleCompleteSession}
                    style={{
                        pointerEvents: 'auto',
                        width: '100%',
                        maxWidth: '400px',
                        padding: '16px',
                        background: 'white',
                        color: '#4b5563',
                        borderRadius: '999px',
                        border: '1px solid #e5e7eb',
                        fontSize: '15px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                >
                    Finish Session
                </button>
            </div>
            {/* Upload Status Overlay Animation */}
            <AnimatePresence>
                {uploadState.show && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(255, 255, 255, 0.95)', zIndex: 1000,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            padding: '24px', textAlign: 'center'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <div style={{ marginBottom: '24px', position: 'relative', width: '104px', height: '104px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AnimatePresence mode="wait">
                                    {uploadState.status === 'loading' ? (
                                        <motion.div
                                            key="loader"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1, rotate: 360 }}
                                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                            transition={{ rotate: { repeat: Infinity, duration: 1, ease: "linear" } }}
                                            style={{ display: 'flex', background: '#eff6ff', borderRadius: '50%', padding: '24px', boxShadow: '0 12px 32px rgba(37, 99, 235, 0.15)' }}
                                        >
                                            <Loader2 size={56} color="#3b82f6" strokeWidth={2.5} />
                                        </motion.div>
                                    ) : (
                                        <motion.svg
                                            key="check"
                                            width="104"
                                            height="104"
                                            viewBox="0 0 104 104"
                                            fill="none"
                                            initial="hidden"
                                            animate="visible"
                                            style={{ filter: 'drop-shadow(0px 8px 16px rgba(59, 130, 246, 0.3))' }}
                                        >
                                            <motion.circle
                                                cx="52" cy="52" r="52"
                                                fill="#3b82f6"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", damping: 14, stiffness: 200 }}
                                            />
                                            <motion.path
                                                d="M32 54 L46 68 L74 36"
                                                stroke="white"
                                                strokeWidth="8"
                                                strokeLinecap="square"
                                                strokeLinejoin="miter"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
                                            />
                                        </motion.svg>
                                    )}
                                </AnimatePresence>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={uploadState.status}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                                    transition={{ delay: 0.1 }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                >
                                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '12px', letterSpacing: '-0.5px' }}>
                                        {uploadState.status === 'loading' ? 'Uploading...' : 'Upload Complete'}
                                    </div>
                                    <div style={{ fontSize: '18px', color: '#6b7280', fontWeight: 500, lineHeight: '1.5' }}>
                                        {uploadState.status === 'loading' ? (
                                            <>Securely transferring photos to<br /></>
                                        ) : (
                                            <>{uploadState.count} {uploadState.count === 1 ? 'photo' : 'photos'} securely uploaded to<br /></>
                                        )}
                                        <span style={{ fontWeight: 800, color: '#2563eb' }}>{currentSession.chassis_id}</span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            src={previewImage}
                            alt="Preview"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PhotoCapture;
