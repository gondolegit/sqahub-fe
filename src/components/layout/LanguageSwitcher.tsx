// src/components/layout/LanguageSwitcher.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
    id: '🇮🇩',
    en: '🇬🇧',
    zh: '🇨🇳',
};

const LanguageSwitcher: React.FC = () => {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.resolvedLanguage ?? 'id') as SupportedLanguage;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={t('language.switchLabel')}>
                    <Languages className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                        key={lang}
                        onClick={() => i18n.changeLanguage(lang)}
                        className={currentLang === lang ? 'bg-accent text-accent-foreground' : ''}
                    >
                        <span className="mr-2">{LANGUAGE_FLAGS[lang]}</span> {t(`language.${lang}`)}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSwitcher;
