"use client";
import React from "react";

type Props = {
  className?: string;
  colorVar?: string; // CSS variable to use for color (defaults to --brand-underline)
};

export default function BrandUnderline({ className = "w-32 h-1", colorVar = "--brand-underline" }: Props) {
  // we apply inline CSS var via style to allow Tailwind width/heigth classes
  return (
    <span
      aria-hidden
      className={`absolute left-0 -bottom-2 rounded-md ${className}`}
      style={{ background: `var(${colorVar})` }}
    />
  );
}
