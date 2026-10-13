"use client";

import React from "react";
import { IconDownload } from "@tabler/icons-react";

interface DownloadButtonProps {
  onClick: () => void;
  title?: string;
}

export function DownloadButton({
  onClick,
  title = "Download as PNG",
}: DownloadButtonProps) {
  return (
    <button
      className="absolute cursor-pointer top-4 right-6 p-2 bg-brand-surface/50 rounded-full text-text-muted hover:text-white transition-colors focus:outline-none"
      onClick={onClick}
      title={title}
    >
      <IconDownload />
    </button>
  );
}
