export type TrendDirection = "up" | "down" | "stable";

export interface BaseKpi {
    id: string;
    title: string;
    trend?: {
        direction: TrendDirection;
        value: string;
    };
    color?: string;
}

export interface NumberKpi extends BaseKpi {
    value: number;
}

export interface StringKpi extends BaseKpi {
    value: string;
}

export type Kpi = NumberKpi | StringKpi;

export interface KpiSectionProps {
    kpis: Kpi[];
    onKpisChange: (newKpis: Kpi[]) => void;
}

export interface SortableKpiItemProps {
    kpi: Kpi;
    isActive?: boolean;
}
