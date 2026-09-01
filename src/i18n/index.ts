// src/i18n/index.ts
//
// Setup i18next + react-i18next. Diimpor sekali sebagai side-effect di main.tsx sebelum App
// dirender, supaya hook useTranslation() sudah siap dipakai di seluruh komponen.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import id from './locales/id';
import en from './locales/en';
import zh from './locales/zh';

export const SUPPORTED_LANGUAGES = ['id', 'en', 'zh'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Kunci localStorage terpisah dari kunci tema (`sqahub-theme` milik next-themes) agar tidak bentrok.
export const LANGUAGE_STORAGE_KEY = 'sqahub_lang';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            id: { translation: id },
            en: { translation: en },
            zh: { translation: zh },
        },
        // Bahasa Indonesia sebagai default — mayoritas konten aplikasi ini awalnya ditulis
        // dalam Bahasa Indonesia, jadi ini juga jadi fallback paling lengkap.
        fallbackLng: 'id',
        supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
        interpolation: {
            escapeValue: false, // React sudah otomatis escape output, tidak perlu i18next escape lagi.
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: LANGUAGE_STORAGE_KEY,
        },
    });

export default i18n;
