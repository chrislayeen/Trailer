import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';
import nl from '../locales/nl.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            nl: { translation: nl },
        },
        fallbackLng: 'en', // Default language
        lng: 'en', // Force start with English as requested
        interpolation: {
            escapeValue: false, // React already safes from xss
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        }
    });

export default i18n;
