import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type IconSquareProps = {
  src: string;
  alt: string;
  onClick?: () => void;
  size?: "sm" | "md";
  variant?: "default" | "ghost";
  className?: string;
};

const SIZE_STYLES: Record<NonNullable<IconSquareProps["size"]>, string> = {
  sm: "size-9",
  md: "size-12",
};

export default function IconSquare({
  src,
  alt,
  onClick,
  size = "md",
  variant = "default",
  className,
}: IconSquareProps): React.ReactElement {
  const isGhost = variant === "ghost";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={alt}
      className={cn(
        "grid place-items-center rounded-xl border-[5px] focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[color:var(--color-primary-200)]",
        SIZE_STYLES[size],
        isGhost
          ? "border-transparent bg-transparent text-[color:var(--color-primary-900)]"
          : "border-[color:var(--color-primary-400)] bg-[color:var(--background)] text-[color:var(--color-primary-900)]",
        className,
      )}
    >
      <Image src={src} alt="" width={20} height={20} aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}
