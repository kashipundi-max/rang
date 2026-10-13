'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from '../locale/useLocale'

export function useAppNavigation() {
    const router = useRouter()
    const pathname = usePathname()
    const currentLocale = useLocale()

    const navigateToLocale = (currentPath: string, newLocale: string) => {
        // Remove current locale prefix from the path
        const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}(\/|$)/, '/')

        // Construct new path with new locale
        const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`

        router.push(newPath)
    }

    const navigate = (path: string) => {
        // Add current locale to path if not already present
        if (!path.match(/^\/[a-z]{2}(\/|$)/)) {
            path = `/${currentLocale}${path.startsWith('/') ? path : `/${path}`}`
        }
        router.push(path)
    }

    return {
        navigateToLocale,
        navigate,
        currentLocale,
        pathname,
        router,
    }
}
