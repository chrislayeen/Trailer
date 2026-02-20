import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { supabase } from '../utils/supabase';
import { ArrowLeft, MapPin, Clock, User, Hash, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminPremium.css';

const SessionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { sessions, isAdmin } = useSession();

    useEffect(() => {
        if (!isAdmin) navigate('/admin/login');
    }, [isAdmin, navigate]);

    const session = sessions.find(s => s.id === id);

    if (!session) return (
        <div className="admin-dark-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#64748b' }}>
            <p>Record Not Found</p>
        </div>
    );

    const photosWithUrls = (session.photos || []).map(p => {
        if (p.data) return { ...p, url: p.data };
        const { data } = supabase.storage.from('photos').getPublicUrl(p.storage_path);
        return { ...p, url: data?.publicUrl };
    });

    const isVerified = session.gps_lat != null;
    const originLocation = isVerified ? `${session.gps_lat.toFixed(4)}° N, ${session.gps_lng.toFixed(4)}° W` : 'Manual Entry';

    return (
        <div className="admin-dark-bg" style={{ paddingBottom: '100px', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ padding: '1.5rem', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="glass-panel"
                    style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: '#f8fafc', cursor: 'pointer', borderRadius: '12px' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Chassis Record</div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>#{session.chassis_id}</h1>
                </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
                {/* Status Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(37,99,235,0.2)' }}>
                                <User size={20} color="#2563eb" />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Operator</label>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{session.driver_name}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(99,102,241,0.2)' }}>
                                <Clock size={20} color="#818cf8" />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Timestamp</label>
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0' }}>{new Date(session.end_time || session.start_time).toLocaleString()}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: isVerified ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isVerified ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                                <MapPin size={20} color={isVerified ? '#34d399' : '#fbbf24'} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                                    Location Tracking <span style={{ marginLeft: '6px', color: isVerified ? '#34d399' : '#fbbf24', fontSize: '0.6rem', padding: '2px 6px', background: isVerified ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', borderRadius: '4px' }}>{isVerified ? 'VERIFIED' : 'UNVERIFIED'}</span>
                                </label>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#cbd5e1', marginTop: '2px' }}>{originLocation}</div>
                            </div>
                        </div>

                        {session.comments && (
                            <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <FileText size={16} color="#94a3b8" />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Operator Notes</span>
                                </div>
                                <p style={{ fontStyle: 'italic', color: '#f1f5f9', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>"{session.comments}"</p>
                            </div>
                        )}

                    </div>
                </motion.div>

                {/* Photos Grid */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Visual Evidence</h3>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {photosWithUrls.length} captures
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <AnimatePresence>
                            {photosWithUrls.map((photo, i) => (
                                <motion.div
                                    key={photo.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.15 + i * 0.05 }}
                                    style={{ borderRadius: '16px', overflow: 'hidden', position: 'relative', aspectRatio: '3/4', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
                                >
                                    <img src={photo.url} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div className="image-overlay-gradient" style={{ position: 'absolute', inset: 0, opacity: 0.6 }}></div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>

            </div>
        </div >
    );
};

export default SessionDetails;
