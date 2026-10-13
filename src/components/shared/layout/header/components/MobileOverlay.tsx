"use client";
import React from "react";

interface MobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileOverlay({ isOpen, onClose }: MobileOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden"
    />
  );
}
