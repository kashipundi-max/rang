"use client";
import React from "react";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileMenuButton({ isOpen, onToggle }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="group grid size-9 shrink-0 place-items-center rounded-full border border-white/10 lg:hidden"
      aria-label="Toggle menu"
    >
      <div className="relative w-4 h-3.5">
        {/* Top Line */}
        <span
          className={`absolute h-[1.5px] w-full bg-white inset-x-0 top-0 transition-all duration-300 ease-out ${
            isOpen ? "rotate-45 top-[6px]" : ""
          }`}
        />
        {/* Middle Line */}
        <span
          className={`absolute h-[1.5px] w-full bg-white inset-x-0 top-[6px] transition-all duration-200 ease-out ${
            isOpen ? "opacity-0" : "opacity-100"
          }`}
        />
        {/* Bottom Line */}
        <span
          className={`absolute h-[1.5px] w-full bg-white inset-x-0 bottom-0 transition-all duration-300 ease-out ${
            isOpen ? "-rotate-45 bottom-[6px]" : ""
          }`}
        />
      </div>
    </button>
  );
}
