"use client";
import React from 'react';

type Props = {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  text: React.ReactNode;
};

// Reusable component for the selection link button
export default function SelectionButton({ href, onClick, icon, text }: Props) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="block w-full rounded-2xl mb-5 border-4 border-[var(--primary)] bg-[var(--card)] p-3 transition-colors hover:bg-gray-200 dark:hover:bg-gray-300 text-[var(--foreground)] text-left"
      >
        <div className="flex items-center gap-10 font-bold text-[var(--primary)]">
          {icon}
          {text}
        </div>
      </button>
    );
  }

  return (
    <a
      href={href}
      className="block rounded-2xl mb-5 border-4 border-[var(--primary)] bg-[var(--card)] p-3 transition-colors hover:bg-gray-200 dark:hover:bg-gray-300 no-underline text-[var(--foreground)]"
    >
      <div className="flex items-center gap-10 font-bold text-[var(--primary)]">
        {icon}
        {text}
      </div>
    </a>
  );
};

