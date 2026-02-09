"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import SwipeIcon from "@/components/bottom-nav-icons/SwipeIcon";
import MatchIcon from "@/components/bottom-nav-icons/MatchIcon";
import ProfileIcon from "@/components/bottom-nav-icons/ProfileIcon";

export default function BottomNav() {
  const pathname = usePathname();

  const role = pathname.includes("/lister")
    ? "lister"
    : pathname.includes("/seeker")
    ? "seeker"
    : null;

  const tabs =
    role === "seeker"
      ? [
          { href: "/seeker/swipe-matcher", label: "Swipe", icon: SwipeIcon },
          { href: "/seeker/matches", label: "Matches", icon: MatchIcon },
          { href: "/seeker/view-profile", label: "Profile", icon: ProfileIcon },
        ]
      : role === "lister"
      ? [
          { href: "/lister/swipe-matcher", label: "Swipe", icon: SwipeIcon },
          { href: "/lister/matches", label: "Matches", icon: MatchIcon },
          { href: "/lister/view-profile", label: "Profile", icon: ProfileIcon },
        ]
      : [];

  return (
    <nav
      className="
        fixed bottom-4 left-1/2 -translate-x-1/2
        w-[90%] max-w-[400px]
        bg-white border border-[#E0E6FF]
        rounded-2xl shadow-[0_4px_15px_rgba(46,58,140,0.15)]
        flex justify-around items-center py-3 px-4
        z-50
      "
    >
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href ||
          pathname.startsWith(tab.href + "/") ||
          pathname.endsWith(tab.href.split("/").pop() ?? "");

        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center justify-center transition-all duration-300"
          >
            <div
              className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${
                isActive
                  ? "bg-[#E0E6FF] shadow-inner"
                  : "bg-transparent hover:bg-[#F3F4F6]"
              }`}
            >
              <Icon
                className={`w-6 h-6 transition-transform ${
                  isActive
                    ? "scale-110 text-[#2E3A8C]"
                    : "scale-100 text-gray-600"
                }`}
              />
            </div>
            <span
              className={`text-xs font-medium mt-1 ${
                isActive ? "text-[#2E3A8C]" : "text-gray-600"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}