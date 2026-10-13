import React, { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T, index: number) => ReactNode);
  align?: "left" | "center" | "right";
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: (item: T, index: number) => string;
}

// Helper function to safely convert any value to a ReactNode
const toReactNode = (value: unknown): ReactNode => {
  // null and undefined are valid ReactNodes
  if (value === null || value === undefined) {
    return value;
  }

  // If it's a primitive type, convert to string
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  // If it's already a valid ReactNode (like a JSX element), return it
  // This check isn't perfect but handles common cases
  if (
    React.isValidElement(value) ||
    Array.isArray(value) ||
    typeof value === "function"
  ) {
    return value as ReactNode;
  }

  // For objects, convert to string representation
  return String(value);
};

export default function Table<T extends object>({
  columns,
  data,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  rowClassName = () => "",
}: TableProps<T>) {
  return (
    <div
      className={`bg-bg-card dark:bg-bg-dark rounded-md border border-border-primary dark:border-border-secondary overflow-auto h-full ${className}`}
    >
      <table className="w-full border-collapse h-full overflow-auto">
        <thead>
          <tr
            className={`border-b border-border-primary dark:border-border-secondary bg-bg-card dark:bg-bg-dark ${headerClassName}`}
          >
            {columns.map((column, index) => (
              <th
                key={index}
                className={`p-4 font-semibold text-text-primary text-xs !bg-bg-card !dark:bg-bg-dark !text-text-primary ${
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                    ? "text-center"
                    : "text-left"
                }`}
                style={{
                  backgroundColor: "var(--color-bg-card)",
                  color: "var(--color-text-primary)",
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`text-xs ${bodyClassName}`}>
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-border-primary dark:border-border-secondary transition-colors duration-200 ${rowClassName(
                item,
                rowIndex
              )} group`}
              style={{
                backgroundColor: "var(--color-bg-card)",
              }}
            >
              {columns.map((column, colIndex) => {
                // Get the cell value
                const rawValue =
                  typeof column.accessor === "function"
                    ? column.accessor(item, rowIndex)
                    : item[column.accessor as keyof T];

                // Convert to a safe ReactNode
                const cellValue = toReactNode(rawValue);

                return (
                  <td
                    key={colIndex}
                    className={`p-4 !text-text-primary ${
                      column.align === "right"
                        ? "text-right"
                        : column.align === "center"
                        ? "text-center"
                        : "text-left"
                    }`}
                    style={{
                      color: "var(--color-text-primary)",
                      backgroundColor: "var(--color-bg-card)",
                    }}
                  >
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx global>{`
        .group:hover,
        .group:focus-within {
          background-color: var(--color-syntask-bg) !important;
        }
      `}</style>
    </div>
  );
}
