import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, LogIn, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase';

const Login = () => {
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [dbStatus, setDbStatus] = useState('checking');
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const checkConnection = async () => {
            try {
                console.log('--- SENIOR DEV CONNECTIVITY AUDIT ---');

                // Test 1: Check users table
                const usersCheck = await supabase.from('users').select('name').limit(1);

                // Test 2: Check sessions table (Control group)
                const sessionsCheck = await supabase.from('sessions').select('id').limit(1);

                console.log('Test 1 (users):', usersCheck.error ? usersCheck.error.message : 'SUCCESS');
                console.log('Test 2 (sessions):', sessionsCheck.error ? sessionsCheck.error.message : 'SUCCESS');

                if (usersCheck.error) {
                    throw usersCheck.error;
                }

                setDbStatus('connected');
            } catch (err) {
                console.error('DB Connection Check failed:', {
                    message: err.message,
                    code: err.code,
                    hint: err.hint
                });
                setDbStatus('error');
            }
        };
        checkConnection();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(name, pin);
            toast.success('Admin access granted');
            navigate('/');
        } catch (err) {
            toast.error(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'white',
                padding: '2.5rem',
                borderRadius: '24px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative'
            }}>
                {/* Connection Indicator */}
                <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem' }}>
                    <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        backgroundColor: dbStatus === 'connected' ? '#10b981' : dbStatus === 'error' ? '#ef4444' : '#94a3b8'
                    }}></div>
                    <span style={{ color: '#64748b' }}>DB: {dbStatus.toUpperCase()}</span>
                </div>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '12px',
                        background: '#dbeafe',
                        borderRadius: '16px',
                        color: '#1d4ed8',
                        marginBottom: '1rem'
                    }}>
                        <Bot size={40} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Admin Portal</h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Logistics Corp • Trailer Assembly</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Admin Name
                        </label>
                        <div style={{ position: 'relative' }}>
                            <User size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Enter name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Access PIN
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="password"
                                placeholder="Enter 6-digit PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                required
                                maxLength={6}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#1d4ed8',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            marginTop: '0.5rem'
                        }}
                    >
                        {loading ? 'Authenticating...' : (
                            <>
                                Login to Dashboard <LogIn size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Restricted access for authorized logistics managers only.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
