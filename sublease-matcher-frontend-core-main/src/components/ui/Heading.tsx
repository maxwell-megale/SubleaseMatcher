"use client";
import React from "react";

type Props = {
    text: string;
};

export default function Heading({ text }: Props) {
    return (
        <h1 className="text-center text-2xl font-extrabold text-[var(--primary)]">
            {text}
        </h1>
    );
}