import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '../context/SessionContext';
import { Button, Input } from '../components/UI';
import { MapPin, Camera, Trash2, Upload, MessageSquare, Image as ImageIcon, ChevronLeft, Map as MapIcon, RotateCcw, Flashlight } from 'lucide-react';

import { toast } from 'sonner';

const PhotoCapture = () => {
    const navigate = useNavigate();
    const { currentSession, addPhoto, removePhoto, updateLocationStatus, submitSession, updateSessionComment } = useSession();
    const { t } = useTranslation();
    const [cameraOpen, setCameraOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coords, setCoords] = useState({ lat: null, lng: null });
    const [manualMode, setManualMode] = useState(false);
    const [torchEnabled, setTorchEnabled] = useState(false);
    const [hasTorch, setHasTorch] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Geolocation Effect
    useEffect(() => {
        if (manualMode) return; // Skip auto-fetch if in manual mode

        if ("geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    if (!manualMode) {
                        setCoords({
                            lat: position.coords.latitude.toFixed(4),
                            lng: position.coords.longitude.toFixed(4)
                        });
                        updateLocationStatus(true, 'gps');
                    }
                },
                (error) => {
                    console.error("Error getting location", error);
                    if (!manualMode) {
                        setCoords(prev => prev.lat ? prev : { lat: '34.0522', lng: '-118.2437' }); // Only fallback if no data
                        updateLocationStatus(false, 'manual');
                    }
                }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            if (!manualMode) {
                setCoords({ lat: '34.0522', lng: '-118.2437' });
                updateLocationStatus(false, 'manual');
            }
        }
    }, [manualMode, updateLocationStatus]);

    const handleManualCoordChange = (field, value) => {
        setCoords(prev => ({ ...prev, [field]: value }));
        updateLocationStatus(true, 'manual');
    };

    // Camera Functions
    const startCamera = async () => {
        try {
            setCameraOpen(true);
            // Small delay to ensure DOM is ready if conditionally rendered, 
            // though React state update should handle it. 
            // We'll wait for the next tick to stick the stream.
            setTimeout(async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;

                        // Check Torch
                        const track = stream.getVideoTracks()[0];
                        if (track) {
                            const capabilities = track.getCapabilities();
                            if (capabilities.torch) {
                                setHasTorch(true);
                            }
                        }
                    }
                } catch (innerErr) {
                    console.error("Camera stream error:", innerErr);
                    toast.error(t('scan.camera_perm_denied'));
                    setCameraOpen(false);
                }
            }, 100);
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast.error(t('scan.camera_start_error'));
            setCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraOpen(false);
        setTorchEnabled(false);
        setHasTorch(false);
    };

    const toggleTorch = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const track = videoRef.current.srcObject.getVideoTracks()[0];
            if (track) {
                track.applyConstraints({
                    advanced: [{ torch: !torchEnabled }]
                }).then(() => {
                    setTorchEnabled(!torchEnabled);
                }).catch(err => console.error("Torch toggle failed", err));
            }
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

            // Async upload
            const uploadPromise = addPhoto(dataUrl);

            // Haptic feedback if available
            if (navigator.vibrate) navigator.vibrate(50);

            // Context handles success toast
            stopCamera();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await submitSession();
            // submitSession context handles toast
            navigate('/confirmation');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentSession) return null;

    return (
        <div style={{ paddingBottom: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>{t('session.chassis_number')}</label>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{currentSession.chassis_id}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', background: '#ecfdf5', color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }}></div> {t('session.session_active')}
                </div>
            </div>

            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>{t('session.existing_images')}</label>

            {/* Image Grid */}
            <div style={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                padding: '1rem',
                marginBottom: '1.5rem',
                minHeight: '200px',
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                border: '2px dashed var(--color-gray-200)'
            }}>
                {currentSession.photos.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gray-400)' }}>
                        <ImageIcon size={48} strokeWidth={1} style={{ marginBottom: '10px', opacity: 0.5 }} />
                        <p>{t('session.no_images')}</p>
                    </div>
                ) : (
                    currentSession.photos.map(photo => (
                        <div key={photo.id} style={{ flex: '0 0 160px', height: '160px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
                            <img src={photo.data || photo.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button onClick={() => removePhoto(photo.id)} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,255,255,0.9)', borderRadius: '50%', padding: '6px', color: 'var(--color-error)', border: 'none', cursor: 'pointer' }}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <Button variant="primary" fullWidth onClick={() => document.getElementById('file-upload').click()} style={{ background: 'var(--color-primary)', display: 'flex', gap: '8px' }}>
                    <ImageIcon size={20} /> {t('session.select_gallery')}
                </Button>
                {/* Hidden File Input for Demo */}
                <input id="file-upload" type="file" style={{ display: 'none' }} onChange={(e) => {
                    if (e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (ev) => addPhoto(ev.target.result);
                        reader.readAsDataURL(e.target.files[0]);
                    }
                }} />

                <Button variant="primary" fullWidth onClick={startCamera} style={{ background: 'var(--color-primary-dark)', display: 'flex', gap: '8px' }}>
                    <Camera size={20} /> {t('session.capture_images')}
                </Button>
            </div>

            {/* Comments */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: 'var(--color-gray-600)', fontWeight: 600, fontSize: '0.9rem' }}>
                    <MessageSquare size={18} /> {t('session.add_comment')}
                </div>
                <textarea
                    placeholder={t('session.comment_placeholder')}
                    value={currentSession.comments || ''}
                    onChange={(e) => updateSessionComment(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-gray-200)',
                        minHeight: '100px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                    }}
                />
            </div>

            {/* GPS Location Card */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-xl)', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                        <MapPin size={20} color="var(--color-primary)" /> {t('session.gps_location')}
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--color-gray-500)', cursor: 'pointer' }}>
                        {/* Interactive Toggle */}
                        <div style={{ width: '36px', height: '20px', background: manualMode ? 'var(--color-primary)' : '#e5e7eb', borderRadius: '999px', position: 'relative', transition: 'background 0.2s' }}>
                            <div style={{ position: 'absolute', left: manualMode ? '18px' : '2px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }}></div>
                        </div>
                        <input type="checkbox" checked={manualMode} onChange={() => setManualMode(!manualMode)} style={{ display: 'none' }} />
                        {t('session.manual_entry')}
                    </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>{t('session.latitude')}</label>
                        {manualMode ? (
                            <input
                                type="text"
                                value={coords.lat || ''}
                                onChange={(e) => handleManualCoordChange('lat', e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-primary)', marginTop: '4px', fontWeight: 500, outline: 'none' }}
                            />
                        ) : (
                            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-200)', marginTop: '4px', fontWeight: 500, background: '#f9fafb' }}>
                                {coords.lat || t('session.fetching')}
                            </div>
                        )}
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>{t('session.longitude')}</label>
                        {manualMode ? (
                            <input
                                type="text"
                                value={coords.lng || ''}
                                onChange={(e) => handleManualCoordChange('lng', e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-primary)', marginTop: '4px', fontWeight: 500, outline: 'none' }}
                            />
                        ) : (
                            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-200)', marginTop: '4px', fontWeight: 500, background: '#f9fafb' }}>
                                {coords.lng || t('session.fetching')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Map Visual */}
                <div style={{ height: '180px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <div style={{ width: '30px', height: '30px', background: 'rgba(29, 78, 216, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s infinite' }}>
                            <div style={{ width: '12px', height: '12px', background: 'var(--color-primary)', borderRadius: '50%', border: '2px solid white' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit */}
            <Button
                fullWidth
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || currentSession.photos.length === 0}
                style={{ padding: '1.25rem', fontSize: '1.1rem' }}
            >
                {isSubmitting ? t('session.submitting') : t('session.submit_images')} <ChevronLeft size={20} style={{ transform: 'rotate(180deg)' }} />
            </Button>


            {/* Camera Overlay with Grid */}
            {cameraOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'black', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                    {/* Constrained Container for Desktop */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        maxWidth: '800px', // max-w-3xl approx
                        maxHeight: '100%',
                        aspectRatio: '9/16', // Typical mobile aspect ratio, but we can be flexible
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>

                        <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
                            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />

                            {/* Grid Overlay */}
                            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr' }}>
                                <div style={{ borderRight: '1px solid rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.3)' }}></div>
                                <div style={{ borderRight: '1px solid rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.3)' }}></div>
                                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}></div>
                                <div style={{ borderRight: '1px solid rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.3)' }}></div>
                                <div style={{ borderRight: '1px solid rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: '8px', height: '8px', background: 'var(--color-primary)', borderRadius: '50%' }}></div>
                                </div>
                                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}></div>
                                <div style={{ borderRight: '1px solid rgba(255,255,255,0.3)' }}></div>
                                <div style={{ borderRight: '1px solid rgba(255,255,255,0.3)' }}></div>
                                <div></div>
                            </div>

                            {/* Top Bar */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
                                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '20px', color: 'white', fontSize: '0.8rem', letterSpacing: '1px' }}>
                                    {t('session.align_grid')}
                                </div>
                            </div>
                        </div>

                        {/* Controls - Positioned Absolute at Bottom for Desktop Overlay feel, or Relative for Flex flow. 
                            User asked for "Place below video OR overlay bottom-center".
                            In this constrained flex column, relative below video is safest for visibility.
                        */}
                        <div style={{ padding: '30px', background: 'black', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <button onClick={stopCamera} style={{ background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '50%', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <RotateCcw size={20} />
                            </button>

                            <button onClick={capturePhoto} style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'white', border: '4px solid rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid black' }}></div>
                            </button>

                            <div style={{ width: '48px', display: 'flex', justifyContent: 'center' }}>
                                {hasTorch && (
                                    <button onClick={toggleTorch} style={{ background: torchEnabled ? 'white' : 'rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '50%', color: torchEnabled ? 'black' : 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', cursor: 'pointer' }}>
                                        <Flashlight size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotoCapture;
