"use client";

import React, { forwardRef, ReactNode } from "react";
import { DownloadButton } from "./DownloadButton";

interface WidgetLayoutProps {
  title: string;
  children: ReactNode;
  onDownload?: () => void;
  downloadTitle?: string;
  className?: string;
  maxHeight?: string;
  /** Optional ref for capturing widget as image */
  containerRef?: React.RefObject<HTMLDivElement | null>;
  /** Additional props for the container div */
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const WidgetLayout = forwardRef<HTMLDivElement, WidgetLayoutProps>(
  (
    {
      title,
      children,
      onDownload,
      downloadTitle,
      className = "",
      maxHeight = "380px",
      containerRef,
      containerProps = {},
    },
    ref
  ) => {
    const { style: containerStyle, ...restContainerProps } = containerProps;

    return (
      <div
        ref={containerRef || ref}
        className={`relative h-full w-full rounded-xl border border-brand-border/50 p-6 bg-brand-surface/20 overflow-hidden ${className}`}
        style={{ maxHeight, ...containerStyle }}
        {...restContainerProps}
      >
        {/* Title */}
        <div className="mb-4 flex-shrink-0">
          <h3 className="text-white text-lg font-normal whitespace-nowrap overflow-hidden text-ellipsis">
            {title}
          </h3>
        </div>

        {/* Content */}
        <div className="overflow-hidden flex-1">{children}</div>

        {/* Download Button */}
        {onDownload && (
          <DownloadButton onClick={onDownload} title={downloadTitle} />
        )}
      </div>
    );
  }
);

WidgetLayout.displayName = "WidgetLayout";
