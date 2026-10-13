export interface ThemeColors {
    name: string;
    id: string;
    preview: string; // Primary color for preview

    // Brand Image Filters
    brandHueRotate: string;
    brandSaturate: string;
    brandBrightness: string;

    // Background Colors
    bgDark: string;
    bgCard: string;

    // UI Colors
    syntaskBg: string;
    surfaceHover: string;
    borderPrimary: string;
    borderSecondary: string;

    // Brand Colors
    brandPrimary: string;
    brandPrimaryLight: string;
    brandSurface: string;
    brandBorder: string;
    brandGlow: string;
    accent: string;

    // Button Colors
    buttonText: string;

    // Error/Warning Colors
    error: string;
    errorLight: string;

    // Feature Card Colors
    cardBg: string;
    cardBgInner: string;
    cardBgGradientStart: string;
    cardOverlay: string;
    cardSurface: string;
    cardSurfaceHover: string;
    cardBorder: string;
    cardBorderHover: string;
    cardHighlightBg: string;
    cardHighlightBorder: string;
    cardGrid: string;
    cardGlow: string;
    cardGlowSecondary: string;
    cardSpotlight: string;
    cardParticle: string;
    cardAccent: string;
    cardAccentMuted: string;
}

export const themes: ThemeColors[] = [
    {
        name: "Monochrome",
        id: "monochrome",
        preview: "#e4e4e7",

        brandHueRotate: "hue-rotate(0deg)",
        brandSaturate: "saturate(0)",
        brandBrightness: "brightness(1.2)",

        bgDark: "#09090b",
        bgCard: "#18181b",

        syntaskBg: "#27272a",
        surfaceHover: "#3f3f46",
        borderPrimary: "#52525b",
        borderSecondary: "#3f3f46",

        brandPrimary: "#e4e4e7",
        brandPrimaryLight: "#ffffff",
        brandSurface: "#27272a",
        brandBorder: "#3f3f46",
        brandGlow: "#18181b",
        accent: "#ffffff",

        buttonText: "#09090b",

        error: "#f59e0b",
        errorLight: "#fbbf24",

        cardBg: "#09090b",
        cardBgInner: "#09090b",
        cardBgGradientStart: "#18181b",
        cardOverlay: "rgba(24, 24, 27, 0.95)",
        cardSurface: "#18181b",
        cardSurfaceHover: "#27272a",
        cardBorder: "#27272a",
        cardBorderHover: "rgba(228, 228, 231, 0.4)",
        cardHighlightBg: "#3f3f46",
        cardHighlightBorder: "#52525b",
        cardGrid: "#52525b",
        cardGlow: "rgba(255, 255, 255, 0.6)",
        cardGlowSecondary: "rgba(228, 228, 231, 0)",
        cardSpotlight: "rgba(228, 228, 231, 0.15)",
        cardParticle: "rgba(255, 255, 255, 0.4)",
        cardAccent: "#ffffff",
        cardAccentMuted: "#e4e4e7",
    },
    {
        name: "Blue",
        id: "blue",
        preview: "#3b82f6",

        brandHueRotate: "hue-rotate(0deg)",
        brandSaturate: "saturate(1)",
        brandBrightness: "brightness(1)",

        bgDark: "#00020f",
        bgCard: "#00041f",

        syntaskBg: "#17191c",
        surfaceHover: "#23252a",
        borderPrimary: "#37393c",
        borderSecondary: "#23263a",

        brandPrimary: "#3b82f6",
        brandPrimaryLight: "#60a5fa",
        brandSurface: "#1c2660",
        brandBorder: "#2a3a80",
        brandGlow: "#0a3375",
        accent: "#ccd8ff",

        buttonText: "#ffffff",

        error: "#f97316",
        errorLight: "#fb923c",

        cardBg: "#000610",
        cardBgInner: "#000610",
        cardBgGradientStart: "#000f1f",
        cardOverlay: "rgba(0, 15, 31, 0.95)",
        cardSurface: "#0a1520",
        cardSurfaceHover: "#0f1a2a",
        cardBorder: "#0e2240",
        cardBorderHover: "rgba(59, 130, 246, 0.4)",
        cardHighlightBg: "#1a2a40",
        cardHighlightBorder: "#2a4060",
        cardGrid: "#3b5a80",
        cardGlow: "rgba(96, 165, 250, 0.6)",
        cardGlowSecondary: "rgba(59, 130, 246, 0)",
        cardSpotlight: "rgba(59, 130, 246, 0.15)",
        cardParticle: "rgba(96, 165, 250, 0.4)",
        cardAccent: "#60a5fa",
        cardAccentMuted: "#3b82f6",
    },
    {
        name: "Purple",
        id: "purple",
        preview: "#a855f7",

        brandHueRotate: "hue-rotate(60deg)",
        brandSaturate: "saturate(1.2)",
        brandBrightness: "brightness(1)",

        bgDark: "#05000f",
        bgCard: "#08001a",

        syntaskBg: "#17191c",
        surfaceHover: "#23252a",
        borderPrimary: "#37393c",
        borderSecondary: "#23263a",

        brandPrimary: "#a855f7",
        brandPrimaryLight: "#c084fc",
        brandSurface: "#3b0764",
        brandBorder: "#581c87",
        brandGlow: "#2e1065",
        accent: "#e9d5ff",

        buttonText: "#ffffff",

        error: "#ec4899",
        errorLight: "#f472b6",

        cardBg: "#030008",
        cardBgInner: "#030008",
        cardBgGradientStart: "#080012",
        cardOverlay: "rgba(8, 0, 18, 0.95)",
        cardSurface: "#0a0510",
        cardSurfaceHover: "#0f0818",
        cardBorder: "#1a0830",
        cardBorderHover: "rgba(168, 85, 247, 0.4)",
        cardHighlightBg: "#2a1050",
        cardHighlightBorder: "#4a2080",
        cardGrid: "#402060",
        cardGlow: "rgba(192, 132, 252, 0.6)",
        cardGlowSecondary: "rgba(168, 85, 247, 0)",
        cardSpotlight: "rgba(168, 85, 247, 0.15)",
        cardParticle: "rgba(192, 132, 252, 0.4)",
        cardAccent: "#c084fc",
        cardAccentMuted: "#a855f7",
    },
    {
        name: "Cyan",
        id: "cyan",
        preview: "#06b6d4",

        brandHueRotate: "hue-rotate(-30deg)",
        brandSaturate: "saturate(1.1)",
        brandBrightness: "brightness(1.05)",

        bgDark: "#000508",
        bgCard: "#000a10",

        syntaskBg: "#17191c",
        surfaceHover: "#23252a",
        borderPrimary: "#37393c",
        borderSecondary: "#23263a",

        brandPrimary: "#06b6d4",
        brandPrimaryLight: "#22d3ee",
        brandSurface: "#164e63",
        brandBorder: "#155e75",
        brandGlow: "#083344",
        accent: "#a5f3fc",

        buttonText: "#ffffff",

        error: "#f59e0b",
        errorLight: "#fbbf24",

        cardBg: "#000305",
        cardBgInner: "#000305",
        cardBgGradientStart: "#00080a",
        cardOverlay: "rgba(0, 8, 12, 0.95)",
        cardSurface: "#030a0c",
        cardSurfaceHover: "#050f12",
        cardBorder: "#081820",
        cardBorderHover: "rgba(6, 182, 212, 0.4)",
        cardHighlightBg: "#0a3040",
        cardHighlightBorder: "#105060",
        cardGrid: "#205060",
        cardGlow: "rgba(34, 211, 238, 0.6)",
        cardGlowSecondary: "rgba(6, 182, 212, 0)",
        cardSpotlight: "rgba(6, 182, 212, 0.15)",
        cardParticle: "rgba(34, 211, 238, 0.4)",
        cardAccent: "#22d3ee",
        cardAccentMuted: "#06b6d4",
    },
    {
        name: "Emerald",
        id: "emerald",
        preview: "#10b981",

        brandHueRotate: "hue-rotate(100deg)",
        brandSaturate: "saturate(1.2)",
        brandBrightness: "brightness(1)",

        bgDark: "#020a06",
        bgCard: "#04150c",

        syntaskBg: "#171c18",
        surfaceHover: "#232b25",
        borderPrimary: "#374239",
        borderSecondary: "#233328",

        brandPrimary: "#10b981",
        brandPrimaryLight: "#34d399",
        brandSurface: "#064e3b",
        brandBorder: "#047857",
        brandGlow: "#065f46",
        accent: "#a7f3d0",

        buttonText: "#ffffff",

        error: "#f43f5e",
        errorLight: "#fb7185",

        cardBg: "#010604",
        cardBgInner: "#010604",
        cardBgGradientStart: "#03140e",
        cardOverlay: "rgba(3, 20, 14, 0.95)",
        cardSurface: "#051510",
        cardSurfaceHover: "#082118",
        cardBorder: "#0c3022",
        cardBorderHover: "rgba(16, 185, 129, 0.4)",
        cardHighlightBg: "#0c3527",
        cardHighlightBorder: "#10b981",
        cardGrid: "#064e3b",
        cardGlow: "rgba(52, 211, 153, 0.6)",
        cardGlowSecondary: "rgba(16, 185, 129, 0)",
        cardSpotlight: "rgba(16, 185, 129, 0.15)",
        cardParticle: "rgba(52, 211, 153, 0.4)",
        cardAccent: "#34d399",
        cardAccentMuted: "#10b981",
    },
    {
        name: "Rose",
        id: "rose",
        preview: "#f43f5e",

        brandHueRotate: "hue-rotate(300deg)",
        brandSaturate: "saturate(1.2)",
        brandBrightness: "brightness(1)",

        bgDark: "#0a0003",
        bgCard: "#140007",

        syntaskBg: "#1c1719",
        surfaceHover: "#2b2326",
        borderPrimary: "#42373a",
        borderSecondary: "#332328",

        brandPrimary: "#f43f5e",
        brandPrimaryLight: "#fb7185",
        brandSurface: "#4c0519",
        brandBorder: "#9f1239",
        brandGlow: "#881337",
        accent: "#fecdd3",

        buttonText: "#ffffff",

        error: "#f97316",
        errorLight: "#fb923c",

        cardBg: "#050002",
        cardBgInner: "#050002",
        cardBgGradientStart: "#140007",
        cardOverlay: "rgba(20, 0, 7, 0.95)",
        cardSurface: "#1a050f",
        cardSurfaceHover: "#250817",
        cardBorder: "#3b0c22",
        cardBorderHover: "rgba(244, 63, 94, 0.4)",
        cardHighlightBg: "#3d0822",
        cardHighlightBorder: "#f43f5e",
        cardGrid: "#4c0519",
        cardGlow: "rgba(251, 113, 133, 0.6)",
        cardGlowSecondary: "rgba(244, 63, 94, 0)",
        cardSpotlight: "rgba(244, 63, 94, 0.15)",
        cardParticle: "rgba(251, 113, 133, 0.4)",
        cardAccent: "#fb7185",
        cardAccentMuted: "#f43f5e",
    },
    {
        name: "Amber",
        id: "amber",
        preview: "#f59e0b",

        brandHueRotate: "hue-rotate(190deg)",
        brandSaturate: "saturate(1.2)",
        brandBrightness: "brightness(1)",

        bgDark: "#0a0600",
        bgCard: "#140c00",

        syntaskBg: "#1c1a17",
        surfaceHover: "#2b2823",
        borderPrimary: "#423e37",
        borderSecondary: "#332c23",

        brandPrimary: "#f59e0b",
        brandPrimaryLight: "#fbbf24",
        brandSurface: "#451a03",
        brandBorder: "#78350f",
        brandGlow: "#b45309",
        accent: "#fde68a",

        buttonText: "#ffffff",

        error: "#dc2626",
        errorLight: "#f87171",

        cardBg: "#050300",
        cardBgInner: "#050300",
        cardBgGradientStart: "#140c00",
        cardOverlay: "rgba(20, 12, 0, 0.95)",
        cardSurface: "#1a1005",
        cardSurfaceHover: "#251808",
        cardBorder: "#3b220c",
        cardBorderHover: "rgba(245, 158, 11, 0.4)",
        cardHighlightBg: "#3d2208",
        cardHighlightBorder: "#f59e0b",
        cardGrid: "#451a03",
        cardGlow: "rgba(251, 191, 36, 0.6)",
        cardGlowSecondary: "rgba(245, 158, 11, 0)",
        cardSpotlight: "rgba(245, 158, 11, 0.15)",
        cardParticle: "rgba(251, 191, 36, 0.4)",
        cardAccent: "#fbbf24",
        cardAccentMuted: "#f59e0b",
    },
    {
        name: "Indigo",
        id: "indigo",
        preview: "#6366f1",

        brandHueRotate: "hue-rotate(20deg)",
        brandSaturate: "saturate(1.1)",
        brandBrightness: "brightness(1)",

        bgDark: "#03020d",
        bgCard: "#07041a",

        syntaskBg: "#17171c",
        surfaceHover: "#23232b",
        borderPrimary: "#373742",
        borderSecondary: "#232338",

        brandPrimary: "#6366f1",
        brandPrimaryLight: "#818cf8",
        brandSurface: "#1e1b4b",
        brandBorder: "#312e81",
        brandGlow: "#3730a3",
        accent: "#c7d2fe",

        buttonText: "#ffffff",

        error: "#ec4899",
        errorLight: "#f472b6",

        cardBg: "#020106",
        cardBgInner: "#020106",
        cardBgGradientStart: "#07041a",
        cardOverlay: "rgba(7, 4, 26, 0.95)",
        cardSurface: "#0c0a1f",
        cardSurfaceHover: "#130f30",
        cardBorder: "#1f1a4f",
        cardBorderHover: "rgba(99, 102, 241, 0.4)",
        cardHighlightBg: "#221d5a",
        cardHighlightBorder: "#6366f1",
        cardGrid: "#312e81",
        cardGlow: "rgba(129, 140, 248, 0.6)",
        cardGlowSecondary: "rgba(99, 102, 241, 0)",
        cardSpotlight: "rgba(99, 102, 241, 0.15)",
        cardParticle: "rgba(129, 140, 248, 0.4)",
        cardAccent: "#818cf8",
        cardAccentMuted: "#6366f1",
    },
    {
        name: "Crimson",
        id: "crimson",
        preview: "#ef4444",

        brandHueRotate: "hue-rotate(150deg)",
        brandSaturate: "saturate(1.3)",
        brandBrightness: "brightness(1)",

        bgDark: "#0d0202",
        bgCard: "#1a0505",

        syntaskBg: "#1c1717",
        surfaceHover: "#2b2323",
        borderPrimary: "#423737",
        borderSecondary: "#332323",

        brandPrimary: "#ef4444",
        brandPrimaryLight: "#fca5a5",
        brandSurface: "#7f1d1d",
        brandBorder: "#991b1b",
        brandGlow: "#dc2626",
        accent: "#fee2e2",

        buttonText: "#ffffff",

        error: "#dc2626",
        errorLight: "#f87171",

        cardBg: "#050101",
        cardBgInner: "#050101",
        cardBgGradientStart: "#1a0505",
        cardOverlay: "rgba(26, 5, 5, 0.95)",
        cardSurface: "#1a0909",
        cardSurfaceHover: "#250f0f",
        cardBorder: "#3b1515",
        cardBorderHover: "rgba(239, 68, 68, 0.4)",
        cardHighlightBg: "#3d1515",
        cardHighlightBorder: "#ef4444",
        cardGrid: "#7f1d1d",
        cardGlow: "rgba(252, 165, 165, 0.6)",
        cardGlowSecondary: "rgba(239, 68, 68, 0)",
        cardSpotlight: "rgba(239, 68, 68, 0.15)",
        cardParticle: "rgba(252, 165, 165, 0.4)",
        cardAccent: "#fca5a5",
        cardAccentMuted: "#ef4444",
    },
    {
        name: "Teal",
        id: "teal",
        preview: "#14b8a6",

        brandHueRotate: "hue-rotate(80deg)",
        brandSaturate: "saturate(1.2)",
        brandBrightness: "brightness(1)",

        bgDark: "#000a0a",
        bgCard: "#001717",

        syntaskBg: "#171c1c",
        surfaceHover: "#232b2b",
        borderPrimary: "#374242",
        borderSecondary: "#233333",

        brandPrimary: "#14b8a6",
        brandPrimaryLight: "#5eead4",
        brandSurface: "#115e59",
        brandBorder: "#0f766e",
        brandGlow: "#0d9488",
        accent: "#ccfbf1",

        buttonText: "#ffffff",

        error: "#ef4444",
        errorLight: "#f87171",

        cardBg: "#000505",
        cardBgInner: "#000505",
        cardBgGradientStart: "#001717",
        cardOverlay: "rgba(0, 23, 23, 0.95)",
        cardSurface: "#051a1a",
        cardSurfaceHover: "#082626",
        cardBorder: "#0c3b3b",
        cardBorderHover: "rgba(20, 184, 166, 0.4)",
        cardHighlightBg: "#0c3d3d",
        cardHighlightBorder: "#14b8a6",
        cardGrid: "#115e59",
        cardGlow: "rgba(94, 234, 212, 0.6)",
        cardGlowSecondary: "rgba(20, 184, 166, 0)",
        cardSpotlight: "rgba(20, 184, 166, 0.15)",
        cardParticle: "rgba(94, 234, 212, 0.4)",
        cardAccent: "#5eead4",
        cardAccentMuted: "#14b8a6",
    },
    {
        name: "Fuchsia",
        id: "fuchsia",
        preview: "#d946ef",

        brandHueRotate: "hue-rotate(250deg)",
        brandSaturate: "saturate(1.2)",
        brandBrightness: "brightness(1)",

        bgDark: "#08000d",
        bgCard: "#140021",

        syntaskBg: "#1b171c",
        surfaceHover: "#2a232b",
        borderPrimary: "#403742",
        borderSecondary: "#312338",

        brandPrimary: "#d946ef",
        brandPrimaryLight: "#f0abfc",
        brandSurface: "#701a75",
        brandBorder: "#a21caf",
        brandGlow: "#c084fc",
        accent: "#fae8ff",

        buttonText: "#ffffff",

        error: "#ef4444",
        errorLight: "#f87171",

        cardBg: "#040006",
        cardBgInner: "#040006",
        cardBgGradientStart: "#140021",
        cardOverlay: "rgba(20, 0, 33, 0.95)",
        cardSurface: "#1a0529",
        cardSurfaceHover: "#26083b",
        cardBorder: "#3a0c5c",
        cardBorderHover: "rgba(217, 70, 239, 0.4)",
        cardHighlightBg: "#3b0c5c",
        cardHighlightBorder: "#d946ef",
        cardGrid: "#701a75",
        cardGlow: "rgba(240, 171, 252, 0.6)",
        cardGlowSecondary: "rgba(217, 70, 239, 0)",
        cardSpotlight: "rgba(217, 70, 239, 0.15)",
        cardParticle: "rgba(240, 171, 252, 0.4)",
        cardAccent: "#f0abfc",
        cardAccentMuted: "#d946ef",
    },
    {
        name: "Lime",
        id: "lime",
        preview: "#84cc16",

        brandHueRotate: "hue-rotate(120deg)",
        brandSaturate: "saturate(1.2)",
        brandBrightness: "brightness(1)",

        bgDark: "#060800",
        bgCard: "#0d1200",

        syntaskBg: "#181c17",
        surfaceHover: "#252b23",
        borderPrimary: "#394237",
        borderSecondary: "#2a3323",

        brandPrimary: "#84cc16",
        brandPrimaryLight: "#bef264",
        brandSurface: "#3f6212",
        brandBorder: "#4d7c0f",
        brandGlow: "#65a30d",
        accent: "#ecfccb",

        buttonText: "#09090b",

        error: "#ef4444",
        errorLight: "#f87171",

        cardBg: "#030400",
        cardBgInner: "#030400",
        cardBgGradientStart: "#0d1200",
        cardOverlay: "rgba(13, 18, 0, 0.95)",
        cardSurface: "#0f1705",
        cardSurfaceHover: "#162108",
        cardBorder: "#22330c",
        cardBorderHover: "rgba(132, 204, 22, 0.4)",
        cardHighlightBg: "#22350c",
        cardHighlightBorder: "#84cc16",
        cardGrid: "#3f6212",
        cardGlow: "rgba(190, 242, 100, 0.6)",
        cardGlowSecondary: "rgba(132, 204, 22, 0)",
        cardSpotlight: "rgba(132, 204, 22, 0.15)",
        cardParticle: "rgba(190, 242, 100, 0.4)",
        cardAccent: "#bef264",
        cardAccentMuted: "#84cc16",
    },
];
