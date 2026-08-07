import React from "react";
import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

export default function Footer() {
    return (
        <footer className='py-8 text-center text-sm text-slate-400 border-t border-white/5'>
            <div className="mb-3">© {new Date().getFullYear()} DeepHub AI. All rights reserved.</div>
            <div className="flex items-center justify-center gap-5 mb-4">
                <a href="https://www.linkedin.com/company/deephubai/" target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-colors">
                    <Linkedin className="w-4 h-4" />
                </a>
                <a href="https://www.instagram.com/deephubai?igsh=NnE2emgwY2lic3Zr" target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-colors">
                    <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="text-white/20 hover:text-white transition-colors">
                    <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="text-white/20 hover:text-white transition-colors">
                    <Youtube className="w-4 h-4" />
                </a>
            </div>
            <div className="flex items-center justify-center gap-6 text-xs text-white/30">
                <a href="/terms" className="hover:text-cyan-400 transition-colors">Terms &amp; Conditions</a>
                <span>·</span>
                <a href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
                <span>·</span>
                <a href="/refund" className="hover:text-cyan-400 transition-colors">Refund Policy</a>
            </div>
        </footer>
    );
}
