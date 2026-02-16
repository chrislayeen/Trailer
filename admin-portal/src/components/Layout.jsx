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
    BarChart3,
    User,
    Menu
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
        { id: 'settings', label: 'User Management', icon: <Settings size={20} />, path: '/settings' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--slate-50)' }}>
            {/* Sidebar - Pocket Style (Floating & Navy) */}
            <aside style={{
                width: '260px',
                background: 'var(--sidebar-bg)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: 'calc(100vh - 40px)', // Floating look
                top: '20px',
                left: '20px',
                zIndex: 100,
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-float)',
                padding: '12px'
            }}>
                <div style={{ padding: '24px 24px 40px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ color: 'white' }}>
                        <Bot size={32} />
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>POCKET</div>
                </div>

                <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px 20px',
                                    borderRadius: 'var(--radius-lg)',
                                    color: isActive ? 'white' : 'var(--sidebar-text)',
                                    background: isActive ? 'var(--primary)' : 'transparent',
                                    textDecoration: 'none',
                                    fontWeight: isActive ? 700 : 500,
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '20px' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--sidebar-text)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            border: 'none',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--error)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--sidebar-text)'; }}
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', marginRight: '20px' }}>
                {/* Top Header - Transparent & Floating */}
                <header style={{
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '0 12px',
                    marginTop: '12px',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {/* Search Mockup Removed */}
                        <div />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-900)' }}>{admin?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>System Administrator</div>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '16px',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <User size={24} />
                            </div>
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '32px' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;

