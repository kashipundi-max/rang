'use client'

import { useParams } from 'next/navigation'
import { Locale, locales } from '@/config/i18n'

export function useLocale(): Locale {
    const params = useParams()
    const localeParam = params?.locale as string

    // Validate and return the locale from URL, default to 'en'
    if (localeParam && locales.includes(localeParam as Locale)) {
        return localeParam as Locale
    }

    return 'en'
}
