import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    Bot,
    ChevronRight,
    ShieldCheck,
    BarChart3
} from 'lucide-react';

const Layout = ({ children }) => {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { id: 'records', label: 'Session Records', icon: <FileText size={20} />, path: '/records' },
        { id: 'analytics', label: 'Analytics Center', icon: <BarChart3 size={20} />, path: '/analytics' },
        { id: 'settings', label: 'Manage Users', icon: <Settings size={20} />, path: '/settings' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                background: '#0f172a',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 100
            }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '8px', background: '#3b82f6', borderRadius: '10px' }}>
                            <Bot size={24} />
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.5px' }}>LOGISTICS ADMIN</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                        <ShieldCheck size={14} color="#10b981" /> SECURE MANAGEMENT
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '1.5rem 1rem' }}>
                    <div style={{ marginBottom: '1rem', paddingLeft: '1rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>Main Menu</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {navItems.map(item => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        color: isActive ? 'white' : '#94a3b8',
                                        background: isActive ? '#1e293b' : 'transparent',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span style={{ color: isActive ? '#3b82f6' : 'inherit' }}>{item.icon}</span>
                                    {item.label}
                                    {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#3b82f6' }} />}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{
                        padding: '12px',
                        background: '#1e293b',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '1rem'
                    }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                            {admin?.name?.substring(0, 1) || 'A'}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{admin?.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Administrator</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: '#fef2f2',
                            color: '#b91c1c',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, marginLeft: '280px', padding: '2.5rem' }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
