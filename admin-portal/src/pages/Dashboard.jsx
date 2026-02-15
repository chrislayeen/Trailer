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
    AlertCircle
} from 'lucide-react';
import { format, subDays, startOfDay, isAfter } from 'date-fns';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, trend, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            border: '1px solid #f1f5f9'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', background: `${color}15`, color: color, borderRadius: '16px' }}>
                {icon}
            </div>
            {trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.75rem', fontWeight: 800, background: '#ecfdf5', padding: '4px 8px', borderRadius: '20px' }}>
                    <TrendingUp size={12} /> {trend}
                </div>
            )}
        </div>
        <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>{value}</div>
        </div>
    </motion.div>
);

const ActivityFeedItem = ({ session, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        style={{
            background: 'white',
            padding: '1.25rem',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            border: '1px solid #f8fafc'
        }}
    >
        <div style={{ position: 'relative' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {session.photos && session.photos.length > 0 ? (
                    <img
                        src={supabase.storage.from('photos').getPublicUrl(session.photos[0].storage_path).data.publicUrl}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        alt="Preview"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = ''; // Clear source
                            e.target.parentNode.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8"><AlertCircle size={20}/></div>';
                        }}
                    />
                ) : (
                    <CheckCircle size={22} color="#cbd5e1" />
                )}
            </div>
            {isAfter(new Date(session.end_time), subDays(new Date(), 0.01)) && (
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '12px', height: '12px', background: '#10b981', border: '2px solid white', borderRadius: '50%' }} />
            )}
        </div>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>Chassis #{session.chassis_id}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 600, color: '#475569' }}>{session.driver_name}</span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {session.gps_lat ? 'GPS Active' : 'Manual'}
                </div>
            </div>
        </div>
        <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{format(new Date(session.end_time), 'HH:mm')}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{format(new Date(session.end_time), 'MMM d')}</div>
        </div>
    </motion.div>
);

const TrendChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const width = 300;
    const height = 100;
    const padding = 10;

    const max = Math.max(...data, 5);
    const points = data.map((d, i) => ({
        x: padding + (i * (width - 2 * padding) / (data.length - 1)),
        y: height - (padding + (d / max * (height - 2 * padding)))
    }));

    const d = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={`${d} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`} fill="url(#lineGradient)" />
            <path d={d} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
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
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                        Logistics Console
                    </h1>
                    <p style={{ color: '#64748b', fontWeight: 500 }}>Global assembly monitoring and driver performance.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '8px 16px', borderRadius: '12px', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>
                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)' }} />
                    LIVE DISPATCH ACTIVE
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard title="Total Collected" value={stats.total} icon={<BarChart3 size={24} />} color="#3b82f6" trend="+12%" delay={0.1} />
                <StatCard title="Today's Sessions" value={stats.today} icon={<CheckCircle size={24} />} color="#10b981" trend={`+${stats.today}`} delay={0.2} />
                <StatCard title="Registered Drivers" value={stats.users} icon={<Users size={24} />} color="#f59e0b" delay={0.3} />
                <StatCard title="Currently Active" value={stats.activeNow} icon={<Activity size={24} />} color="#ef4444" delay={0.4} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2.5rem' }}>
                {/* Recent Activity */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Live Activity Feed</h2>
                        <button style={{ color: '#3b82f6', background: 'none', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            View All Logs <ArrowRight size={16} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.latest.length > 0 ? (
                            stats.latest.map((session, i) => (
                                <ActivityFeedItem key={session.id} session={session} delay={0.1 + (i * 0.05)} />
                            ))
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
                                <AlertCircle size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>No activity recorded in the last 24 hours.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Sidebar Analytics */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <TrendingUp size={18} color="#3b82f6" /> Efficiency Trend
                        </h3>
                        <TrendChart data={stats.trend} />
                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                            <span>MON</span>
                            <span>WED</span>
                            <span>FRI</span>
                            <span>SUN</span>
                        </div>
                    </div>

                    <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '24px', color: 'white' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>System Alerts</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }}>
                                <div style={{ minWidth: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%', marginTop: '4px' }} />
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>Backup Completed</div>
                                    <div style={{ opacity: 0.6 }}>Database synced successfully at 04:00 AM</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }}>
                                <div style={{ minWidth: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', marginTop: '4px' }} />
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>New Driver Onboarded</div>
                                    <div style={{ opacity: 0.6 }}>Inspector Mike joined the dispatch team.</div>
                                </div>
                            </div>
                        </div>
                        <button style={{ width: '100%', marginTop: '1.5rem', padding: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                            Manage System Notifications
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Dashboard;
