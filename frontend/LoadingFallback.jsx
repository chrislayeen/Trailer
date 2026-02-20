import React from 'react';

const LoadingFallback = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            minHeight: '50vh', // Ensure it takes up space during load
            color: 'var(--primary)',
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid var(--slate-200)',
                borderTop: '4px solid var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LoadingFallback;
