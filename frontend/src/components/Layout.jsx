import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '../context/SessionContext';
import LanguageSwitcher from './LanguageSwitcher';
import { LogOut, LayoutDashboard } from 'lucide-react';

const Layout = ({ children }) => {
    const { driverName, isAdmin, logoutDriver, logoutAdmin } = useSession();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const isQrScreen = location.pathname === '/';
    const isScanner = location.pathname === '/scanner';
    const isAdminRoute = location.pathname.startsWith('/admin');

    const handleLogout = () => {
        if (isAdminRoute) {
            logoutAdmin();
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
        <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {!isScanner && (
                <header style={{
                    backgroundColor: 'var(--color-white)',
                    color: 'var(--color-gray-800)',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--color-gray-200)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* Simulated Back button if not home, for visual completeness matching design */}
                        {!isQrScreen && <button style={{ background: 'none', border: 'none', padding: 0, marginRight: '8px' }} onClick={() => navigate(-1)}><div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#eff6ff', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</div></button>}
                        <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('app.header_title')}</h1>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <LanguageSwitcher />

                        {driverName && !isAdminRoute && (
                            <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                                {driverName}
                            </span>
                        )}

                        {(driverName || isAdmin) && !isQrScreen && (
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'transparent',
                                    color: 'var(--color-gray-800)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    border: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: 500
                                }}
                            >
                                <LogOut size={20} />
                                <span style={{ display: 'none', '@media (min-width: 640px)': { display: 'inline' } }}>{t('app.logout')}</span>
                            </button>
                        )}
                    </div>
                </header>
            )}

            <main style={{ flex: 1, width: '100%', maxWidth: isScanner ? '100%' : '600px', padding: isScanner ? 0 : '1rem', margin: '0 auto', position: 'relative' }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
