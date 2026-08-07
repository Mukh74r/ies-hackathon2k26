import React from "react";
import { Feather } from "lucide-react";

export default function FloatingThemeToggle() {
    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1A2433] border border-[#2E3B4E] text-xs font-mono-stamp text-[#FFFFFF] shadow-2xl">
                <Feather size={14} className="text-[#FF9900]" />
                <span className="hidden sm:inline text-[11px] font-mono-stamp text-[#FF9900]">AWS Cloud Theme</span>
            </div>
        </div>
    );
}
