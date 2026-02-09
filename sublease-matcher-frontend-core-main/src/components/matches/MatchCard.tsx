"use client";
import React from "react";
import Image from "next/image";

type Props = {
name: string;
age: number;
photoSrc: string;
  onOpen?: () => void;        
  onGetContact?: () => void;  
};

export default function MatchCard({ name, age, photoSrc, onOpen, onGetContact }: Props) {
return (
    <div className="select-none">

    <button
        type="button"
        onClick={onOpen}
        className="relative block w-full overflow-hidden rounded-2xl border-[5px] border-[color:var(--color-primary-900)] bg-[color:var(--color-primary-50)] shadow-[0_10px_24px_rgba(0,0,0,.14)] focus:outline-none"
        aria-label={`Open ${name}'s profile`}
    >

        <Image
          src={photoSrc}
          alt={`${name}'s photo`}
          width={320}
          height={176}
          className="h-44 w-full object-cover"
        />


        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />


        <div className="absolute bottom-2 left-2 rounded-xl bg-slate-100/95 px-3 py-1 text-sm font-semibold text-slate-800 shadow">
        {name}, {age}
        </div>
    </button>


    <div className="mt-1 px-1">
        <button
        type="button"
        onClick={onGetContact}
        className="text-sm font-semibold text-[var(--color-primary-900)] underline underline-offset-2 hover:text-[var(--color-primary-700)] focus:outline-none"
        >
        Get contact info
        </button>
    </div>
    </div>
  );
}
