import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '../context/SessionContext';
import { Button, Input } from '../components/UI';
import { User, Lock, ArrowRight, Phone, Mail } from 'lucide-react';

const SessionStart = () => {
    const navigate = useNavigate();
    const { driverName, loginDriver, currentSession } = useSession();
    const { t } = useTranslation();
    const [name, setName] = useState(driverName || '');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentSession) {
            navigate('/');
        }
    }, [currentSession, navigate]);

    const handlePinChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
        setPin(val);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError(t('session.validation_error'));
            return;
        }
        if (pin.length < 6) {
            setError(t('session.pin_error'));
            return;
        }

        const success = await loginDriver(name, pin);
        if (success) {
            navigate('/capture');
        } else {
            setError(t('session.invalid_credentials'));
        }
    }

    if (!currentSession) return null;

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{t('session.start_session')}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t('session.review_info')}</p>

            {/* Trailer Card */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: '0 4px 20px var(--shadow-color)', marginBottom: '2rem', border: '1px solid var(--border-light)' }}>
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{t('session.chassis_number')}</label>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                            {currentSession.chassis_id}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('session.erp_order')}</label>
                            <div style={{ fontSize: '1rem', color: 'var(--slate-400)', fontStyle: 'italic', marginTop: '2px' }}>{t('session.not_provided')}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('session.last_fetched')}</label>
                            <div style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 500, marginTop: '2px' }}>Feb 14, 3:00 PM</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Start Form */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    <User size={24} fill="var(--primary)" stroke="none" /> {t('session.start_session')}
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t('session.enter_credentials')}</p>

                <form onSubmit={handleSubmit}>
                    <Input
                        label={t('session.driver_name')}
                        placeholder={t('session.driver_placeholder')}
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError('');
                        }}
                        error={error && !name.trim() ? error : ''}
                        icon={<User size={20} />}
                    />

                    <Input
                        label={t('session.pin_code')}
                        placeholder={t('session.pin_placeholder')}
                        type="password"
                        inputMode="numeric"
                        value={pin}
                        onChange={handlePinChange}
                        maxLength={6}
                        error={error}
                        icon={<Lock size={20} />}
                    />

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        {t('session.pin_hint')}
                    </p>

                    <Button
                        fullWidth
                        type="submit"
                        disabled={!name.trim() || pin.length < 6}
                    >
                        {t('session.start_session')} <ArrowRight size={20} />
                    </Button>
                </form>
            </div>

            {/* Footer info */}
            <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '2rem' }}>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{t('app.need_assistance')}</h4>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                    <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                        <Phone size={16} /> 1-800-TRAILER
                    </a>
                    <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                        <Mail size={16} /> {t('session.support_email')}
                    </a>
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.6, letterSpacing: '1px' }}>TRAILER ASSEMBLY PORTAL V4.2.0</p>
            </div>
        </div>
    );
};

export default SessionStart;
