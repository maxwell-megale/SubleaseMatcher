"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function TopBarMenu({ open, onClose }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="
        absolute right-3 mt-3 w-[170px]
        bg-[#EEF3FA]                   
        border-2 border-[#283594]   
        rounded-xl shadow-sm z-50
      "
    >
      <Link
        href='/account-settings'
        onClick={onClose}
        className='
          block px-4 py-3
          text-[#283594] font-semibold text-[15px]
          rounded-t-[10px]
        '
      >
        Account Settings
      </Link>

      <div className="h-px bg-[#283594] opacity-60" />

      <button
        onClick={async () => {
          await signOut({ redirect: false });
          window.location.href = '/auth/sign-in';
          onClose();
        }}
        className='
          w-full text-left px-4 py-3
          text-[#283594] font-semibold text-[15px]
          hover:bg-[#E3E8F4]
          rounded-b-[10px]
        '
      >
        Sign Out
      </button>
    </div>
  );
}