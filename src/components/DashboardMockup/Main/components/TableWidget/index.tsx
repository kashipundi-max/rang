"use client";

import React from "react";
import { tableData } from "./config";
import { useTable } from "./hooks";
import { TableHeader, TableRowItem } from "./components";
import { WidgetLayout } from "../shared";

export function TableWidget() {
  const { tableRef, downloadAsPNG } = useTable();

  return (
    <WidgetLayout
      title="Customer Details"
      onDownload={downloadAsPNG}
      downloadTitle="Download table as PNG"
      containerRef={tableRef}
      maxHeight="none"
    >
      {/* Table Container */}
      <div className="overflow-hidden rounded-lg border border-brand-border/50">
        <table className="w-full">
          <TableHeader />
          <tbody>
            {tableData.map((row, index) => (
              <TableRowItem key={row.id} row={row} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </WidgetLayout>
  );
}

export default TableWidget;
