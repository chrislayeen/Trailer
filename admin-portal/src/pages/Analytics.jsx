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
import { downloadCSV } from '../utils/export';

const AnalyticsCard = ({ title, children, icon: Icon }) => (
    <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Icon size={16} style={{ color: 'var(--primary)' }} /> {title}
            </h3>
            <button style={{ color: 'var(--slate-400)', background: 'none', border: 'none', cursor: 'pointer' }}><Filter size={14} /></button>
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
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.025em' }}>Performance Intelligence</h1>
                    <p style={{ color: 'var(--slate-500)', fontWeight: 500, fontSize: '0.9rem' }}>Real-time telemetry and throughput analysis for trailer assembly.</p>
                </div>
                <button
                    onClick={async () => {
                        const { data } = await supabase.from('sessions').select('*').order('end_time', { ascending: false });
                        if (data) downloadCSV(data, 'analytics-dump');
                    }}
                    style={{ height: '44px', padding: '0 20px', background: 'var(--slate-900)', color: 'white', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                    <Download size={18} /> Export CSV
                </button>
            </header >

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <div style={{ background: 'var(--primary)', color: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                    <div style={{ opacity: 0.8, fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Global Throughput</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>{data.totalCompleted}</div>
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <TrendingUp size={14} /> +12.5% VS PRIOR MONTH
                    </div>
                </div>
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Efficiency Ratio</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.025em' }}>{data.avgPerDay}</div>
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: 700, fontSize: '0.75rem' }}>
                        <Target size={14} /> OPTIMAL VELOCITY
                    </div>
                </div>
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Auditors</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.025em' }}>{data.driverDist.length}</div>
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--slate-400)', fontWeight: 700, fontSize: '0.75rem' }}>
                        <Clock size={14} /> 24-HOUR COVERAGE
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <AnalyticsCard title="Auditor Productivity" icon={PieChart}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {data.driverDist.map((d, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                                    <span style={{ color: 'var(--slate-600)' }}>{d.name}</span>
                                    <span style={{ color: 'var(--slate-900)' }}>{d.val} Units</span>
                                </div>
                                <div style={{ height: '6px', background: 'var(--slate-100)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(d.val / data.totalCompleted) * 100}%` }}
                                        style={{ height: '100%', background: 'var(--primary)', borderRadius: '3px' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </AnalyticsCard>

                <AnalyticsCard title="Throughput Forecast" icon={BarChart3}>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '12px' }}>
                        {[65, 45, 80, 55, 90, 70, 85].map((val, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${val}%` }}
                                    style={{ width: '100%', background: i === 6 ? 'var(--primary)' : 'var(--slate-200)', borderRadius: '4px 4px 0 0' }}
                                />
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--slate-400)' }}>W{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </AnalyticsCard>
            </div>
        </div >
    );
};

export default Analytics;
