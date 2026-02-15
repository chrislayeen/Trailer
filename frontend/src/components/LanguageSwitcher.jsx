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
                gap: '6px',
                background: isLight ? 'transparent' : 'rgba(0,0,0,0.3)',
                border: isLight ? '1px solid var(--color-gray-300)' : '1px solid rgba(255,255,255,0.3)',
                padding: '6px 12px',
                borderRadius: '20px',
                color: isLight ? 'var(--color-gray-700)' : 'white',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: isLight ? 'none' : 'blur(4px)',
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
