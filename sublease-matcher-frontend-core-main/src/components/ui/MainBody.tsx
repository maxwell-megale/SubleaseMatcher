"use client";
import React from 'react';

export default function MainBody({ children }: { children: React.ReactNode }) {

    return (
        <div className="min-h-dvh flex flex-col bg-[var(--background)] text-[var(--foreground)]">
            {children}
        </div>
    );
};