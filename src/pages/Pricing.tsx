import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Footer1 from "../components/Footer1";

const FREE_FEATURES = [
    { label: "Question Paper Generator", limit: "3 / month" },
    { label: "PPT Generator", limit: "2 / month" },
    { label: "Homework Creator", limit: "5 / month" },
    { label: "Lesson Plan Builder", limit: "3 / month" },
    { label: "Paper Solver", limit: "2 / month" },
    { label: "Quiz Shuffler", limit: "1 / month" },
    { label: "My Library", limit: "10 saved items" },
    { label: "The Secretary", limit: "❌ Locked" },
    { label: "Analytics", limit: "❌ Locked" },
    { label: "AI Provider", limit: "Groq only" },
];

const PRO_FEATURES = [
    { label: "Question Paper Generator", limit: "✦ Unlimited" },
    { label: "PPT Generator", limit: "✦ Unlimited" },
    { label: "Homework Creator", limit: "✦ Unlimited" },
    { label: "Lesson Plan Builder", limit: "✦ Unlimited" },
    { label: "Paper Solver", limit: "✦ Unlimited" },
    { label: "Quiz Shuffler", limit: "✦ Unlimited" },
    { label: "My Library", limit: "✦ Unlimited" },
    { label: "The Secretary", limit: "✦ Unlocked" },
    { label: "Analytics", limit: "✦ Full Access" },
    { label: "AI Provider", limit: "Groq + Gemini 2.0" },
];

function CheckIcon() {
    return (
        <svg className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    );
}

