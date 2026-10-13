export interface BarData {
    height: number;
    isHighlighted: boolean;
}

export const bars: BarData[] = [
    { height: 55, isHighlighted: false },
    { height: 75, isHighlighted: false },
    { height: 100, isHighlighted: true },
    { height: 75, isHighlighted: false },
    { height: 55, isHighlighted: false },
];
