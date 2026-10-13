// Gauge configuration constants and utilities

export const GAUGE_CONFIG = {
    cx: 150,
    cy: 140,
    outerRadius: 110,
    innerRadius: 75,
    needleAngle: 55,
    needleLength: 70,
    startAngle: Math.PI,
    endAngle: 0,
} as const;

export const TICK_ANGLES = [0, 36, 72, 108, 144, 180] as const;

// Animation configurations
export const ANIMATION_CONFIG = {
    initial: {
        from: 30,
        to: 80,
        duration: 2,
    },
    hover: {
        sequence: [85, 75, 80],
        duration: 2.2,
    },
} as const;

// Utility function to describe an arc path
export function describeArc(
    cx: number,
    cy: number,
    radius: number,
    start: number,
    end: number
): string {
    const startX = cx + radius * Math.cos(start);
    const startY = cy - radius * Math.sin(start);
    const endX = cx + radius * Math.cos(end);
    const endY = cy - radius * Math.sin(end);
    return `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
}

// Calculate needle tip position
export function getNeedleTipPosition(cx: number, cy: number, needleAngle: number, needleLength: number) {
    const needleRad = Math.PI - (needleAngle * Math.PI) / 180;
    const needleTipX = cx + needleLength * Math.cos(needleRad);
    const needleTipY = cy - needleLength * Math.sin(needleRad);
    return { needleTipX, needleTipY, needleRad };
}

// Calculate tick mark positions
export function getTickPosition(cx: number, cy: number, radius: number, angle: number) {
    const rad = Math.PI - (angle * Math.PI) / 180;
    return {
        x1: cx + (radius - 14) * Math.cos(rad),
        y1: cy - (radius - 14) * Math.sin(rad),
        x2: cx + (radius + 14) * Math.cos(rad),
        y2: cy - (radius + 14) * Math.sin(rad),
    };
}

// Calculate highlight segment path
export function getHighlightSegmentPath(cx: number, cy: number, radius: number): string {
    const segStart = Math.PI - (36 * Math.PI) / 180;
    const segEnd = Math.PI - (72 * Math.PI) / 180;
    const startX = cx + radius * Math.cos(segStart);
    const startY = cy - radius * Math.sin(segStart);
    const endX = cx + radius * Math.cos(segEnd);
    const endY = cy - radius * Math.sin(segEnd);
    return `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
}
