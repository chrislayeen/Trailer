import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { Button } from '../components/UI';
import { Check, Lock, ChevronLeft, ScanLine } from 'lucide-react';

const Confirmation = () => {
    const navigate = useNavigate();
    const { sessions, logoutDriver } = useSession();

    // Get the most recent session
    const lastSession = sessions[0];

    const handleNewScan = () => {
        navigate('/scanner');
    };

    const handleDashboard = () => {
        // Driver flow usually ends here, but "Return to Dashboard" could imply Admin or Home.
        // Based on the screenshot, it looks like a secondary text action.
        // We'll route to Home for now, or Admin if logged in.
        navigate('/');
    };

    if (!lastSession) {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <p>No session found.</p>
                <Button onClick={() => navigate('/')}>Home</Button>
            </div>
        )
    }

    return (
        <div style={{ padding: '2rem 1.5rem', minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Nav */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <ChevronLeft size={20} /> Back
                </button>
                <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', marginRight: '60px' }}>
                    Confirmation
                </div>
            </div>

            {/* Success Icon */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Check size={24} strokeWidth={4} />
                    </div>
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem', textAlign: 'center' }}>Submission Successful</h1>
                <p style={{ color: '#6b7280', fontSize: '1rem' }}>Trailer assembly log has been finalized.</p>
            </div>

            {/* Locked Badge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', padding: '0.75rem 1.5rem', borderRadius: '999px', color: '#4b5563', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', border: '1px solid #e5e7eb' }}>
                    <Lock size={12} /> RECORD LOCKED & ENCRYPTED
                </div>
            </div>

            {/* Metadata Card */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>METADATA</span>
                    <span style={{ color: '#cbd5e1', fontSize: '1.2rem' }}>ⓘ</span>
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontWeight: 500 }}>Session ID</span>
                        <span style={{ fontWeight: 800, color: '#1e293b' }}>#TR-{lastSession.chassisId.substring(0, 5)}-X</span>
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontWeight: 500 }}>Timestamp</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{new Date(lastSession.endTime).toLocaleDateString()} | {new Date(lastSession.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontWeight: 500 }}>Status</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700 }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div> Uploaded
                        </div>
                    </div>
                </div>
            </div>

            {/* Documentation Grid */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Documentation ({lastSession.photos.length})</h3>
                    <span style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Read Only</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {lastSession.photos.slice(0, 6).map((photo) => (
                        <div key={photo.id} style={{ aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <img src={photo.data} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ))}
                    {/* Placeholder for empty slots to match grid of 6 if needed, or dynamic */}
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', marginTop: '1.5rem', marginBottom: '1rem' }}>
                    All photos are timestamped and geo-tagged for quality.
                </p>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                    onClick={handleNewScan}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: '#2563eb',
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
                    <ScanLine size={20} /> Start New Scan
                </button>
                <button
                    onClick={handleDashboard}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontWeight: 700,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}
                >
                    Return to Dashboard
                </button>
            </div>

            {/* iOS Bottom Bar Indicator Simulation */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                <div style={{ width: '140px', height: '5px', background: '#e2e8f0', borderRadius: '10px' }}></div>
            </div>
        </div>
    );
};

export default Confirmation;
