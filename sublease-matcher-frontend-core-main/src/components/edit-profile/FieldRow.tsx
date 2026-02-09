import React from "react";
import { cn } from "@/lib/utils";

type FieldRowProps = {
  label?: string;
  htmlFor?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function FieldRow({
  label,
  htmlFor,
  description,
  children,
  className,
  contentClassName,
}: FieldRowProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="text-sm font-semibold leading-5 text-[color:var(--color-primary-900)]"
        >
          {label}
        </label>
      ) : null}
      {description ? (
        <p className="text-xs text-[color:var(--color-primary-800)]">{description}</p>
      ) : null}
      <div className={cn("flex flex-col gap-3", contentClassName)}>{children}</div>
    </div>
  );
}
