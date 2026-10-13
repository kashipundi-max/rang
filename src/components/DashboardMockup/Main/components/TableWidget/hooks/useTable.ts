"use client";

import { useRef, useCallback } from "react";
import domtoimage from "dom-to-image";

export function useTable() {
    const tableRef = useRef<HTMLDivElement>(null);

    const downloadAsPNG = useCallback(async () => {
        if (!tableRef.current) return;

        try {
            const dataUrl = await domtoimage.toPng(tableRef.current, {
                quality: 1,
                bgcolor: "#0f172a",
                width: tableRef.current.offsetWidth * 2,
                height: tableRef.current.offsetHeight * 2,
                style: {
                    transform: "scale(2)",
                    transformOrigin: "top left",
                    width: tableRef.current.offsetWidth + "px",
                    height: tableRef.current.offsetHeight + "px",
                },
            });

            const link = document.createElement("a");
            link.download = "customer-details-table.png";
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Error generating image:", error);
        }
    }, []);

    return {
        tableRef,
        downloadAsPNG,
    };
}
