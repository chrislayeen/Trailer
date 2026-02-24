import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Flashlight } from 'lucide-react';
import { toast } from 'sonner';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useTranslation } from 'react-i18next';
import { useSession } from '../context/SessionContext';

const Scanner = () => {
    const navigate = useNavigate();
    const { startNewSession } = useSession();
    const { t } = useTranslation();
    const [isScanning, setIsScanning] = useState(false);
    const [hasScanned, setHasScanned] = useState(false);
    const [error, setError] = useState(null);
    const [torchEnabled, setTorchEnabled] = useState(false);
    const [hasTorch, setHasTorch] = useState(false);
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                if (html5QrCodeRef.current.isScanning) {
                    html5QrCodeRef.current.stop()
                        .then(() => html5QrCodeRef.current.clear())
                        .catch(err => console.warn("Scanner stop error on unmount", err));
                } else {
                    html5QrCodeRef.current.clear();
                }
            }
            // Stop any lingering media tracks
            const video = document.querySelector('video');
            if (video && video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startScanner = async () => {
        setError(null);
        setIsScanning(true);
        setHasScanned(false);

        try {
            const permission = await navigator.mediaDevices.getUserMedia({ video: true });
            // Stop the stream immediately, just checking permissions
            permission.getTracks().forEach(track => track.stop());
        } catch (err) {
            console.error("Camera permission denied", err);
            setError(t('scan.camera_perm_denied'));
            setIsScanning(false);
            return;
        }

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        };

        const html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;

        try {
            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // ignore frame parse errors
                }
            ).then(() => {
                // Check for torch capability after start
                const videoTrack = html5QrCode.getRunningTrackCameraCapabilities();

                // Let's try to get the track from the video element directly as a fallback guarantees access
                const videoElement = document.querySelector("#reader video");
                if (videoElement && videoElement.srcObject) {
                    const track = videoElement.srcObject.getVideoTracks()[0];
                    if (track) {
                        const capabilities = track.getCapabilities();
                        if (capabilities.torch) {
                            setHasTorch(true);
                        }
                    }
                }
            });
        } catch (err) {
            console.error("Error starting scanner", err);
            setError(t('scan.camera_start_error'));
            setIsScanning(false);
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            try {
                if (html5QrCodeRef.current.isScanning) {
                    await html5QrCodeRef.current.stop();
                    html5QrCodeRef.current.clear();
                }

                // Brute force stop all tracks
                const stream = document.querySelector('video')?.srcObject;
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }

                setIsScanning(false);
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
        }
    };

    const handleScanSuccess = (decodedText) => {
        if (hasScanned) return;

        console.log("Scanned Value:", decodedText); // Audit Log

        const cleanText = decodedText.trim();

        // 1. URL Format: https://notification.test.imetricsbv.com/XL90D151824467926/
        const urlMatch = cleanText.match(/imetricsbv\.com\/([A-Z0-9]+)\/?$/i);

        // 2. Key-Value Pattern (Chassis: ID, VIN 123, etc.)
        const kvMatch = cleanText.match(/(?:chassis|vin|trailer|vehicle|unit|number|nr|id|vehicule)[\W_: ]+([A-Z0-9\-]+)/i);

        // 3. Broad ID Regex (3-30 chars, alphanumeric + hyphens)
        const idRegex = /^[A-Z0-9\-]{3,30}$/i;

        // 4. Vehicle Mention Verification
        const vehicleKeywords = ['chassis', 'vin', 'trailer', 'vehicle', 'unit', 'vehicule'];
        const hasVehicleMention = vehicleKeywords.some(k => cleanText.toLowerCase().includes(k));

        let isValid = false;
        let chassisId = cleanText;

        if (urlMatch && urlMatch[1]) {
            isValid = true;
            chassisId = urlMatch[1];
        } else if (kvMatch && kvMatch[1]) {
            isValid = true;
            chassisId = kvMatch[1];
        } else if (idRegex.test(cleanText) || hasVehicleMention) {
            isValid = true;
            // If it's a mention like "Trailer 101", we'll just use the whole string but trim to sensible length
            chassisId = cleanText.substring(0, 30);
        }

        if (isValid) {
            setHasScanned(true); // Lock to prevent duplicates

            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().then(async () => {
                    html5QrCodeRef.current.clear();
                    setIsScanning(false);
                    try {
                        await startNewSession(chassisId);
                        toast.success(t('scan.session_started', { id: chassisId }));
                        navigate('/session-start');
                    } catch (e) {
                        // Error handled in context
                        setIsScanning(false);
                    }
                }).catch(err => console.error("Failed to stop after success", err));
            }
        } else {
            // Mismatch
            setHasScanned(true);
            toast.error(t('scan.invalid_qr', { code: cleanText }));

            // Allow retry after 2 seconds (Debounce)
            setTimeout(() => {
                setHasScanned(false);
            }, 2000);
        }
    };

    const [showManualInput, setShowManualInput] = useState(false);
    const [manualId, setManualId] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (showManualInput && inputRef.current) {
            inputRef.current.focus();
            setTimeout(() => {
                inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [showManualInput]);

    const handleManualEntry = () => {
        setShowManualInput(!showManualInput);
        if (!showManualInput) {
            // Turning Manual Mode ON: Stop Scanner
            stopScanner();
            setIsScanning(false);
            setHasScanned(false);
            setTorchEnabled(false); // Reset torch
        }
    };

    const toggleTorch = () => {
        const videoElement = document.querySelector("#reader video");
        if (videoElement && videoElement.srcObject) {
            const track = videoElement.srcObject.getVideoTracks()[0];
            if (track) {
                track.applyConstraints({
                    advanced: [{ torch: !torchEnabled }]
                }).then(() => {
                    setTorchEnabled(!torchEnabled);
                }).catch(err => console.error("Torch toggle failed", err));
            }
        }
    };

    const handleManualSubmit = (e) => {
        if (e) e.preventDefault();
        const cleanId = manualId.trim();

        const urlMatch = cleanId.match(/imetricsbv\.com\/([A-Z0-9]+)\/?$/i);
        const kvMatch = cleanId.match(/(?:chassis|vin|trailer|vehicle|unit|number|nr|id|vehicule)[\W_: ]+([A-Z0-9\-]+)/i);
        const idRegex = /^[A-Z0-9\-]{3,30}$/i;
        const vehicleKeywords = ['chassis', 'vin', 'trailer', 'vehicle', 'unit', 'vehicule'];
        const hasVehicleMention = vehicleKeywords.some(k => cleanId.toLowerCase().includes(k));

        let isValid = false;
        let chassisId = cleanId;

        if (urlMatch && urlMatch[1]) {
            isValid = true;
            chassisId = urlMatch[1];
        } else if (kvMatch && kvMatch[1]) {
            isValid = true;
            chassisId = kvMatch[1];
        } else if (idRegex.test(cleanId) || hasVehicleMention) {
            isValid = true;
            chassisId = cleanId.substring(0, 30);
        }

        if (isValid) {
            stopScanner().then(async () => {
                try {
                    await startNewSession(chassisId);
                    toast.success(t('scan.session_started', { id: chassisId }));
                    navigate('/session-start');
                } catch (e) {
                    // Error handled in context
                }
            });
        } else {
            toast.error(t('scan.invalid_chassis'));
        }
    };

    // Manual Close
    const handleClose = () => {
        stopScanner().then(() => navigate('/'));
    }

    return (
        <div style={{
            position: 'relative',
            inset: 0,
            background: 'linear-gradient(180deg, #1f2937 0%, #0f172a 100%)', // Dark Slate/Gray gradient
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
            minHeight: 'calc(100vh - 64px)',
            overflow: showManualInput ? 'auto' : 'hidden', // Allow scroll when keyboard is likely open
            WebkitOverflowScrolling: 'touch'
        }}>
            {/* Unified Layout Header takes care of the top bar */}
            {hasTorch && (
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 100
                }}>
                    <button
                        onClick={toggleTorch}
                        style={{
                            background: torchEnabled ? 'rgba(255, 255, 255, 1)' : 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: torchEnabled ? 'black' : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <Flashlight size={20} />
                    </button>
                </div>
            )}

            {/* Camera View Area */}
            <div
                className="scanner-viewport-area"
                style={{
                    flex: '1 1 auto',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'black',
                    width: '100%',
                    overflow: 'hidden',
                    maxHeight: 'calc(100vh - 200px)' // Ensure footer is always visible or pulling up
                }}
            >

                {/* ID for html5-qrcode */}
                <div id="reader" style={{ width: '100%', maxWidth: '500px', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '12px' }}></div>

                {!isScanning && !error && (
                    <div style={{ position: 'absolute', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={startScanner}
                            style={{
                                padding: '1rem 2rem',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '999px',
                                fontWeight: 600,
                                fontSize: '1.2rem',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                                cursor: 'pointer'
                            }}
                        >
                            {t('scan.start_scan')}
                        </button>
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{t('scan.camera_inactive')}</p>
                    </div>
                )}

                {error && (
                    <div style={{ position: 'absolute', zIndex: 10, textAlign: 'center', padding: '2rem' }}>
                        <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: '1rem' }}>{error}</p>
                        <button
                            onClick={startScanner}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            {t('scan.retry')}
                        </button>
                    </div>
                )}


                {/* Scan Overlay (Only visible when scanning) */}
                {isScanning && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Scan Frame */}
                        <div style={{
                            width: '250px',
                            height: '250px',
                            aspectRatio: '1/1',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '24px',
                            position: 'relative',
                            boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.5)' // Darkens outside
                        }}>
                            {/* Blue Corners */}
                            <div style={{ position: 'absolute', top: -2, left: -2, width: 40, height: 40, borderTop: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderTopLeftRadius: '24px' }}></div>
                            <div style={{ position: 'absolute', top: -2, right: -2, width: 40, height: 40, borderTop: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderTopRightRadius: '24px' }}></div>
                            <div style={{ position: 'absolute', bottom: -2, left: -2, width: 40, height: 40, borderBottom: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderBottomLeftRadius: '24px' }}></div>
                            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 40, height: 40, borderBottom: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderBottomRightRadius: '24px' }}></div>

                            {/* Scanning Bar */}
                            <div style={{
                                position: 'absolute',
                                top: '10%',
                                left: '5%',
                                right: '5%',
                                height: '2px',
                                background: 'var(--primary)',
                                boxShadow: '0 0 10px var(--primary)',
                                animation: 'scan 2s infinite ease-in-out'
                            }}></div>
                        </div>

                        {/* Hint */}
                        <div style={{ position: 'absolute', top: '70%', left: 0, right: 0, textAlign: 'center', marginTop: '2rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '20px' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }}></div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t('scan.align_qr')}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div
                className="scanner-footer-actions"
                style={{
                    padding: '2rem',
                    paddingBottom: showManualInput ? '12rem' : '3.5rem', // Extra space for keyboard
                    zIndex: 20,
                    background: '#0f172a',
                    transition: 'padding-bottom 0.3s',
                    flexShrink: 0
                }}
            >
                {!showManualInput ? (
                    <button
                        onClick={handleManualEntry}
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            margin: '0 auto',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '16px',
                            color: 'white',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        {t('scan.enter_manually')}
                    </button>
                ) : (
                    <form onSubmit={handleManualSubmit} style={{ width: '100%', maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={manualId}
                            onChange={(e) => setManualId(e.target.value)}
                            placeholder={t('scan.manual_placeholder')}
                            onFocus={(e) => {
                                // Standard mobile behavior: wait for keyboard, then scroll
                                setTimeout(() => {
                                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 300);
                            }}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'rgba(255,255,255,0.9)',
                                color: 'black',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => setShowManualInput(false)}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                {t('scan.cancel')}
                            </button>
                            <button
                                type="submit"
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                {t('scan.submit')}
                            </button>
                        </div>
                    </form>
                )}

            </div>

            <style>{`
            @keyframes scan {
                0% { top: 10%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 90%; opacity: 0; }
            }
            /* Hide HTML5-QRCode elements we don't want */
            #reader__scan_region {
                background: transparent !important;
            }
            #reader video {
                object-fit: cover !important;
                width: 100% !important;
                height: 100% !important;
                border-radius: 12px !important;
            }
            @media (min-width: 768px) {
                .scanner-viewport-area {
                    max-height: 60vh !important;
                    margin: 2rem 0;
                }
                .scanner-footer-actions {
                    padding-top: 1rem !important;
                    padding-bottom: 3rem !important;
                }
            }
        `}</style>
        </div>
    );
};

export default Scanner;
