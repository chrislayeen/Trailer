import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { Button, Input } from '../components/UI';
import { QrCode, ScanLine, Clock, HelpCircle, Bot } from 'lucide-react';

const QRScan = () => {
    const navigate = useNavigate();
    const { startNewSession } = useSession();
    const [manualId, setManualId] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    const handleScan = () => {
        setIsScanning(true);
        // Simulate scan delay
        setTimeout(() => {
            setIsScanning(false);
            const simulatedId = 'XL90D01518244679' + Math.floor(10 + Math.random() * 90);
            startNewSession(simulatedId);
            navigate('/session-start');
        }, 1500);
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualId.trim()) {
            startNewSession(manualId.trim());
            navigate('/session-start');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', paddingBottom: '2rem' }}>
            {/* Branding */}
            <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
                <div style={{ display: 'inline-flex', padding: '12px', background: '#dbeafe', borderRadius: '12px', color: 'var(--color-primary)', marginBottom: '1rem' }}>
                    <Bot size={32} />
                </div>
                <h3 style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Logistics Corp</h3>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-gray-900)' }}>Trailer Assembly Portal</h1>
            </div>

            {/* Scan Frame */}
            <div style={{
                position: 'relative',
                width: '280px',
                height: '280px',
                border: '2px dashed #93c5fd',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#eff6ff',
                marginBottom: '2rem'
            }}>
                {/* Corner Markers */}
                <div style={{ position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderTop: '4px solid var(--color-primary)', borderLeft: '4px solid var(--color-primary)', borderTopLeftRadius: '8px' }}></div>
                <div style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderTop: '4px solid var(--color-primary)', borderRight: '4px solid var(--color-primary)', borderTopRightRadius: '8px' }}></div>
                <div style={{ position: 'absolute', bottom: 20, left: 20, width: 40, height: 40, borderBottom: '4px solid var(--color-primary)', borderLeft: '4px solid var(--color-primary)', borderBottomLeftRadius: '8px' }}></div>
                <div style={{ position: 'absolute', bottom: 20, right: 20, width: 40, height: 40, borderBottom: '4px solid var(--color-primary)', borderRight: '4px solid var(--color-primary)', borderBottomRightRadius: '8px' }}></div>

                <div style={{ color: isScanning ? 'var(--color-primary)' : '#93c5fd', animation: isScanning ? 'pulse 1s infinite' : 'none' }}>
                    <QrCode size={80} opacity={isScanning ? 1 : 0.5} />
                </div>

                {/* Scanning Dots */}
                <div style={{ position: 'absolute', bottom: '80px', display: 'flex', gap: '6px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }}></div>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#93c5fd' }}></div>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#93c5fd' }}></div>
                </div>
            </div>

            {/* Main Action */}
            <div style={{ width: '100%', maxWidth: '320px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Ready to Begin</h2>
                <p style={{ color: 'var(--color-gray-500)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    Please scan the <strong style={{ color: 'var(--color-gray-800)', textDecoration: 'underline' }}>QR code</strong> located on the trailer's control panel to start recording images.
                </p>

                <Button
                    onClick={() => navigate('/scanner')}
                    fullWidth
                    style={{
                        padding: '1rem',
                        fontSize: '1.1rem',
                        marginBottom: '1.5rem'
                    }}
                >
                    <ScanLine size={20} /> Scan QR Code
                </Button>

                <button style={{ background: 'none', border: 'none', color: 'var(--color-gray-500)', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', cursor: 'pointer' }}>
                    <Clock size={16} /> View Recent Assemblies
                </button>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }}></div>

            {/* Footer */}
            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <HelpCircle size={14} /> Need Assistance?
                </div>
                <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Contact supervisor or site manager.</p>

                {/* Manual Entry Fallback for Demo */}
                <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                    <p style={{ fontSize: '0.75rem', marginBottom: '10px' }}>Dev Fallback:</p>
                    <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
                        <Input placeholder="Manual ID" value={manualId} onChange={e => setManualId(e.target.value)} style={{ marginBottom: 0 }} />
                        <Button variant="secondary" onClick={handleManualSubmit} style={{ borderRadius: '12px', padding: '0.5rem 1rem' }}>Go</Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default QRScan;
