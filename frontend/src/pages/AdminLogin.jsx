import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/UI';
import { ShieldCheck } from 'lucide-react';

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
        <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
            <div style={{ marginBottom: '2rem', color: 'var(--primary)' }}>
                <ShieldCheck size={48} />
                <h2>Admin Portal</h2>
            </div>

            <form onSubmit={handleLogin} style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                        required
                        placeholder="admin@logisticscorp.com"
                    />
                </div>

                <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                        required
                    />
                </div>

                {error && <p style={{ color: 'var(--color-error)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

                <Button fullWidth type="submit" disabled={loading}>
                    {loading ? 'Signing in...' : 'Login'}
                </Button>
            </form>
        </div>
    );
};

export default AdminLogin;
