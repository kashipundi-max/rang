import { useState, useCallback } from "react";

interface UseMobileMenuReturn {
    isMobileMenuOpen: boolean;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
}

export function useMobileMenu(): UseMobileMenuReturn {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen((prev) => !prev);
    }, []);

    const closeMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(false);
    }, []);

    return {
        isMobileMenuOpen,
        toggleMobileMenu,
        closeMobileMenu,
    };
}
