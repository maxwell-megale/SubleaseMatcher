import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type AddInfoButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

export default function AddInfoButton({
  label,
  onClick,
  className,
}: AddInfoButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border-[5px] border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-base font-semibold text-[color:var(--muted-foreground)] focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[color:var(--color-primary-200)]",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span>{label}</span>
      </div>
      <div className="flex items-center">
        <Image src="/plus-gray.svg" alt="" width={20} height={20} aria-hidden="true" className="opacity-100" />
      </div>
    </button>
  );
}
