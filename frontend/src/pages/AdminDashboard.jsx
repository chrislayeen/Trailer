import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { Search, MapPin, Eye, FileText, Archive, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import { supabase } from '../utils/supabase';
import './AdminPremium.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { isAdmin, sessions } = useSession();
    const [filter, setFilter] = useState('');
    const [activeTab, setActiveTab] = useState('All Records');

    useEffect(() => {
        if (!isAdmin) navigate('/admin/login');
    }, [isAdmin, navigate]);

    const filteredSessions = sessions.filter(s =>
        (s.chassis_id || '').toLowerCase().includes(filter.toLowerCase()) ||
        (s.driver_name || '').toLowerCase().includes(filter.toLowerCase())
    );

    const enrichedSessions = filteredSessions.map(s => {
        const heroPhoto = s.photos && s.photos.length > 0 ? s.photos[0] : null;
        let heroUrl = 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=800&q=80';
        if (heroPhoto) {
            const { data } = supabase.storage.from('photos').getPublicUrl(heroPhoto.storage_path);
            if (data?.publicUrl) heroUrl = data.publicUrl;
        }

        return {
            ...s,
            originLog: s.gps_lat ? `${s.gps_lat.toFixed(4)}° N, ${s.gps_lng.toFixed(4)}° W` : 'Manual Entry',
            recordHash: `VK-${s.chassis_id?.substring(0, 4) || 'XXXX'}-S-CAL`,
            status: s.status === 'uploaded' ? 'Post-Assembly' : 'Pre-Assembly',
            heroImage: heroUrl
        };
    }).filter(s => activeTab === 'All Records' || s.status === activeTab);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <div className="admin-dark-bg" style={{ paddingBottom: '100px', display: 'flex', flexDirection: 'column' }}>
            {/* Header Area */}
            <div style={{ padding: '2rem 1.5rem 1rem 1.5rem', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Activity size={16} color="#2563eb" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Tracker</span>
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Command Center</h1>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="glass-panel" style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', border: 'none', cursor: 'pointer', borderRadius: '12px' }}>
                            <Archive size={20} />
                        </button>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)' }}>
                            A
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Search Chassis ID or Fleet..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 3rem',
                            borderRadius: '16px',
                            fontSize: '0.95rem',
                        }}
                    />
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
                    {['All Records', 'Pre-Assembly', 'Post-Assembly'].map(tab => (
                        <button
                            key={tab}
                            className={`glass-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0.6rem 1.25rem',
                                borderRadius: '999px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div style={{ padding: '1.5rem', flex: 1 }}>
                {enrichedSessions.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
                        <Archive size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#94a3b8' }}>No records found</h3>
                        <p style={{ fontSize: '0.85rem' }}>Try adjusting your search filters.</p>
                    </motion.div>
                ) : (
                    <motion.div variants={containerVariants} initial="hidden" animate="show">
                        <AnimatePresence>
                            {enrichedSessions.map((session) => (
                                <motion.div key={session.id} variants={itemVariants} exit={{ opacity: 0, scale: 0.95 }} className="glass-card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>

                                    {/* Hero Header With Gradient */}
                                    <div style={{ position: 'relative', height: '180px' }}>
                                        <img src={session.heroImage} alt="Trailer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div className="image-overlay-gradient" style={{ position: 'absolute', inset: 0 }}></div>

                                        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                                            <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'white', padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <FileText size={12} color="#94a3b8" /> {session.photos?.length || 0}
                                            </div>
                                        </div>

                                        <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                            <div>
                                                <div className={`status-badge ${session.status === 'Pre-Assembly' ? 'pre' : 'post'}`} style={{ display: 'inline-block', marginBottom: '8px' }}>
                                                    {session.status}
                                                </div>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Chassis #{session.chassis_id}</h3>
                                            </div>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '0.85rem' }}>
                                                {session.driver_name?.substring(0, 2).toUpperCase() || 'NA'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Glassmorphic Data Body */}
                                    <div style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Origin Point</label>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                                                    <MapPin size={14} color="#2563eb" /> {session.originLog}
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Security Hash</label>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginTop: '6px', fontFamily: 'monospace' }}>{session.recordHash}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                                                {new Date(session.end_time || session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(session.end_time || session.start_time).toLocaleDateString()}
                                            </div>
                                            <button
                                                onClick={() => navigate(`/admin/session/${session.id}`)}
                                                className="glow-button"
                                                style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                            >
                                                <Eye size={16} /> INSPECT <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            <BottomNav />
        </div >
    );
};

export default AdminDashboard;
