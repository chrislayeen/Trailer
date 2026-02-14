import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Flashlight, AlignJustify } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '../context/SessionContext';

const Scanner = () => {
    const navigate = useNavigate();
    const { startNewSession } = useSession();
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        // Auto-scan simulation
        const timer = setTimeout(() => {
            if (isScanning) handleScanSuccess();
        }, 2500);
        return () => clearTimeout(timer);
    }, [isScanning]);

    const handleScanSuccess = () => {
        setIsScanning(false);
        // Simulate successful scan with random ID
        const simulatedId = 'XL90D015182' + Math.floor(10000 + Math.random() * 90000);
        startNewSession(simulatedId);
        toast.success(`Session Started: ${simulatedId}`);
        navigate('/session-start');
    };

    const handleManualEntry = () => {
        // For now, simulate a manual entry flow or allow input. 
        // Simplified: Start a session with a "MANUAL" prefix ID
        const manualId = 'MANUAL-' + Math.floor(1000 + Math.random() * 9000);
        startNewSession(manualId);
        navigate('/session-start');
    };

    return (
        <div style={{
            position: 'relative',
            inset: 0,
            background: 'linear-gradient(180deg, #1f2937 0%, #0f172a 100%)', // Dark Slate/Gray gradient
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
            minHeight: '100vh',
            height: '100%',
            overflow: 'hidden' // Prevent scrollbars
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'
            }}>
                <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                    <X size={24} />
                </button>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Scanner</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>Active Session</div>
                </div>
                <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                    <Flashlight size={20} />
                </button>
            </div>

            {/* Camera View Area */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Background pattern/gradient to simulate camera feed look */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 40%, rgba(15, 23, 42, 0.8) 100%)' }}></div>

                {/* Scan Frame */}
                <div style={{
                    width: '70%',
                    aspectRatio: '1/1',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '24px',
                    position: 'relative',
                    boxShadow: '0 0 0 4000px rgba(15, 23, 42, 0.5)' // Darkens outside
                }}>
                    {/* Blue Corners */}
                    <div style={{ position: 'absolute', top: -2, left: -2, width: 40, height: 40, borderTop: '4px solid #3b82f6', borderLeft: '4px solid #3b82f6', borderTopLeftRadius: '24px' }}></div>
                    <div style={{ position: 'absolute', top: -2, right: -2, width: 40, height: 40, borderTop: '4px solid #3b82f6', borderRight: '4px solid #3b82f6', borderTopRightRadius: '24px' }}></div>
                    <div style={{ position: 'absolute', bottom: -2, left: -2, width: 40, height: 40, borderBottom: '4px solid #3b82f6', borderLeft: '4px solid #3b82f6', borderBottomLeftRadius: '24px' }}></div>
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 40, height: 40, borderBottom: '4px solid #3b82f6', borderRight: '4px solid #3b82f6', borderBottomRightRadius: '24px' }}></div>

                    {/* Scanning Bar */}
                    <div style={{
                        position: 'absolute',
                        top: '10%',
                        left: '5%',
                        right: '5%',
                        height: '2px',
                        background: '#3b82f6',
                        boxShadow: '0 0 10px #3b82f6',
                        animation: 'scan 2s infinite ease-in-out'
                    }}></div>
                </div>

                {/* Hint */}
                <div style={{ position: 'absolute', top: '65%', left: 0, right: 0, textAlign: 'center', marginTop: '2rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '20px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }}></div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Align QR code within the frame</span>
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8', maxWidth: '80%', marginInline: 'auto' }}>
                        Ensure the trailer control panel is well-lit for faster recognition
                    </p>
                </div>
            </div>

            {/* Footer Actions */}
            <div style={{ padding: '2rem', paddingBottom: '3rem' }}>
                <button
                    onClick={handleManualEntry}
                    style={{
                        width: '100%',
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
                    <AlignJustify size={20} /> Enter Chassis Manually
                </button>

                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', opacity: 0.5 }}>
                    <div style={{ height: '1px', width: '40px', background: 'white' }}></div>
                    <span style={{ fontSize: '0.7rem', letterSpacing: '2px', fontWeight: 700 }}>LOGISTICS CORP</span>
                    <div style={{ height: '1px', width: '40px', background: 'white' }}></div>
                </div>
            </div>

            <style>{`
            @keyframes scan {
                0% { top: 10%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 90%; opacity: 0; }
            }
        `}</style>
        </div>
    );
};

export default Scanner;
