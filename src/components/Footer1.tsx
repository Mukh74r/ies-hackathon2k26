import React from "react";
import { Instagram, Linkedin, Twitter, Youtube, Sparkles, Radio, CheckCircle2 } from "lucide-react";
import BrandLogo from "../assets/brand-logo-main.svg";

export default function Footer() {
    return (
        <footer className="bg-[#040711] border-t border-white/10 text-slate-400 text-xs font-sans-academic relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
                    
                    {/* Column 1: Brand & Mission */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <img src={BrandLogo} alt="DeepHub AI Logo" className="w-8 h-8 object-contain" />
                            <span className="font-display font-bold text-base text-white tracking-tight">
                                DeepHub AI
                            </span>
                            <span className="text-[10px] font-mono-stamp px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold uppercase">
                                V4.2
                            </span>
                        </div>
                        <p className="text-white/60 text-xs leading-relaxed max-w-sm">
                            World's first curriculum & examination architecture engine. Empowers educators with neural question generation, lesson blueprinting, and real-time STEM analytics.
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono-stamp">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>All Systems Operational</span>
                        </div>
                    </div>

                    {/* Column 2: Studio Tools */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono-stamp">
                            Studio Tools
                        </h4>
                        <ul className="space-y-2 text-white/60">
                            <li><a href="/turbo" className="hover:text-cyan-400 transition-colors">Question Paper Gen</a></li>
                            <li><a href="/turbo" className="hover:text-cyan-400 transition-colors">Lesson Plan Builder</a></li>
                            <li><a href="/turbo" className="hover:text-cyan-400 transition-colors">Homework Creator</a></li>
                            <li><a href="/turbo" className="hover:text-cyan-400 transition-colors">PPT Presentation Deck</a></li>
                            <li><a href="/turbo" className="hover:text-cyan-400 transition-colors">Paper & Step Solver</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Ecosystem */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono-stamp">
                            Ecosystem
                        </h4>
                        <ul className="space-y-2 text-white/60">
                            <li><a href="/virtualbrain" className="hover:text-cyan-400 transition-colors">Virtual Brain (Directory)</a></li>
                            <li><a href="/circuitbrain" className="hover:text-cyan-400 transition-colors">Circuit Brain (Robotics)</a></li>
                            <li><a href="/latest" className="hover:text-cyan-400 transition-colors">Latest AI News Feed</a></li>
                            <li><a href="/pricing" className="hover:text-cyan-400 transition-colors">Academic Pricing</a></li>
                            <li><a href="/turbo" className="hover:text-cyan-400 transition-colors">Tool Studio Builder</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Trust & Compliance */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono-stamp">
                            Compliance
                        </h4>
                        <ul className="space-y-2 text-white/60">
                            <li><a href="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                            <li><a href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                            <li><a href="/refund" className="hover:text-cyan-400 transition-colors">Refund & Cancellation</a></li>
                            <li><span className="text-white/40">NEP-2020 Aligned</span></li>
                            <li><span className="text-white/40">Bloom's Taxonomy Compliant</span></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-white/40 text-[11px]">
                        © {new Date().getFullYear()} DeepHub AI. Built with precision for educators worldwide.
                    </div>

                    {/* Social Icons */}
                    <div className="flex items-center gap-4">
                        <a href="https://www.linkedin.com/company/deephubai/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-cyan-400 hover:border-cyan-500/40 transition-all" title="LinkedIn">
                            <Linkedin className="w-3.5 h-3.5" />
                        </a>
                        <a href="https://www.instagram.com/deephubai?igsh=NnE2emgwY2lic3Zr" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-cyan-400 hover:border-cyan-500/40 transition-all" title="Instagram">
                            <Instagram className="w-3.5 h-3.5" />
                        </a>
                        <a href="#" className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-cyan-400 hover:border-cyan-500/40 transition-all" title="Twitter / X">
                            <Twitter className="w-3.5 h-3.5" />
                        </a>
                        <a href="#" className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-cyan-400 hover:border-cyan-500/40 transition-all" title="YouTube">
                            <Youtube className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

