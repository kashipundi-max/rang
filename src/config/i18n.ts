export type Locale = 'en' | 'ar' | 'el' | 'es';

export const locales: Locale[] = ['en', 'ar', 'el', 'es'];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
    en: 'English',
    ar: 'العربية',
    el: 'Ελληνικά',
    es: 'Español',
};
