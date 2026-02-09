"use client";

import React from "react";
import Link from "next/link";
import { TopBar, MainBody } from "@/components/ui";

const highlights = [
  "UW–Eau Claire students only",
  "Share your dates, budget, and preferences",
  "Connect safely before you commit",
];

const steps = [
  "Sign in with your UWEC email to join the community.",
  "Set what you need—or what you’re offering—and see aligned matches.",
  "Chat inside the platform and move forward with confidence.",
];

export default function HomePage() {
  return (
    <MainBody>
      <TopBar />

      <main className="bg-white text-[var(--foreground)]">
        <section className="max-w-5xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-50,#ebf3ff)] text-[var(--color-primary,#232c99)] px-4 py-2 text-sm font-semibold">
            Housing support for UW–Eau Claire
          </div>
          <div className="mt-6 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-[var(--color-primary-950,#131653)]">
              Find or list a sublease with Blugolds you trust.
            </h1>
            <p className="text-base sm:text-lg text-slate-700 max-w-2xl">
              Sublease Matcher keeps it simple: UWEC-only access, clear expectations, and in-app chat so you can sort housing without the noise.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center justify-center rounded-[var(--radius)] bg-[var(--color-primary,#232c99)] px-5 py-3 text-base font-bold text-white shadow-[0_10px_30px_rgba(35,44,153,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(35,44,153,0.32)]"
            >
              Get started
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[var(--color-primary-200,#bed4ff)] px-5 py-3 text-base font-semibold text-[var(--color-primary,#232c99)] transition hover:bg-[var(--color-primary-50,#ebf3ff)]"
            >
              How it works
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[var(--color-primary-100,#dbe8ff)] bg-[var(--color-primary-50,#ebf3ff)]/60 px-4 py-3 text-sm font-semibold text-[var(--color-primary-900,#232c99)]"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-[var(--card,#f8fafc)] border-y border-[var(--color-primary-100,#dbe8ff)]">
          <div className="max-w-5xl mx-auto px-6 lg:px-10 py-12 lg:py-16 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--color-primary-950,#131653)]">How it works</h2>
            <ol className="space-y-4 text-base text-slate-700">
              {steps.map((item, idx) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-[var(--color-secondary,#edac1a)] text-[#0b1026] grid place-items-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 lg:px-10 py-12 lg:py-14">
          <div className="rounded-3xl bg-gradient-to-r from-[var(--color-primary-900,#151f4b)] to-[var(--color-primary,#232c99)] text-white p-8 lg:p-10 shadow-[0_16px_46px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="text-sm font-semibold uppercase tracking-wide text-white/80">Ready to start?</div>
                <div className="text-2xl sm:text-3xl font-semibold leading-tight">Join with your UWEC email and find your fit.</div>
              </div>
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center justify-center rounded-[var(--radius)] bg-white px-5 py-3 text-base font-bold text-[var(--color-primary,#232c99)] shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>
    </MainBody>
  );
}
