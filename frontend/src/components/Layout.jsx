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
                    backgroundColor: '#144AE9',
                    color: '#FFFFFF',
                    paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
                    paddingBottom: '12px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    // Structurally locked shadow - zero repaint on scroll
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
                    // Locked height for zero layout shift
                    height: '64px',
                    // GPU Stabilization: Force compositor layer for zero jitter
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)',
                    willChange: 'transform'
                }}>
                    {/* Left Group: Back Button + Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {!isQrScreen && (
                            <button
                                onClick={() => navigate(-1)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.12)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'white',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
                            >
                                <span style={{ fontSize: '20px', lineHeight: 1, marginTop: '-2px' }}>‹</span>
                            </button>
                        )}
                        <img
                            src="https://burgersgroup.com/wp-content/uploads/2025/05/logo-blue.svg"
                            alt="Burgers Group Logo"
                            style={{
                                height: '22px',
                                width: 'auto',
                                display: 'block',
                                filter: 'brightness(0) invert(1)',
                                userSelect: 'none',
                                pointerEvents: 'none',
                                // Subtle vertical adjustment for optical centering
                                marginTop: '1px'
                            }}
                        />
                    </div>

                    {/* Right Group: Switcher & Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LanguageSwitcher />

                        {driverName && !isAdminRoute && (
                            <div className="driver-pill" style={{
                                background: 'rgba(255, 255, 255, 0.12)',
                                padding: '0 12px',
                                height: '36px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease'
                            }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: '#10b981',
                                    flexShrink: 0,
                                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)'
                                }}></div>
                                <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600, letterSpacing: '0.2px' }}>
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
