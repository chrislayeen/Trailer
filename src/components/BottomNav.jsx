import React from 'react';
import { Archive, Search, Camera, FileText, Shield } from 'lucide-react';

const BottomNav = () => {
    const navItems = [
        { icon: <Archive size={20} />, label: 'Archive', active: true },
        { icon: <Search size={20} />, label: 'Lookup', active: false },
        { icon: <Camera size={24} color="white" />, label: '', active: false, isFab: true },
        { icon: <FileText size={20} />, label: 'Logs', active: false },
        { icon: <Shield size={20} />, label: 'Security', active: false },
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'white',
            borderTop: '1px solid var(--color-gray-200)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 1.5rem',
            paddingBottom: '1.5rem', // Safe area
            zIndex: 50
        }}>
            {navItems.map((item, index) => (
                item.isFab ? (
                    <div key={index} style={{ position: 'relative', top: '-24px' }}>
                        <button style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            border: '4px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(29, 78, 216, 0.3)'
                        }}>
                            {item.icon}
                        </button>
                        {/* Pulsing effect */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '4px solid white',
                            zIndex: -1
                        }}></div>
                    </div>
                ) : (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', minWidth: '60px' }}>
                        <div style={{ color: item.active ? 'var(--color-primary)' : '#9ca3af' }}>
                            {item.icon}
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: item.active ? 'var(--color-primary)' : '#9ca3af', textTransform: 'uppercase' }}>
                            {item.label}
                        </span>
                    </div>
                )
            ))}
        </div>
    );
};

export default BottomNav;
