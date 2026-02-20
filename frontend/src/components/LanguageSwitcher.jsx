import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ variant = 'light' }) => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'nl' ? 'en' : 'nl';
        i18n.changeLanguage(newLang);
    };

    const isLight = variant === 'light';

    return (
        <button
            onClick={toggleLanguage}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isLight ? 'var(--bg-surface)' : 'rgba(255,255,255,0.1)',
                border: isLight ? '1px solid var(--border-input)' : '1px solid rgba(255,255,255,0.2)',
                padding: '8px 10px',
                borderRadius: '999px',
                color: isLight ? 'var(--text-main)' : 'white',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: isLight ? 'none' : 'blur(8px)',
                boxShadow: isLight ? '0 1px 2px var(--shadow-color)' : 'none',
                fontFamily: 'inherit'
            }}
            title={i18n.language === 'nl' ? "Switch to English" : "Wissel naar Nederlands"}
        >
            <Globe size={14} />
            {i18n.language === 'nl' ? 'NL' : 'EN'}
        </button>
    );
};

export default LanguageSwitcher;
