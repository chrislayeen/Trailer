import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import {
    BarChart3,
    TrendingUp,
    Calendar,
    Clock,
    Download,
    Filter,
    PieChart,
    Target
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { motion } from 'framer-motion';

const AnalyticsCard = ({ title, children, icon: Icon }) => (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={18} color="#3b82f6" /> {title}
            </h3>
            <button style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><Filter size={16} /></button>
        </div>
        {children}
    </div>
);

const Analytics = () => {
    const [data, setData] = useState({
        totalCompleted: 0,
        avgPerDay: 0,
        driverDist: [],
        monthlyTrend: []
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            const monthStart = startOfMonth(new Date()).toISOString();
            const { data: sessions } = await supabase
                .from('sessions')
                .select('driver_name, end_time')
                .eq('status', 'uploaded')
                .gte('end_time', monthStart);

            if (sessions) {
                // Driver distribution
                const dist = sessions.reduce((acc, s) => {
                    acc[s.driver_name] = (acc[s.driver_name] || 0) + 1;
                    return acc;
                }, {});

                setData({
                    totalCompleted: sessions.length,
                    avgPerDay: (sessions.length / new Date().getDate()).toFixed(1),
                    driverDist: Object.entries(dist).map(([name, val]) => ({ name, val })),
                    monthlyTrend: [12, 19, 15, 22, 30, 25, 35] // Placeholder trend
                });
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-1.5px' }}>Analytics Center</h1>
                    <p style={{ color: '#64748b', fontWeight: 500 }}>Deep-dive into performance metrics and throughput trends.</p>
                </div>
                <button style={{ padding: '0.75rem 1.25rem', background: '#0f172a', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Download size={18} /> EXPORT DATA
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)', color: 'white', padding: '1.5rem', borderRadius: '24px' }}>
                    <div style={{ opacity: 0.8, fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>MONTHLY THROUGHPUT</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{data.totalCompleted}</div>
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                        <TrendingUp size={14} /> +24% VS LAST MONTH
                    </div>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>AVG RECORDS / DAY</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' }}>{data.avgPerDay}</div>
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700, fontSize: '0.8rem' }}>
                        <Target size={14} /> ON TARGET
                    </div>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>ACTIVE DISPATCHERS</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' }}>{data.driverDist.length}</div>
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: 700, fontSize: '0.8rem' }}>
                        <Clock size={14} /> ACROSS 3 SHIFTS
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <AnalyticsCard title="Productivity by Inspector" icon={PieChart}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {data.driverDist.map((d, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                                    <span style={{ color: '#475569' }}>{d.name}</span>
                                    <span style={{ color: '#0f172a' }}>{d.val} Units</span>
                                </div>
                                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(d.val / data.totalCompleted) * 100}%` }}
                                        style={{ height: '100%', background: '#3b82f6' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </AnalyticsCard>

                <AnalyticsCard title="Volume Forecast" icon={BarChart3}>
                    <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '1rem' }}>
                        {[65, 45, 80, 55, 90, 70, 85].map((val, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${val}%` }}
                                    style={{ width: '100%', background: i === 6 ? '#3b82f6' : '#cbd5e1', borderRadius: '6px 6px 0 0' }}
                                />
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>W{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </AnalyticsCard>
            </div>
        </div>
    );
};

export default Analytics;
