/**
 * Brand Color Filter Utilities
 * 
 * These utilities help transform blue-tinted images to match the brand color.
 * The original images are assumed to be blue (~210° on color wheel).
 * 
 * Color wheel reference:
 * - Red: 0°
 * - Orange: 30°
 * - Yellow: 60°
 * - Green: 120°
 * - Cyan: 180°
 * - Blue: 210°
 * - Purple: 270°
 * - Pink: 330°
 */

export interface BrandFilterOptions {
    /** Hue rotation in degrees (default from CSS var) */
    hueRotate?: number;
    /** Saturation multiplier, 1 = normal (default from CSS var) */
    saturate?: number;
    /** Brightness multiplier, 1 = normal (default from CSS var) */
    brightness?: number;
    /** Contrast multiplier, 1 = normal */
    contrast?: number;
}

/**
 * Get the CSS filter string for brand color matching.
 * Uses CSS variables by default, can be overridden with options.
 */
export function getBrandFilter(options?: BrandFilterOptions): string {
    // Use CSS variables as defaults, allowing runtime theme switching
    const filters: string[] = [];

    if (options?.hueRotate !== undefined) {
        filters.push(`hue-rotate(${options.hueRotate}deg)`);
    } else {
        filters.push("var(--brand-hue-rotate, hue-rotate(0deg))");
    }

    if (options?.saturate !== undefined) {
        filters.push(`saturate(${options.saturate})`);
    } else {
        filters.push("var(--brand-saturate, saturate(1))");
    }

    if (options?.brightness !== undefined) {
        filters.push(`brightness(${options.brightness})`);
    } else {
        filters.push("var(--brand-brightness, brightness(1))");
    }

    if (options?.contrast !== undefined) {
        filters.push(`contrast(${options.contrast})`);
    }

    return filters.join(" ");
}

/**
 * Pre-calculated filter presets for common brand color transformations.
 * Starting from blue (#3b82f6) source images.
 */
export const brandFilterPresets = {
    // No change - keep original blue
    blue: {
        hueRotate: 0,
        saturate: 1,
        brightness: 1,
    },
    // Blue to Green (#22c55e)
    green: {
        hueRotate: -90,
        saturate: 1.1,
        brightness: 1.05,
    },
    // Blue to Emerald/Teal (#10b981)
    emerald: {
        hueRotate: -60,
        saturate: 1.15,
        brightness: 1,
    },
    // Blue to Red (#ef4444)
    red: {
        hueRotate: 150,
        saturate: 1.2,
        brightness: 0.95,
    },
    // Blue to Orange (#f97316)
    orange: {
        hueRotate: 180,
        saturate: 1.3,
        brightness: 1.1,
    },
    // Blue to Purple (#a855f7)
    purple: {
        hueRotate: 60,
        saturate: 1.1,
        brightness: 1,
    },
    // Blue to Pink (#ec4899)
    pink: {
        hueRotate: 120,
        saturate: 1.15,
        brightness: 1.05,
    },
    // Blue to Cyan (#06b6d4)
    cyan: {
        hueRotate: -30,
        saturate: 1.1,
        brightness: 1.05,
    },
    // Blue to Yellow (#eab308)
    yellow: {
        hueRotate: -150,
        saturate: 1.4,
        brightness: 1.15,
    },
} as const;

export type BrandColorPreset = keyof typeof brandFilterPresets;

/**
 * Get filter string from a preset name
 */
export function getPresetFilter(preset: BrandColorPreset): string {
    const options = brandFilterPresets[preset];
    return getBrandFilter(options);
}
