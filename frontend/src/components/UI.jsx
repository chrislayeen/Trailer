import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', disabled = false, fullWidth = false, style = {} }) => {
    const baseStyle = {
        padding: '0.875rem 1.5rem',
        borderRadius: 'var(--radius-pill)',
        fontSize: '1rem',
        fontWeight: 600,
        transition: 'all 0.2s',
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        ...style
    };

    const variants = {
        primary: {
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(29, 78, 216, 0.3)'
        },
        secondary: {
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-gray-200)',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        },
        danger: {
            backgroundColor: 'var(--color-error)',
            color: 'white',
        },
        outline: {
            backgroundColor: 'transparent',
            border: '1px solid var(--color-gray-200)',
            color: 'var(--color-gray-800)'
        }
    };

    return (
        <button style={{ ...baseStyle, ...variants[variant] }} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
};

export const Input = ({ value, onChange, placeholder, type = 'text', label, error, ...props }) => {
    return (
        <div style={{ marginBottom: '1rem', width: '100%' }}>
            {label && <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-gray-800)' }}>{label}</label>}
            <div style={{ position: 'relative' }}>
                {props.icon && <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }}>{props.icon}</div>}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        paddingLeft: props.icon ? '3rem' : '1rem',
                        borderRadius: 'var(--radius-lg)',
                        border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-gray-200)'}`,
                        fontSize: '1rem',
                        outline: 'none',
                        backgroundColor: 'var(--color-white)',
                        transition: 'border-color 0.2s',
                    }}
                    {...props}
                />
            </div>
            {error && <span style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
        </div>
    );
};
