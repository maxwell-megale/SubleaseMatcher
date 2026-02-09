"use client";
import React, { useRef, useImperativeHandle, forwardRef } from "react";

export type FieldRef = { value: () => string; clear: () => void };

type Props = { label: string; ariaLabel: string; inputType: string };

function FieldImpl({ label, ariaLabel, inputType }: Props, ref: React.ForwardedRef<FieldRef>) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(ref, () => ({
    value: () => inputRef.current?.value?.trim() || "",
    clear: () => {
      if (inputRef.current) inputRef.current.value = "";
    },
  }));

  return (
    <div className="rounded-2xl border-4 border-[var(--primary)] bg-[var(--card)] p-3">
      <div className="text-[oklch(0.4_0_0)] pb-2">{label}</div>
      <input
        ref={inputRef}
        aria-label={ariaLabel}
        type={inputType}
        placeholder={ariaLabel}
        className="w-full bg-transparent outline-none text-lg"
      />
    </div>

    
    
  );
}


export default forwardRef<FieldRef, Props>(FieldImpl);
