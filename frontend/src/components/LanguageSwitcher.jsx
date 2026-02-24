import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ variant = 'light' }) => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'nl' ? 'en' : 'nl';
        i18n.changeLanguage(newLang);
    };

    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <button
            onClick={toggleLanguage}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '0 12px',
                height: '36px',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
            }}
            title={i18n.language === 'nl' ? "Switch to English" : "Wissel naar Nederlands"}
        >
            <Globe size={14} color="white" />
            {i18n.language === 'nl' ? 'NL' : 'EN'}
        </button>
    );
};

export default LanguageSwitcher;
