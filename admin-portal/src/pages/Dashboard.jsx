import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import {
    Users,
    CheckCircle,
    Clock,
    BarChart3,
    TrendingUp,
    ArrowRight,
    MapPin
} from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon, color, trend }) => (
    <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '20px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ padding: '10px', background: `${color}10`, color: color, borderRadius: '12px' }}>
                {icon}
            </div>
            {trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>
                    <TrendingUp size={14} /> {trend}
                </div>
            )}
        </div>
        <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{value}</div>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        today: 0,
        users: 0,
        latest: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // 1. Total Submissions
                const { count: totalCount } = await supabase
                    .from('sessions')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'uploaded');

                // 2. Today's Submissions
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const { count: todayCount } = await supabase
                    .from('sessions')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'uploaded')
                    .gte('end_time', today.toISOString());

                // 3. Unique Users
                const { data: userData } = await supabase
                    .from('sessions')
                    .select('driver_name');
                const uniqueUsers = new Set(userData.map(s => s.driver_name)).size;

                // 4. Latest Record
                const { data: latestData } = await supabase
                    .from('sessions')
                    .select('*, photos(*)')
                    .eq('status', 'uploaded')
                    .order('end_time', { ascending: false })
                    .limit(5);

                setStats({
                    total: totalCount || 0,
                    today: todayCount || 0,
                    users: uniqueUsers || 0,
                    latest: latestData || []
                });
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div>Loading statistics...</div>;

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Management Overview</h1>
                <p style={{ color: '#64748b' }}>Real-time monitoring of trailer assembly photo sessions.</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard title="Total Collected" value={stats.total} icon={<BarChart3 size={24} />} color="#3b82f6" trend="+12%" />
                <StatCard title="Today's Sessions" value={stats.today} icon={<CheckCircle size={24} />} color="#10b981" trend="+5" />
                <StatCard title="Active Inspectors" value={stats.users} icon={<Users size={24} />} color="#f59e0b" />
                <StatCard title="Avg. Time" value="4.2m" icon={<Clock size={24} />} color="#6366f1" />
            </div>

            {/* Recent Activity */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Latest Submissions</h2>
                    <button style={{ color: '#3b82f6', background: 'none', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        View All <ArrowRight size={16} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {stats.latest.map(session => (
                        <div key={session.id} style={{
                            background: 'white',
                            padding: '1.25rem',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            border: '1px solid #f1f5f9'
                        }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {session.photos && session.photos.length > 0 ? (
                                    <img
                                        src={supabase.storage.from('photos').getPublicUrl(session.photos[0].storage_path).data.publicUrl}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        alt="Preview"
                                    />
                                ) : (
                                    <CheckCircle size={24} color="#cbd5e1" />
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>Chassis #{session.chassis_id}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MapPin size={12} /> {session.gps_lat ? `${session.gps_lat}, ${session.gps_lng}` : 'Manual Entry'} • {session.driver_name}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{format(new Date(session.end_time), 'HH:mm')}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{format(new Date(session.end_time), 'MMM d, yyyy')}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
