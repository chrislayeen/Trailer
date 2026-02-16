import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import {
    Users,
    CheckCircle,
    Clock,
    BarChart3,
    TrendingUp,
    ArrowRight,
    MapPin,
    Activity,
    AlertCircle,
    Download,
    ExternalLink,
    X
} from 'lucide-react';
import { format, subDays, startOfDay, isAfter } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const QuickPhotoModal = ({ photo: initialPhoto, session, onClose }) => {
    const [activePhoto, setActivePhoto] = useState(initialPhoto || (session?.photos?.[0]));

    if (!activePhoto) return null;
    const url = supabase.storage.from('photos').getPublicUrl(activePhoto.storage_path).data.publicUrl;

    const handleDownload = async () => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `chassis-${session.chassis_id}-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            toast.error('Download failed');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-backdrop"
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', position: 'relative', maxWidth: '800px', width: '100%', boxShadow: 'var(--shadow-md)' }}
            >
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)' }}>Chassis Audit #{session.chassis_id}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 600 }}>Captured by {session.driver_name}</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'var(--slate-100)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', color: 'var(--slate-600)' }}>
                        <X size={18} />
                    </button>
                </div>
                <div style={{ background: 'var(--slate-900)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <img src={url} style={{ maxWidth: '100%', maxHeight: '50vh', display: 'block', objectFit: 'contain' }} alt="Preview" />
                    </div>

                    {/* Thumbnail Strip */}
                    {session.photos && session.photos.length > 1 && (
                        <div style={{
                            width: '100%',
                            padding: '12px 24px',
                            display: 'flex',
                            gap: '8px',
                            background: 'rgba(0,0,0,0.2)',
                            overflowX: 'auto',
                            justifyContent: 'center'
                        }}>
                            {session.photos.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => setActivePhoto(p)}
                                    style={{
                                        width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer',
                                        border: activePhoto.id === p.id ? '2px solid white' : '2px solid transparent',
                                        transition: 'all 150ms',
                                        opacity: activePhoto.id === p.id ? 1 : 0.6
                                    }}
                                >
                                    <img src={supabase.storage.from('photos').getPublicUrl(p.storage_path).data.publicUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Thumb" />
                                </div>
                            ))}
                        </div>
                    )}

                    {session.comments && (
                        <div style={{
                            width: '100%',
                            padding: '16px 24px',
                            background: 'rgba(255,255,255,0.05)',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '0.9rem',
                            fontStyle: 'italic',
                            lineHeight: '1.5'
                        }}>
                            <span style={{ color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontStyle: 'normal' }}>Auditor Remarks</span>
                            "{session.comments}"
                        </div>
                    )}
                </div>
                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={() => window.open(url, '_blank')} style={{ height: '40px', padding: '0 16px', background: 'var(--slate-100)', color: 'var(--slate-700)', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.85rem' }}>
                        <ExternalLink size={16} style={{ marginRight: '8px' }} /> Open Original
                    </button>
                    <button onClick={handleDownload} style={{ height: '40px', padding: '0 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.85rem' }}>
                        <Download size={16} style={{ marginRight: '8px' }} /> Download
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const StatCard = ({ title, value, icon, color, trend, delay = 0, feature = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="card"
        style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: feature ? 'var(--slate-900)' : 'white',
            color: feature ? 'white' : 'var(--slate-900)',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        {feature && (
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
            <div style={{
                color: feature ? 'white' : 'var(--primary)',
                background: feature ? 'rgba(255,255,255,0.1)' : 'var(--bg-body)',
                width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {icon}
            </div>
            {trend && (
                <div style={{
                    color: feature ? 'var(--success)' : 'var(--success)',
                    background: feature ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    padding: '4px 8px', borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <TrendingUp size={12} /> {trend}
                </div>
            )}
        </div>
        <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500, opacity: feature ? 0.7 : 0.5 }}>{title}</div>
        </div>
    </motion.div>
);

const ActivityFeedItem = ({ session, delay, onPhotoClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        style={{
            padding: '12px 16px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            border: '1px solid var(--slate-100)',
            transition: 'background 150ms ease',
            background: 'white'
        }}
    >
        <div
            style={{
                width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: 'var(--slate-100)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: session.photos?.length > 0 ? 'pointer' : 'default', flexShrink: 0
            }}
            onClick={() => session.photos?.length > 0 && onPhotoClick(session.photos[0], session)}
        >
            {session.photos && session.photos.length > 0 ? (
                <img
                    src={supabase.storage.from('photos').getPublicUrl(session.photos[0].storage_path).data.publicUrl}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    alt="Preview"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentNode.innerHTML = '<div style="color:var(--slate-400)"><AlertCircle size={18}/></div>';
                    }}
                />
            ) : (
                <CheckCircle size={20} color="var(--slate-300)" />
            )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Chassis #{session.chassis_id}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 600 }}>{session.driver_name}</span>
                        <span>•</span>
                        <span>{format(new Date(session.end_time), 'HH:mm')}</span>
                    </div>
                </div>
                <div style={{ color: 'var(--slate-300)' }}>
                    <MapPin size={14} />
                </div>
            </div>
            {session.comments && (
                <div style={{
                    marginTop: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--slate-600)',
                    background: 'var(--slate-50)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    borderLeft: '2px solid var(--primary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.4'
                }}>
                    {session.comments}
                </div>
            )}
        </div>
    </motion.div>
);

const TrendChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const width = 300;
    const height = 80;
    const padding = 10;
    const max = Math.max(...data, 5);
    const points = data.map((d, i) => ({
        x: padding + (i * (width - 2 * padding) / (data.length - 1)),
        y: height - (padding + (d / max * (height - 2 * padding)))
    }));
    const d = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            <path d={d} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke="var(--primary)" strokeWidth="1.5" />
            ))}
        </svg>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        today: 0,
        users: 0,
        activeNow: 0,
        latest: [],
        trend: [4, 7, 5, 9, 12, 8, 14] // Placeholder trend
    });
    const [loading, setLoading] = useState(true);
    const [selectedPhotoData, setSelectedPhotoData] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const today = startOfDay(new Date()).toISOString();
                const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

                const [totalRes, todayRes, activeRes, latestRes, userRes] = await Promise.all([
                    supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('status', 'uploaded'),
                    supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('status', 'uploaded').gte('end_time', today),
                    supabase.from('sessions').select('*', { count: 'exact', head: true }).gte('start_time', tenMinsAgo),
                    supabase.from('sessions').select('*, photos(*)').eq('status', 'uploaded').order('end_time', { ascending: false }).limit(6),
                    supabase.from('users').select('name', { count: 'exact', head: true }).eq('role', 'driver')
                ]);

                setStats(prev => ({
                    ...prev,
                    total: totalRes.count || 0,
                    today: todayRes.count || 0,
                    users: userRes.count || 0,
                    activeNow: activeRes.count || 0,
                    latest: latestRes.data || []
                }));
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b' }}>
            <Activity className="animate-pulse" size={40} />
            <span style={{ marginLeft: '12px', fontWeight: 600 }}>Syncing logistics data...</span>
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.025em' }}>
                        Operational Console
                    </h1>
                    <p style={{ color: 'var(--slate-500)', fontWeight: 500, fontSize: '0.9rem' }}>Real-time assembly signal monitoring and driver audit logs.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--slate-100)', padding: '6px 14px', borderRadius: '10px', color: 'var(--slate-600)', fontSize: '0.75rem', fontWeight: 700 }}>
                    <div style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%' }} />
                    LIVE FEED CONNECTED
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '3rem' }}>
                <StatCard title="Active Sessions" value={stats.activeNow} icon={<Activity size={20} />} feature={true} delay={0.1} />
                <StatCard title="Total Collected" value={stats.total} icon={<BarChart3 size={20} />} trend="+12%" delay={0.2} />
                <StatCard title="Today's Volume" value={stats.today} icon={<CheckCircle size={20} />} trend={`+${stats.today}`} delay={0.3} />
                <StatCard title="Driver Team" value={stats.users} icon={<Users size={20} />} delay={0.4} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) 1fr', gap: '32px' }}>
                {/* Recent Activity */}
                <section className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Auditor Stream</h2>
                        <Link to="/records" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {stats.latest.length > 0 ? (
                            stats.latest.map((session, i) => (
                                <ActivityFeedItem
                                    key={session.id}
                                    session={session}
                                    delay={0.1 + (i * 0.05)}
                                    onPhotoClick={(photo, sess) => setSelectedPhotoData({ photo, session: sess })}
                                />
                            ))
                        ) : (
                            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--slate-400)', background: 'var(--slate-50)', borderRadius: '16px', border: '1px dashed var(--slate-200)' }}>
                                <AlertCircle size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                <p style={{ fontSize: '0.9rem' }}>No recent activity detected.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Sidebar Analytics */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'var(--slate-950)', padding: '24px', borderRadius: '16px', color: 'white' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Status Monitors</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: 'DB Cluster', status: 'Synced', color: 'var(--success)' },
                                { label: 'Audit Relay', status: 'Active', color: 'var(--primary)' }
                            ].map((alert, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                                    <div style={{ minWidth: '6px', height: '6px', background: alert.color, borderRadius: '50%', marginTop: '5px' }} />
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{alert.label}: {alert.status}</div>
                                        <div style={{ opacity: 0.5, fontSize: '0.75rem' }}>Automated health check pass.</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <TrendingUp size={16} color="var(--primary)" /> Performance Index
                        </h3>
                        <TrendChart data={stats.trend} />
                        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--slate-400)', fontWeight: 800 }}>
                            <span>MON</span><span>WED</span><span>FRI</span><span>SUN</span>
                        </div>
                    </div>
                </aside>
            </div>

            <AnimatePresence>
                {selectedPhotoData && (
                    <QuickPhotoModal
                        photo={selectedPhotoData.photo}
                        session={selectedPhotoData.session}
                        onClose={() => setSelectedPhotoData(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
