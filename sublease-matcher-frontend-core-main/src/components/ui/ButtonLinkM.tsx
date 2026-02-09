'use client';
import React from 'react';

type Props = {
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
};

export default function ButtonLinkM({ href, onClick, children, variant = 'primary' }: Props) {
  const base = "block w-[min(320px,88%)] mx-auto text-center no-underline font-extrabold rounded-[calc(var(--radius)*1.2)] px-[18px] py-[14px] h-auto active:translate-y-0.5";
  const styles = variant === 'primary'
    ? "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
    : "bg-[var(--secondary,#e8e8ff)] text-[var(--foreground)]";
  return (
    <a href={href || '#'} role="button" onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </a>
  );
}
