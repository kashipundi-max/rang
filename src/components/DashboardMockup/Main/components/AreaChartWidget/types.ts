export interface ChartDataPoint {
    time: string;
    users: number;
    bars: number;
}

export interface TooltipPayloadItem {
    value: number;
    dataKey: string;
    color: string;
}

export interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}
