import { TableRow } from "../types";

export const tableData: TableRow[] = [
    {
        id: "RZ17308",
        customer: "Pranjalpets",
        date: "13/01/2025",
        amount: "$ 54 000",
        status: "Shipped",
    },
    {
        id: "RZ8308",
        customer: "Adom.com",
        date: "13/01/2025",
        amount: "$ 86 050",
        status: "Delivered",
    },
    {
        id: "RZ8765",
        customer: "Charles Tea",
        date: "13/01/2025",
        amount: "$ 4 000",
        status: "Paid",
    },
];

export const statusStyles = {
    Shipped: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    Delivered: "bg-green-500/20 text-green-400 border border-green-500/30",
    Paid: "bg-brand-primary/20 text-brand-primary-light border border-brand-primary/30",
};
