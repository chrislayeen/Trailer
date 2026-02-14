import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { Button, Input } from '../components/UI';
import { ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { loginAdmin } = useSession();
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginAdmin(username, pin)) {
            navigate('/admin');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
            <div style={{ marginBottom: '2rem', color: 'var(--color-primary)' }}>
                <ShieldCheck size={48} />
                <h2>Admin Portal</h2>
            </div>

            <form onSubmit={handleLogin} style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Input
                    label="Admin ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                    label="PIN"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                />
                {error && <p style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</p>}

                <Button fullWidth type="submit">Login</Button>
            </form>
        </div>
    );
};

export default AdminLogin;
