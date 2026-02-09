"use client";
import React from "react";
import Image from "next/image";
import matches from "@/../public/Navbar/matches.svg"; 

export default function MatchIcon({ className = "" }) {
  return (
    <Image
      src={matches}
      alt="Matches"
      className={`w-7.5 h-7.5 ${className}`}
      priority
    />
  );
}