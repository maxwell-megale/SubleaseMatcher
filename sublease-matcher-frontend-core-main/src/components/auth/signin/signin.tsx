"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function SignIn({ redirectUrl }: { redirectUrl?: string }) {
  const router = useRouter();
  const userRef = useRef<HTMLDivElement>(null);
  const passRef = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState("");

  const submit = (e: React.MouseEvent) => {
    e.preventDefault();
    const username = (userRef.current?.innerText || "").trim();
    const password = (passRef.current?.innerText || "").trim();
    if (!username || !password) return setErr("Please enter username and password.");
    router.push(redirectUrl || "/");
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <div className="h-14 bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-between px-4 shadow-[0_3px_0_oklch(0.48_0_0/.28),0_1px_6px_oklch(0.48_0_0/.2)]">
        <div className="font-extrabold underline underline-offset-4">Sublease Matcher</div>
        <a href="/menu" aria-label="Open menu" role="button" className="w-9 h-7 grid place-items-center rounded-md">
          <div className="relative w-5 h-3.5">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--primary-foreground)] rounded" />
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--primary-foreground)] rounded" />
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-[var(--primary-foreground)] rounded" />
          </div>
        </a>
      </div>

      <div className="px-5 pt-6 pb-4 flex flex-col gap-5 max-w-[520px] w-full mx-auto">
        <div className="text-center font-extrabold text-[22px] drop-shadow-[0_2px_0_oklch(0.8_0_0/.35)]">Sign In</div>

        <div className="rounded-[var(--radius)] border-2 border-[oklch(0.62_0_0/.75)] shadow-[0_3px_0_oklch(0.48_0_0/.28),0_1px_6px_oklch(0.48_0_0/.2)] bg-[var(--card)] p-3">
          <div className="px-1 pb-2 text-[oklch(0.40_0_0)]">Username…</div>
          <div ref={userRef} role="textbox" aria-label="Username" contentEditable className="px-1 outline-none min-h-6" />
        </div>

        <div className="rounded-[var(--radius)] border-2 border-[oklch(0.62_0_0/.75)] shadow-[0_3px_0_oklch(0.48_0_0/.28),0_1px_6px_oklch(0.48_0_0/.2)] bg-[var(--card)] p-3">
          <div className="px-1 pb-2 text-[oklch(0.40_0_0)]">Password…</div>
          <div ref={passRef} role="textbox" aria-label="Password" contentEditable className="px-1 outline-none min-h-6" />
        </div>

        <a href="#submit" role="button" onClick={submit}
           className="block w-[min(320px,88%)] mx-auto text-center no-underline bg-[var(--primary)] text-[var(--primary-foreground)] font-extrabold rounded-[calc(var(--radius)*1.2)] shadow-[0_6px_0_oklch(0.48_0_0/.28),0_6px_22px_oklch(0.48_0_0/.2)] px-[18px] py-[14px] h-auto active:translate-y-0.5">
          Submit
        </a>

        <div className="flex items-center gap-3 px-2">
          <div className="flex-1 h-[2px] bg-[oklch(0.75_0_0/.7)]" />
          <div className="text-[oklch(0.35_0_0)]">or</div>
          <div className="flex-1 h-[2px] bg-[oklch(0.75_0_0/.7)]" />
        </div>

        <a href="/auth/uwec" className="block w-[min(360px,92%)] mx-auto text-center no-underline font-bold rounded-[calc(var(--radius)*1.2)] shadow-[0_6px_0_oklch(0.48_0_0/.28),0_6px_22px_oklch(0.48_0_0/.2)] px-[18px] py-[14px] bg-[var(--secondary,#e8e8ff)] text-[var(--foreground)]">
          UWEC Secure Sign On
        </a>

        <div className="min-h-5 text-center text-[oklch(0.56_0_0)]">{err}</div>
        <div className="text-center">
          <a href="/auth/register" className="no-underline underline-offset-2">Don’t have an account? Register</a>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
