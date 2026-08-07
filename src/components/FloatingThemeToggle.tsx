import React from "react";
import { Feather } from "lucide-react";

export default function FloatingThemeToggle() {
    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#FDFAF3] border border-[#D8CBB0] text-xs font-mono-stamp text-[#2B211A] shadow-sm">
                <Feather size={14} className="text-[#A6522C]" />
                <span className="hidden sm:inline text-[11px] font-mono-stamp text-[#2B211A]">Contrast Paper</span>
            </div>
        </div>
    );
}
