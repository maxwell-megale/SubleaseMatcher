"use client";
import React from "react";
import Image from "next/image";
import profile from "@/../public/Navbar/profile.svg"; 
export default function ProfileIcon({ className = "" }) {
  return (
    <Image
      src={profile}
      alt="Profile"
      className={`w-7 h-7 ${className}`}
      priority
    />
  );
}