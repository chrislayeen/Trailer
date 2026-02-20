import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '../context/SessionContext';
import LanguageSwitcher from './LanguageSwitcher';
import { LogOut, LayoutDashboard } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const { driverName, isAdmin, logoutDriver } = useSession();
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const isQrScreen = location.pathname === '/';
    const isScanner = location.pathname === '/scanner';
    const isAdminRoute = location.pathname.startsWith('/admin');

    const handleLogout = () => {
        if (isAdminRoute) {
            signOut();
            navigate('/admin/login');
        } else {
            logoutDriver();
            navigate('/');
        }
    };

    const handleAdminLink = () => {
        navigate('/admin');
    }

    return (
        <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
            {!isScanner && (
                <header style={{
                    backgroundColor: 'var(--bg-header)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    color: 'var(--text-main)',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-light)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    boxShadow: '0 4px 20px var(--shadow-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Elegant Back Button - Hidden on Home */}
                        {!isQrScreen && (
                            <button
                                onClick={() => navigate(-1)}
                                style={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-input)',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px var(--shadow-color)'
                                }}
                            >
                                <span style={{ color: 'var(--text-muted)', fontSize: '18px', lineHeight: 1, marginTop: '-2px' }}>‹</span>
                            </button>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h1 style={{ fontSize: 'min(4.5vw, 16px)', fontWeight: 800, letterSpacing: '-0.3px', margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                                {t('app.header_title')}
                            </h1>
                            <span className="header-subtitle" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {t('app.field_ops')}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                        <LanguageSwitcher />

                        {driverName && !isAdminRoute && (
                            <div className="driver-pill" style={{
                                background: 'var(--bg-surface)',
                                padding: '6px 12px',
                                borderRadius: '999px',
                                border: '1px solid var(--border-input)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }}></div>
                                <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 700, letterSpacing: '0.2px' }}>
                                    {driverName.split(' ')[0]}
                                </span>
                            </div>
                        )}
                    </div>
                </header>
            )}

            <main style={{ flex: 1, width: '100%', maxWidth: isScanner ? '100%' : '600px', padding: isScanner ? 0 : '20px', margin: '0 auto', position: 'relative' }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
