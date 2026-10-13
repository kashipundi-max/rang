import { Kpi } from "../types";

export const initialKpis: Kpi[] = [
    {
        id: "kpi-1",
        title: "Total Users",
        value: 4200,
        trend: { direction: "up", value: "+320" },
    },
    {
        id: "kpi-2",
        title: "New Signups",
        value: 180,
        trend: { direction: "up", value: "+12%" },
    },
    {
        id: "kpi-3",
        title: "Active Engagements",
        value: 950,
        trend: { direction: "up", value: "+5%" },
    },
    {
        id: "kpi-4",
        title: "Retention Rate",
        value: "87%",
        trend: { direction: "stable", value: "0%" },
    },
    {
        id: "kpi-5",
        title: "Avg. Session Time",
        value: "6m 12s",
        trend: { direction: "up", value: "+0.5m" },
    },
];
