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
        <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            {!isScanner && !isQrScreen && (
                <header style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    color: '#0f172a',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Elegant Back Button */}
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                        >
                            <span style={{ color: '#475569', fontSize: '18px', lineHeight: 1, marginTop: '-2px' }}>‹</span>
                        </button>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h1 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.3px', margin: 0, color: '#0f172a' }}>
                                {t('app.header_title')}
                            </h1>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {t('app.field_ops')}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <LanguageSwitcher />

                        {driverName && !isAdminRoute && (
                            <div style={{
                                background: '#f8fafc',
                                padding: '6px 12px',
                                borderRadius: '999px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
                                <span style={{ fontSize: '13px', color: '#334155', fontWeight: 700, letterSpacing: '0.2px' }}>
                                    {driverName}
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
