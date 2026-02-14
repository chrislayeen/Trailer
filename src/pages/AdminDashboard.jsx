import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { Search, MapPin, Eye, CheckCircle, FileText, Calendar, Archive } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { isAdmin, sessions } = useSession();
    const [filter, setFilter] = useState('');
    const [activeTab, setActiveTab] = useState('All Records');

    useEffect(() => {
        if (!isAdmin) navigate('/admin/login');
    }, [isAdmin, navigate]);

    const filteredSessions = sessions.filter(s =>
        s.chassisId.toLowerCase().includes(filter.toLowerCase()) ||
        s.driverName.toLowerCase().includes(filter.toLowerCase())
    );

    // Mock data enrichment for the new UI fields (Origin Log, Record Hash)
    const enrichedSessions = filteredSessions.map(s => ({
        ...s,
        originLog: '34.0522° N, 118.2437° W',
        recordHash: `VK-${s.chassisId.substring(0, 4)}-S-CAL`,
        status: s.photos.length > 3 ? 'Post-Assembly' : 'Pre-Assembly',
        heroImage: s.photos.length > 0 ? s.photos[0].data : 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=800&q=80'
    }));

    return (
        <div style={{ paddingBottom: '100px', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem', background: '#f3f4f6', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Trailer Photo Records</h1>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ background: '#e2e8f0', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: '#475569' }}>
                            <Archive size={20} />
                        </button>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fdba74', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#9a3412', fontSize: '0.9rem' }}>
                            A
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search Chassis ID or Record Date..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 3rem',
                            borderRadius: '999px',
                            border: 'none',
                            background: '#e2e8f0',
                            fontSize: '0.95rem',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
                    {['All Records', 'Pre-Assembly', 'Post-Assembly'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '999px',
                                border: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                background: activeTab === tab ? '#1d4ed8' : '#e2e8f0',
                                color: activeTab === tab ? 'white' : '#64748b'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content List */}
            <div style={{ padding: '1rem' }}>
                {enrichedSessions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No records found</div>
                ) : (
                    enrichedSessions.map((session) => (
                        <div key={session.id} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            {/* Card Header */}
                            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#475569' }}>
                                    {session.driverName.substring(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Chassis #{session.chassisId}</h3>
                                        <div style={{
                                            fontSize: '0.6rem',
                                            fontWeight: 800,
                                            padding: '4px 8px',
                                            borderRadius: '999px',
                                            background: session.status === 'Pre-Assembly' ? '#dbeafe' : '#dcfce7',
                                            color: session.status === 'Pre-Assembly' ? '#1e40af' : '#166534',
                                            textTransform: 'uppercase'
                                        }}>
                                            {session.status}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                                        {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(session.endTime).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Hero Image */}
                            <div style={{ position: 'relative', height: '220px' }}>
                                <img src={session.heroImage} alt="Trailer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {/* Overlay Badge */}
                                <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    BEFORE BUILD
                                </div>
                                {/* Count Badge */}
                                <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <FileText size={12} /> 1 of {session.photos.length}
                                </div>
                            </div>

                            {/* Metadata */}
                            <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Origin Log</label>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                        <MapPin size={12} fill="#334155" /> {session.originLog}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Record Hash</label>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginTop: '4px' }}>{session.recordHash}</div>
                                </div>
                            </div>

                            {/* Minimap Placeholder */}
                            <div style={{ padding: '0 1rem 1rem 1rem' }}>
                                <div style={{ height: '80px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {/* Simulated Map Path */}
                                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #f1f5f9 45%, #cbd5e1 50%, #f1f5f9 55%)', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', background: '#3b82f6', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)' }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ padding: '0 1rem 1.5rem 1rem', display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => navigate(`/admin/session/${session.id}`)}
                                    style={{ flex: 1, padding: '1rem', background: '#0f172a', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                                >
                                    <Eye size={18} /> VIEW DETAILS
                                </button>
                                <button style={{ width: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white', cursor: 'pointer' }}>
                                    <CheckCircle size={20} color="#475569" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default AdminDashboard;
