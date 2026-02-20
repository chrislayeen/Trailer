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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyCenter: 'center', background: 'var(--slate-50)', padding: '32px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--slate-100)', borderRadius: '12px', color: 'var(--primary)', marginBottom: '16px' }}>
                        <Bot size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.025em' }}>Logistics Console</h1>
                    <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '4px' }}>Administrative Access Terminal</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identity</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                            <input
                                type="text"
                                placeholder="Admin Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={{ width: '100%', height: '44px', padding: '0 12px 0 40px', borderRadius: '10px', border: '1px solid var(--slate-200)', background: 'var(--slate-50)', fontSize: '0.9rem', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access PIN</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                            <input
                                type="password"
                                placeholder="••••••"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                required
                                maxLength={6}
                                style={{ width: '100%', height: '44px', padding: '0 12px 0 40px', borderRadius: '10px', border: '1px solid var(--slate-200)', background: 'var(--slate-50)', fontSize: '0.9rem', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', height: '48px', background: 'var(--primary)', color: 'white', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '12px', border: 'none' }}
                    >
                        {loading ? 'Verifying...' : 'Sign In to Console'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dbStatus === 'connected' ? 'var(--success)' : 'var(--error)' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase' }}>Database: {dbStatus}</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
