import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiEndpoint } from "../utils/api";

/* ═══════════════════════════════════════════════════════════
   COMPLETE PROFILE — Simple centered layout (matches Login)
═══════════════════════════════════════════════════════════ */
export default function CompleteProfile() {
    const { user, token, updateDeepHubUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [focused, setFocused] = useState<string | null>(null);

    // Pre-fill from Google data
    const [firstName, setFirstName] = useState(user?.firstName || user?.name?.split(' ')[0] || '');
    const [lastName, setLastName]   = useState(user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '');
    const [dob, setDob]             = useState(user?.dob || '');
    const [occupation, setOccupation] = useState(user?.occupation || '');

    // If user already has DOB + occupation set, skip this page
    useEffect(() => {
        if (user?.dob && user?.occupation) {
            navigate('/latest', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(apiEndpoint("/api/auth/profile"), {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ firstName, lastName, dob, occupation, name: `${firstName} ${lastName}`.trim() }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to update profile");
            }

            updateDeepHubUser({ firstName, lastName, dob, occupation, name: `${firstName} ${lastName}`.trim() });
            navigate("/latest");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const fc = (id: string) =>
        `rounded-xl overflow-hidden border transition-all duration-300 ${focused === id ? "border-white/25 bg-white/[0.04] shadow-[0_0_18px_rgba(255,255,255,0.05)]" : "border-white/[0.08] bg-white/[0.015]"}`;

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black px-4 py-8"
            style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>

            {/* ─── CENTERED PANEL ─── */}
            <div className="relative z-10 w-full max-w-[480px] bg-black/40 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col justify-center">

                {/* Heading */}
                <div className="mb-8 text-center">
                    <h1 className="text-[2rem] font-black tracking-tight text-white leading-tight">Almost There</h1>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.25em] font-semibold text-white/30">Complete Your Profile</p>
                </div>

                {/* Google avatar + email */}
                {user && (
                    <div className="flex items-center justify-center gap-3 mb-6">
                        {user.avatar && (
                            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                        )}
                        <span className="text-[12px] text-white/40">{user.email}</span>
                    </div>
                )}

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                <ShieldAlert size={14} className="text-red-400 mt-0.5 shrink-0" />
                                <p className="text-[12px] text-red-300/90 leading-snug">{error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Name row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="block text-[9.5px] uppercase tracking-[0.2em] font-bold text-white/30 pl-0.5">First Name</label>
                            <div className={fc("fn")}>
                                <input
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    type="text"
                                    placeholder="John"
                                    required
                                    className="w-full px-4 py-3.5 bg-transparent text-white text-sm outline-none placeholder:text-white/20"
                                    onFocus={() => setFocused("fn")}
                                    onBlur={() => setFocused(null)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[9.5px] uppercase tracking-[0.2em] font-bold text-white/30 pl-0.5">Last Name</label>
                            <div className={fc("ln")}>
                                <input
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    type="text"
                                    placeholder="Doe"
                                    required
                                    className="w-full px-4 py-3.5 bg-transparent text-white text-sm outline-none placeholder:text-white/20"
                                    onFocus={() => setFocused("ln")}
                                    onBlur={() => setFocused(null)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-1.5">
                        <label className="block text-[9.5px] uppercase tracking-[0.2em] font-bold text-white/30 pl-0.5">Date of Birth</label>
                        <div className={fc("dob")}>
                            <input
                                value={dob}
                                onChange={e => setDob(e.target.value)}
                                type="date"
                                required
                                className="w-full px-4 py-3.5 bg-transparent text-white/60 focus:text-white text-sm outline-none"
                                onFocus={() => setFocused("dob")}
                                onBlur={() => setFocused(null)}
                            />
                        </div>
                    </div>

                    {/* Occupation */}
                    <div className="space-y-1.5">
                        <label className="block text-[9.5px] uppercase tracking-[0.2em] font-bold text-white/30 pl-0.5">Occupation</label>
                        <div className={fc("occ")}>
                            <input
                                value={occupation}
                                onChange={e => setOccupation(e.target.value)}
                                type="text"
                                placeholder="Student, Teacher, Researcher..."
                                required
                                className="w-full px-4 py-3.5 bg-transparent text-white text-sm outline-none placeholder:text-white/20"
                                onFocus={() => setFocused("occ")}
                                onBlur={() => setFocused(null)}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.01, boxShadow: "0 0 28px rgba(255,255,255,0.14)" }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-2 py-[15px] rounded-xl font-bold text-[13px] tracking-wide flex items-center justify-center gap-2.5 overflow-hidden relative transition-all duration-200 disabled:opacity-50"
                        style={{
                            background: "linear-gradient(135deg,#ffffff 0%,#d4d4d4 100%)",
                            color: "#000",
                            boxShadow: "0 0 20px rgba(255,255,255,0.09),0 4px 24px rgba(0,0,0,0.5)"
                        }}
                    >
                        <motion.div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: "linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.28) 50%,transparent 65%)" }}
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.5 }}
                        />
                        {loading
                            ? <span className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                            : <><span className="relative z-10">Launch Into DeepHub</span><ArrowRight size={15} className="relative z-10" /></>
                        }
                    </motion.button>
                </form>
            </div>
        </div>
    );
}
