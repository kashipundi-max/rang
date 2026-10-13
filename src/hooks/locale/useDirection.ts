'use client'

import { useLocale } from './useLocale'
import { useEffect } from 'react'

export function useDirection() {
    const locale = useLocale()
    const isRTL = locale === 'ar'

    useEffect(() => {
        // Only update HTML dir attribute and lang
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
        document.documentElement.lang = locale
    }, [locale, isRTL])

    return { isRTL, direction: isRTL ? 'rtl' : 'ltr', locale }
}
