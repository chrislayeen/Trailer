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
    const galleryInputRef = useRef(null);
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
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setCapturing(true);
        let processedCount = 0;

        try {
            for (const file of files) {
                // 1. Create bitmap and calculate optimal scale
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

                // 2. Smart QC Analysis (on optimized resolution)
                const imageData = context.getImageData(0, 0, width, height);
                const blurScore = calculateBlurScore(imageData);
                const brightness = calculateBrightness(imageData);

                // Threshold checks for ALL images
                if (blurScore < 40) {
                    toast.error(`Image "${file.name}" not sharp enough.`, { position: 'top-center' });
                    continue; // Skip this one, but continue with others
                }
                if (brightness < 20) {
                    toast.error(`Image "${file.name}" is too dark.`, { position: 'top-center' });
                    continue;
                }

                // 3. Pro Post-Processing
                applyPostProcessing(context, width, height);

                // 4. High-Efficiency Export (Visually Lossless)
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
            setCameraOpen(false);

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

            {/* Capture Actions */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
                <input
                    type="file"
                    ref={galleryInputRef}
                    accept="image/*"
                    onChange={handleNativeCapture}
                    style={{ display: 'none' }}
                />
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
                    variant="outline"
                    fullWidth
                    onClick={triggerGallery}
                    disabled={capturing}
                    style={{ padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600 }}
                >
                    <Upload size={18} style={{ marginRight: '8px' }} /> {t('session.select_images') || 'Select Images'}
                </Button>
                <Button
                    variant="primary"
                    fullWidth
                    onClick={triggerNativeCamera}
                    disabled={capturing}
                    style={{ padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600 }}
                >
                    <Camera size={18} style={{ marginRight: '8px' }} /> {capturing ? t('session.processing') || 'Processing...' : t('session.capture_images') || 'Capture Images'}
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
