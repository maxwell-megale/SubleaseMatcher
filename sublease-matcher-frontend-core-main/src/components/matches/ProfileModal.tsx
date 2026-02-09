"use client";

import React from "react";
import Image from "next/image";

interface ProfileModalProps {
isOpen: boolean;
onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
if (!isOpen) return null;

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

    <div className="w-full max-w-[520px] h-[80vh] bg-white rounded-3xl shadow-xl relative animate-fadeIn mx-4 flex flex-col overflow-hidden">

        <button
        onClick={onClose}
        className="absolute top-4 right-6"
        aria-label="Close"
        >
        <Image src="/x.svg" alt="Close" width={24} height={24} className="w-6 h-6 opacity-80 hover:opacity-100" />
        </button>

        <div className="mt-12 flex-1 flex items-center justify-center">
        <p className="text-lg font-semibold text-gray-800">
            Profile View Coming Soon
        </p>
        </div>
    </div>

    <style jsx>{`
        @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
        }
        .animate-fadeIn {
        animation: fadeIn 0.25s ease-out;
        }
    `}</style>
    </div>
);
}
