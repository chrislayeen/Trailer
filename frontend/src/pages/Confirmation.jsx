import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '../context/SessionContext';
import { Button } from '../components/UI';
import { Check, Lock, ChevronLeft, ScanLine } from 'lucide-react';
import { supabase } from '../utils/supabase';

const Confirmation = () => {
    const navigate = useNavigate();
    const { lastCompletedSession, logoutDriver } = useSession();
    const { t, i18n } = useTranslation();

    // Use lastCompletedSession from context, which is guaranteed to be the one just submitted
    const session = lastCompletedSession;

    const handleNewScan = () => {
        navigate('/scanner');
    };

    const handleDashboard = () => {
        navigate('/');
    };

    if (!session) {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>{t('confirmation.no_session')}</p>
                <Button onClick={() => navigate('/')}>{t('confirmation.return_home')}</Button>
            </div>
        )
    }

    return (
        <div style={{ padding: '1rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Header / Nav - Max Width Constrained */}
            {/* Header / Nav - Max Width Constrained */}
            <div style={{ width: '100%', maxWidth: '480px', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                {/* Removed Back to Home button */}
            </div>

            {/* Main Centered Content */}
            <div style={{
                flex: 1,
                width: '100%',
                maxWidth: '480px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center' // Ensure text is centered
            }}>

                {/* Success Section */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Check size={24} strokeWidth={4} />
                        </div>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('confirmation.success_title')}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{t('confirmation.success_message')}</p>
                </div>

                {/* Locked Badge */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '0.75rem 1.5rem', borderRadius: '999px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', border: '1px solid var(--border-input)' }}>
                        <Lock size={12} /> {t('confirmation.locked')}
                    </div>
                </div>

                {/* Metadata Card */}
                <div style={{ width: '100%', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 1px 3px var(--shadow-color)', textAlign: 'left' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('confirmation.metadata')}</span>
                        <span style={{ color: 'var(--slate-400)', fontSize: '1.2rem' }}>ⓘ</span>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('confirmation.session_id')}</span>
                            <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>#TR-{session.chassis_id?.substring(0, 5) || 'XXXX'}-X</span>
                        </div>
                        <div style={{ height: '1px', background: 'var(--border-light)' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('confirmation.timestamp')}</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                {session.end_time ? new Date(session.end_time).toLocaleString(i18n.language === 'nl' ? 'nl-NL' : 'en-US', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </span>
                        </div>
                        {session.gps_lat !== 0 && session.gps_lat != null && (
                            <>
                                <div style={{ height: '1px', background: 'var(--border-light)' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('confirmation.gps')}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.8rem' }}>
                                        {session.gps_lat.toFixed(6)}, {session.gps_lng.toFixed(6)}
                                    </span>
                                </div>
                            </>
                        )}
                        <div style={{ height: '1px', background: 'var(--border-light)' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('confirmation.status')}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: 700 }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div> {t('confirmation.uploaded')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Documentation Grid */}
                <div style={{ width: '100%', marginBottom: '2rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t('confirmation.documentation')} ({session.photos?.length || 0})</h3>
                        <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>{t('confirmation.read_only')}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {(session.photos || []).slice(0, 6).map((photo) => {
                            const url = photo.data || photo.url || (photo.storage_path ? supabase.storage.from('photos').getPublicUrl(photo.storage_path).data.publicUrl : '');
                            return (
                                <div key={photo.id} style={{ aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                    <img src={url} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            );
                        })}
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', marginTop: '1.5rem', marginBottom: '1rem' }}>
                        {t('confirmation.quality_assurance')}
                    </p>
                </div>

                {/* Session Remarks / Comments */}
                {session.comments && (
                    <div style={{ width: '100%', marginBottom: '2rem', textAlign: 'left' }}>
                        <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
                                {t('confirmation.remarks')}
                            </h4>
                            <p style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: '1.5', margin: 0 }}>
                                "{session.comments}"
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={handleNewScan}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
                        }}
                    >
                        <ScanLine size={20} /> {t('confirmation.start_new')}
                    </button>
                    <button
                        onClick={handleDashboard}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'var(--bg-card)',
                            color: 'var(--primary)',
                            border: '1px solid var(--border-input)',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 2px var(--shadow-color)'
                        }}
                    >
                        {t('confirmation.return_home')}
                    </button>
                </div>


            </div>
        </div>
    );
};

export default Confirmation;
