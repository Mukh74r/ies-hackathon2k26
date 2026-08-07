import React from "react";
import { Feather } from "lucide-react";

export default function FloatingThemeToggle() {
    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0F172A] border border-[#1E293B] text-xs font-mono-stamp text-[#F8FAFC] shadow-xl">
                <Feather size={14} className="text-[#38BDF8]" />
                <span className="hidden sm:inline text-[11px] font-mono-stamp text-[#38BDF8]">Modern Dark Studio</span>
            </div>
        </div>
    );
}
