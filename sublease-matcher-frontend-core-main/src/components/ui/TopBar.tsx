"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import BrandUnderline from "./BrandUnderline";
import TopBarMenu from "./TopBarMenu";

export default function TopBar({
  title = "Sublease Matcher",
  showMenu = true,
}) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  let homeLink = "/landing";
  if (session?.user) {
    const role = (session.user as any).role;
    if (role === "SEEKER") {
      homeLink = "/seeker/swipe-matcher";
    } else if (role === "HOST") {
      homeLink = "/lister/swipe-matcher";
    } else {
      homeLink = "/role-select";
    }
  }

  return (
    <div className="relative">
      <div
        className={`h-20 bg-[#232c99] text-white flex items-center ${showMenu ? "justify-between" : "justify-start"
          } px-5 shadow-[0_4px_0_rgba(0,0,0,.25),0_10px_24px_rgba(0,0,0,.18)]`}
      >
        <div className="relative">
          <div className="font-bold text-[18px] tracking-wide">
            <Link href={homeLink}>{title}</Link>
          </div>
          <BrandUnderline className="w-32 h-1" />
        </div>

        {showMenu && (
          <button
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="w-10 h-8 grid place-items-center rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
          >
            {open ? (
              <img
                src="/x.svg"
                alt="Close menu"
                className="w-6 h-6 filter invert brightness-0 saturate-0"
              />
            ) : (
              <div className="relative w-6 h-4">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-white rounded" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-white rounded" />
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white rounded" />
              </div>
            )}
          </button>
        )}
      </div>

      <TopBarMenu open={open} onClose={() => setOpen(false)} />
    </div>
  );
}