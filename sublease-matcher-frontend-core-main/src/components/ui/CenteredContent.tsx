"use client";
import React from 'react';

export default function CenteredContent({ children }: { children: React.ReactNode }) {

    return (
        <div className="px-5 pb-8 m-8 flex flex-col gap-5 max-w-lg w-full mx-auto mb-50">
            {children}
        </div>
    );
};