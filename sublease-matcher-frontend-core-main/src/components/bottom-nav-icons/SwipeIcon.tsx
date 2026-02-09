"use client";
import React from "react";
import Image from "next/image";
import swipe from "@/../public/Navbar/swipe.svg";

export default function SwipeIcon({ className = "" }) {
  return (
    <Image
      src={swipe}
      alt="Swipe"
      className={`w-7 h-7 ${className}`}
      priority
    />
  );
}