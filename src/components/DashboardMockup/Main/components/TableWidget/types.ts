export interface TableRow {
    id: string;
    customer: string;
    date: string;
    amount: string;
    status: "Shipped" | "Delivered" | "Paid";
}

export type StatusType = "Shipped" | "Delivered" | "Paid";
