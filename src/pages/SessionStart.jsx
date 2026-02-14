import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { Button, Input } from '../components/UI';
import { User, Lock, ArrowRight, Phone, Mail } from 'lucide-react';

const SessionStart = () => {
    const navigate = useNavigate();
    const { driverName, loginDriver, currentSession } = useSession();
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

        if (val.length === 6) {
            if (name.trim()) {
                loginDriver(name);
                navigate('/capture');
            } else {
                setError('Please enter your name first.');
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Driver Name is required.');
            return;
        }
        if (pin.length < 6) {
            setError('Please enter a 6-digit PIN.');
            return;
        }
        loginDriver(name);
        navigate('/capture');
    }

    if (!currentSession) return null;

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 800 }}>Trailer Details</h2>
            <p style={{ color: 'var(--color-gray-500)', marginBottom: '1.5rem' }}>Review the scanned unit information</p>

            {/* Trailer Card */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Chassis ID</label>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-gray-900)', marginTop: '4px' }}>
                            {currentSession.chassisId}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>ERP Order</label>
                            <div style={{ fontSize: '1rem', color: 'var(--color-gray-400)', fontStyle: 'italic', marginTop: '2px' }}>Not provided</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Last Fetched</label>
                            <div style={{ fontSize: '1rem', color: 'var(--color-primary-dark)', fontWeight: 500, marginTop: '2px' }}>Feb 14, 3:00 PM</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Start Form */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <User size={24} fill="var(--color-primary)" stroke="none" /> Start Session
                </h3>
                <p style={{ color: 'var(--color-gray-500)', marginBottom: '1.5rem' }}>Enter your credentials to begin inspection</p>

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Initials / Name"
                        placeholder="Enter your initials or full name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError('');
                        }}
                        error={error && !name.trim() ? error : ''}
                        icon={<User size={20} />}
                    />

                    <Input
                        label="6-Digit PIN"
                        placeholder="000000"
                        type="password"
                        inputMode="numeric"
                        value={pin}
                        onChange={handlePinChange}
                        maxLength={6}
                        error={error && pin.length < 6 ? error : ''}
                        icon={<Lock size={20} />}
                    />

                    <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-400)', marginBottom: '1.5rem' }}>
                        Provided by your assembly manager
                    </p>

                    <Button
                        fullWidth
                        type="submit"
                        disabled={!name.trim() || pin.length < 6}
                    >
                        Continue to Inspection <ArrowRight size={20} />
                    </Button>
                </form>
            </div>

            {/* Footer info */}
            <div style={{ textAlign: 'center', borderTop: '1px solid var(--color-gray-200)', paddingTop: '2rem' }}>
                <h4 style={{ color: 'var(--color-gray-500)', marginBottom: '1rem' }}>Need help?</h4>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                    <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                        <Phone size={16} /> 1-800-TRAILER
                    </a>
                    <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                        <Mail size={16} /> Support Email
                    </a>
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-gray-300)', letterSpacing: '1px' }}>TRAILER ASSEMBLY PORTAL V4.2.0</p>
            </div>
        </div>
    );
};

export default SessionStart;