// Declare Razorpay on window
declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function Pricing() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [proStatus, setProStatus] = useState<{ isPro: boolean; proExpiresAt: string | null } | null>(null);
    const token = localStorage.getItem("token");

    // Load Razorpay script
    useEffect(() => {
        if (!document.getElementById("razorpay-script")) {
            const script = document.createElement("script");
            script.id = "razorpay-script";
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    // Check Pro status on load
    useEffect(() => {
        if (!token) return;
        const checkStatus = async () => {
            try {
                const { apiEndpoint } = await import("../utils/api");
                const res = await fetch(apiEndpoint("/api/payment/status"), {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setProStatus(data);
                }
            } catch {}
        };
        checkStatus();
    }, [token]);

    const handleUpgrade = async () => {
        if (!token) {
            window.location.href = "/login?redirect=/pricing";
            return;
        }

        setLoading(true);
        try {
            const { apiEndpoint } = await import("../utils/api");

            // Step 1: Create order on backend
            const orderRes = await fetch(apiEndpoint("/api/payment/create-order"), {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            });

            if (!orderRes.ok) {
                const err = await orderRes.json().catch(() => ({}));
                alert(err.message || "Failed to create order");
                setLoading(false);
                return;
            }

            const order = await orderRes.json();

            // Step 2: Open Razorpay checkout
            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: "DeepHub AI",
                description: "Pro Tier — 3 Months",
                order_id: order.orderId,
                theme: { color: "#22d3ee" },
                prefill: {},
                handler: async (response: any) => {
                    // Step 3: Verify payment on backend
                    try {
                        const verifyRes = await fetch(apiEndpoint("/api/payment/verify"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        if (verifyRes.ok) {
                            const result = await verifyRes.json();
                            setSuccess(true);
                            setProStatus({ isPro: true, proExpiresAt: result.proExpiresAt });

                            // Update user in localStorage
                            const storedUser = localStorage.getItem("user");
                            if (storedUser) {
                                const user = JSON.parse(storedUser);
                                user.isPro = true;
                                user.proExpiresAt = result.proExpiresAt;
                                localStorage.setItem("user", JSON.stringify(user));
                            }
                        } else {
                            alert("Payment verification failed. Contact support.");
                        }
                    } catch {
                        alert("Verification error. Contact support.");
                    }
                    setLoading(false);
                },
                modal: {
                    ondismiss: () => setLoading(false),
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch {
            alert("Something went wrong. Try again.");
            setLoading(false);
        }
    };

    const isAlreadyPro = proStatus?.isPro === true;

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navbar strip */}
            <div className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <a href="/" className="font-black text-xl tracking-tight">
                        DEEPHUB<span className="text-cyan-400">AI</span>
                    </a>
                    <div className="flex items-center gap-4">
                        {token ? (
                            <a href="/virtualbrain" className="text-sm text-white/60 hover:text-white transition-colors">
                                ← Back to Dashboard
                            </a>
                        ) : (
                            <>
                                <a href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Log In</a>
                                <a href="/signup" className="text-sm bg-white text-black font-bold px-4 py-2 rounded-full hover:bg-cyan-400 transition-colors">
                                    Sign Up Free
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-20">
                {/* Success Banner */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10 p-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-center"
                    >
                        <div className="text-3xl mb-2">🚀</div>
                        <h3 className="text-xl font-black text-emerald-400 mb-1">Pro Activated!</h3>
                        <p className="text-white/60 text-sm">
                            Your Pro subscription is active until{" "}
                            <span className="text-white font-bold">
                                {proStatus?.proExpiresAt ? new Date(proStatus.proExpiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                            </span>
                        </p>
                    </motion.div>
                )}

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Simple Pricing
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
                        Choose Your<br />
                        <span className="text-cyan-400">Neural Tier</span>
                    </h1>
                    <p className="text-white/40 text-lg max-w-xl mx-auto">
                        Start free. Upgrade when you're ready. No auto-renewals, no hidden fees — just pure academic power.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-6 items-start">

                    {/* FREE CARD */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
                    >
                        <div className="mb-8">
                            <p className="text-xs uppercase tracking-widest font-bold text-white/40 mb-2">Free Tier</p>
                            <div className="flex items-end gap-2">
                                <span className="text-5xl font-black">₹0</span>
                                <span className="text-white/40 text-sm mb-2">forever</span>
                            </div>
                            <p className="text-white/40 text-sm mt-2">Get started instantly. No credit card required.</p>
                        </div>

                        <a
                            href="/signup"
                            className="block w-full text-center py-3 rounded-xl border border-white/20 text-sm font-bold hover:bg-white/5 transition-all mb-8"
                        >
                            Get Started Free
                        </a>

                        <div className="space-y-3">
                            {FREE_FEATURES.map((f) => (
                                <div key={f.label} className="flex items-start gap-3">
                                    {f.limit.startsWith("❌") ? <LockIcon /> : <CheckIcon />}
                                    <div className="flex-1 flex justify-between items-start gap-2">
                                        <span className={`text-sm ${f.limit.startsWith("❌") ? "text-white/25" : "text-white/70"}`}>
                                            {f.label}
                                        </span>
                                        <span className={`text-xs font-mono ${f.limit.startsWith("❌") ? "text-white/20" : "text-white/40"} text-right flex-shrink-0`}>
                                            {f.limit.replace("❌ ", "")}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* PRO CARD */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-cyan-400/10 to-transparent p-8 relative overflow-hidden"
                    >
                        {/* Glow */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs uppercase tracking-widest font-bold text-cyan-400">Pro Tier</p>
                                <span className="text-xs bg-cyan-400 text-black font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                    Best Value
                                </span>
                            </div>
                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-5xl font-black">₹66</span>
                                <span className="text-white/40 text-sm mb-2">/ 3 months</span>
                            </div>
                            <p className="text-white/40 text-sm mt-1 mb-8">
                                One-time payment. No auto-renewal. Cancel anytime.
                            </p>

                            <button
                                onClick={handleUpgrade}
                                disabled={loading || isAlreadyPro}
                                className="w-full py-4 rounded-xl bg-cyan-400 text-black font-black text-sm uppercase tracking-wider hover:bg-cyan-300 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed mb-8"
                            >
                                {isAlreadyPro
                                    ? "✓ You're on Pro"
                                    : loading
                                    ? "Processing..."
                                    : "Upgrade to Pro →"}
                            </button>

                            <div className="space-y-3">
                                {PRO_FEATURES.map((f) => (
                                    <div key={f.label} className="flex items-start gap-3">
                                        <CheckIcon />
                                        <div className="flex-1 flex justify-between items-start gap-2">
                                            <span className="text-sm text-white/80">{f.label}</span>
                                            <span className="text-xs font-mono text-cyan-400 text-right flex-shrink-0">
                                                {f.limit.replace("✦ ", "")}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* FAQ / Trust section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-20 grid md:grid-cols-3 gap-6"
                >
                    {[
                        {
                            icon: "🔒",
                            title: "Secure Payment",
                            desc: "Payments are processed via Razorpay with UPI, Debit/Credit Card, and Netbanking support.",
                        },
                        {
                            icon: "🔄",
                            title: "No Auto-Renewals",
                            desc: "We never charge you automatically. Simply pay again when your 3 months expire.",
                        },
                        {
                            icon: "💬",
                            title: "Refund Policy",
                            desc: "Full refund within 24 hours if Pro access wasn't granted. See our Refund Policy.",
                        },
                    ].map((item) => (
                        <div key={item.title} className="p-6 rounded-xl border border-white/5 bg-white/[0.02]">
                            <div className="text-2xl mb-3">{item.icon}</div>
                            <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wide">{item.title}</h3>
                            <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Compliance links */}
                <div className="text-center mt-12 text-xs text-white/20 space-x-4">
                    <a href="/terms" className="hover:text-white/50 transition-colors">Terms & Conditions</a>
                    <span>·</span>
                    <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</a>
                    <span>·</span>
                    <a href="/refund" className="hover:text-white/50 transition-colors">Refund Policy</a>
                </div>
            </main>

            <Footer1 />
        </div>
    );
}
