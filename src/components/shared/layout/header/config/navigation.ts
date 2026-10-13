export interface NavLink {
    labelKey: string;
    href: string;
    minWidth?: number;
}

export const navigationConfig: NavLink[] = [
    { labelKey: "pricing", href: "/pricing", minWidth: 90 },
    { labelKey: "rules", href: "https://help.range4ex.com", minWidth: 90 },
    { labelKey: "faq", href: "/faq", minWidth: 90 },
];

export const ctaButtonConfig = {
    minWidth: 120,
};
