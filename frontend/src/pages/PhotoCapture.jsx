import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '../context/SessionContext';
import { Button, Input } from '../components/UI';
import { MapPin, Camera, Trash2, Upload, MessageSquare, Image as ImageIcon, ChevronLeft, Map as MapIcon, RotateCcw, Flashlight, X } from 'lucide-react';

import { toast } from 'sonner';
import { calculateBlurScore, calculateBrightness, applyPostProcessing } from '../utils/imageProcessing';

const PhotoCapture = () => {
    const navigate = useNavigate();
    const { currentSession, addPhoto, removePhoto, updateLocationStatus, submitSession, updateSessionComment, updateSessionCoords } = useSession();
    const { t } = useTranslation();
    const [cameraOpen, setCameraOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coords, setCoords] = useState({ lat: null, lng: null });
    const [manualMode, setManualMode] = useState(false);
    const [torchEnabled, setTorchEnabled] = useState(false);
    const [hasTorch, setHasTorch] = useState(false);
    const [qualityStatus, setQualityStatus] = useState({ blur: 0, brightness: 0, stable: true });
    const [exposure, setExposure] = useState(0);
    const [capturing, setCapturing] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const streamRef = useRef(null);
    const imageCaptureRef = useRef(null);

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
                        updateSessionCoords(position.coords.latitude, position.coords.longitude);
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
        const newCoords = { ...coords, [field]: value };
        setCoords(newCoords);
        updateSessionCoords(newCoords.lat, newCoords.lng);
        updateLocationStatus(true, 'manual');
    };

    const handleNativeCapture = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCapturing(true);
        try {
            // 1. Create bitmap from original file
            const bitmap = await createImageBitmap(file);
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            context.drawImage(bitmap, 0, 0);

            // 2. Smart QC Analysis (on high-res data)
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const blurScore = calculateBlurScore(imageData);
            const brightness = calculateBrightness(imageData);

            // Thresholds
            if (blurScore < 40) {
                toast.error("Image not sharp enough. Please retake with steady hands.", { position: 'top-center' });
                return;
            }
            if (brightness < 20) {
                toast.error("Image is too dark. Please use native flash or better light.", { position: 'top-center' });
                return;
            }

            // 3. Pro Post-Processing
            applyPostProcessing(context, canvas.width, canvas.height);

            // 4. High-Quality Export
            const dataUrl = canvas.toDataURL('image/jpeg', 0.98);

            await addPhoto(dataUrl);
            setCameraOpen(false);
            toast.success("Native Capture Verified");

        } catch (err) {
            console.error("Native capture processing error:", err);
            toast.error("Failed to process native photo.");
        } finally {
            setCapturing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const triggerNativeCamera = () => {
        setCameraOpen(true);
        if (fileInputRef.current) fileInputRef.current.click();
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
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>{t('session.chassis_number')}</label>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{currentSession.chassis_id}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', background: '#ecfdf5', color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }}></div> {t('session.session_active')}
                </div>
            </div>

            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>{t('session.existing_images')}</label>

            {/* Image Grid */}
            <div style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
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
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                        <MapPin size={20} color="var(--primary)" /> {t('session.gps_location')}
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--slate-500)', cursor: 'pointer' }}>
                        {/* Interactive Toggle */}
                        <div style={{ width: '36px', height: '20px', background: manualMode ? 'var(--primary)' : '#e5e7eb', borderRadius: '999px', position: 'relative', transition: 'background 0.2s' }}>
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
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--primary)', marginTop: '4px', fontWeight: 500, outline: 'none' }}
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
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--primary)', marginTop: '4px', fontWeight: 500, outline: 'none' }}
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
                            <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '50%', border: '2px solid white' }}></div>
                        </div>
                    </div>
                </div>
                {/* Native Capture Launcher */}
                <div style={{ padding: '64px 32px', textAlign: 'center', background: 'var(--slate-50)', borderRadius: '20px', border: '2px dashed var(--slate-200)', marginBottom: '24px' }}>
                    <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--shadow-sm)' }}>
                        <Camera size={40} color="var(--primary)" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>Device-Native Pro Capture</h3>
                    <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', maxWidth: '280px', margin: '12px auto 32px', lineHeight: '1.6' }}>
                        Capture original Full-Sensors JPGs using your <strong>Phone's Native Camera App</strong> for maximum HDR and noise reduction.
                    </p>

                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        capture="environment"
                        onChange={handleNativeCapture}
                        style={{ display: 'none' }}
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    <Button
                        variant="primary"
                        onClick={triggerNativeCamera}
                        disabled={capturing}
                        style={{ padding: '1.25rem 2rem', fontWeight: 800, fontSize: '1rem' }}
                    >
                        {capturing ? 'PROCESSING HQ FILE...' : 'LAUNCH SYSTEM CAMERA'}
                    </Button>
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
        </div>
    );
};

export default PhotoCapture;
