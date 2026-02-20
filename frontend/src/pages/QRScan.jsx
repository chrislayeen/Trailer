import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useSession } from '../context/SessionContext';
import { Button } from '../components/UI';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { QrCode, ScanLine, HelpCircle, Bot } from 'lucide-react';

const QRScan = () => {
    const navigate = useNavigate();
    const { startNewSession } = useSession();
    const { t } = useTranslation();
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', paddingBottom: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
                <LanguageSwitcher variant="light" />
            </div>
            {/* Branding */}
            <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1rem', position: 'relative', width: '100%', maxWidth: '320px' }}>
                <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--slate-100)', borderRadius: '12px', color: 'var(--primary)', marginBottom: '1rem', marginTop: '2rem' }}>
                    <Bot size={32} />
                </div>
                <h3 style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('app.logistics_corp')}</h3>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>{t('app.title')}</h1>
            </div>

            {/* Scan Frame */}
            <div style={{
                position: 'relative',
                width: '280px',
                height: '280px',
                border: '2px dashed var(--slate-400)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--slate-50)',
                marginBottom: '2rem'
            }}>
                {/* Corner Markers */}
                <div style={{ position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderTop: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderTopLeftRadius: '8px' }}></div>
                <div style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderTop: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderTopRightRadius: '8px' }}></div>
                <div style={{ position: 'absolute', bottom: 20, left: 20, width: 40, height: 40, borderBottom: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderBottomLeftRadius: '8px' }}></div>
                <div style={{ position: 'absolute', bottom: 20, right: 20, width: 40, height: 40, borderBottom: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderBottomRightRadius: '8px' }}></div>

                <div style={{ color: isScanning ? 'var(--primary)' : 'var(--slate-400)', animation: isScanning ? 'pulse 1s infinite' : 'none' }}>
                    <QrCode size={80} opacity={isScanning ? 1 : 0.5} />
                </div>

                {/* Scanning Dots */}
                <div style={{ position: 'absolute', bottom: '80px', display: 'flex', gap: '6px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }}></div>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--slate-400)' }}></div>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--slate-400)' }}></div>
                </div>
            </div>

            {/* Main Action */}
            <div style={{ width: '100%', maxWidth: '320px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('scan.ready_to_begin')}</h2>
                <p style={{ color: 'var(--slate-500)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    <Trans i18nKey="scan.scan_instruction" components={{ 1: <strong style={{ color: 'var(--slate-900)', textDecoration: 'underline' }} /> }} />
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
                    <ScanLine size={20} /> {t('scan.scan_button')}
                </Button>


            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }}></div>

            {/* Footer */}
            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <HelpCircle size={14} /> {t('app.need_assistance')}
                </div>
                <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>{t('app.contact_supervisor')}</p>


            </div>
        </div>
    );
};

export default QRScan;
