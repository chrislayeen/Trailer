import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import './AdminPremium.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signIn(email, password);
            navigate('/admin');
        } catch (err) {
            console.error('Login error:', err);
            setError('Invalid credentials or connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-dark-bg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>

            {/* Background elements */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(2,6,23,0) 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(2,6,23,0) 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                style={{ width: '100%', maxWidth: '420px', zIndex: 10 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(37,99,235,0.05))', border: '1px solid rgba(37,99,235,0.3)', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(37,99,235,0.2)' }}>
                        <ShieldCheck size={40} color="#2563eb" />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.5px', color: '#f8fafc' }}>System Access</h1>
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>Enter your credentials to access the command center</p>
                </div>

                <form onSubmit={handleLogin} className="glass-panel" style={{ padding: '2.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>

                    <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', fontSize: '0.95rem' }}
                                required
                                placeholder="operator@logistics.com"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>Security Key</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', fontSize: '0.95rem', letterSpacing: password ? '2px' : 'normal' }}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'center', fontWeight: 500 }}>
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="glow-button"
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'AUTHENTICATING...' : 'SECURE LOGIN'} {!loading && <ArrowRight size={18} />}
                    </button>

                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                    <p>Protected by Enterprise Grade Encryption</p>
                </div>
            </motion.div>

        </div>
    );
};

export default AdminLogin;
