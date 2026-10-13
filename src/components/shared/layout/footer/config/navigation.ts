import { DISCORD_INVITE_URL } from "@/config/community";

export interface FooterLink {
    labelKey: string;
    href: string;
}

export interface FooterLinkSection {
    titleKey: string;
    links: FooterLink[];
}

export interface SocialLink {
    id: string;
    href: string;
    labelKey: string;
    /** Brand names need no translation; used as the label when set. */
    label?: string;
    external?: boolean;
}

export const footerLinksConfig: FooterLinkSection[] = [
    {
        titleKey: "product",
        links: [
            { labelKey: "features", href: "https://help.range4ex.com" },
            { labelKey: "pricing", href: "/pricing" },
            { labelKey: "templates", href: "/#payouts" },
            { labelKey: "integrations", href: "/#platforms" },
        ],
    },
    {
        titleKey: "company",
        links: [
            { labelKey: "about", href: "/#about" },
            { labelKey: "blog", href: "/blog" },
            { labelKey: "contact", href: "/contact" },
        ],
    },
    {
        titleKey: "resources",
        links: [
            { labelKey: "documentation", href: "/faq" },
        ],
    },
    {
        titleKey: "legal",
        links: [
            { labelKey: "privacyPolicy", href: "/legal/privacy" },
            { labelKey: "termsOfService", href: "/legal/terms" },
            { labelKey: "cookiePolicy", href: "/legal/cookies" },
            { labelKey: "gdpr", href: "/legal/gdpr" },
        ],
    },
];

export const socialLinksConfig: SocialLink[] = [
    { id: "discord", href: DISCORD_INVITE_URL, labelKey: "discord", label: "Discord", external: true },
    { id: "email", href: "mailto:helpdesk@range4ex.com", labelKey: "email" },
];


