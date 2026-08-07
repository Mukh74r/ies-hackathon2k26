import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    User as UserIcon,
    Shield,
    LogOut,
    Loader2,
    X,
    Check,
    Edit2,
    CheckCircle,
    Globe,
    Palette,
    Sparkles,
    GraduationCap,
    BookOpen,
    Moon,
    Compass,
    Sun,
    Award
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import Footer1 from '../components/Footer1';
import { useLanguage, INDIAN_LANGUAGES } from '../context/LanguageContext';


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

function CheckIcon({ colorClass = "text-cyan-400" }: { colorClass?: string }) {
    return (
        <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

declare global {
    interface Window {
        Razorpay: any;
    }
}
import { useAuth, DeepHubUser } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user: rawUser, logout, token, updateDeepHubUser } = useAuth();
    const { currentLanguage, setLanguageByCode, t, theme, setTheme } = useLanguage();
    const user = rawUser as DeepHubUser | null;
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        dob: '',
        occupation: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [upgradeLoading, setUpgradeLoading] = useState(false);
    const [upgradeSuccess, setUpgradeSuccess] = useState(false);
    const [proStatus, setProStatus] = useState<{ isPro: boolean; proExpiresAt: string | null } | null>(null);

    useEffect(() => {
        if (!document.getElementById("razorpay-script")) {
            const script = document.createElement("script");
            script.id = "razorpay-script";
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

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
            } catch { }
        };
        checkStatus();
    }, [token]);





    const handleUpgrade = async (planType: 'pro' | 'early_access') => {
        if (!token) return;
        setUpgradeLoading(true);
        try {
            const { apiEndpoint } = await import("../utils/api");
            const orderRes = await fetch(apiEndpoint("/api/payment/create-order"), {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            });

            if (!orderRes.ok) {
                const err = await orderRes.json().catch(() => ({}));
                alert(err.message || "Failed to create order");
                setUpgradeLoading(false);
                return;
            }

            const order = await orderRes.json();

            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: "DeepHub AI",
                description: planType === 'pro' ? "Pro Tier — 1 Month" : "Early Access — 2 Months",
                order_id: order.orderId,
                theme: { color: "#22d3ee" },
                prefill: {},
                handler: async (response: any) => {
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
                            setUpgradeSuccess(true);
                            setProStatus({ isPro: true, proExpiresAt: result.proExpiresAt });

                            const storedUser = localStorage.getItem("user");
                            if (storedUser) {
                                const storedUserObj = JSON.parse(storedUser);
                                storedUserObj.isPro = true;
                                storedUserObj.proExpiresAt = result.proExpiresAt;
                                localStorage.setItem("user", JSON.stringify(storedUserObj));
                            }
                        } else {
                            alert("Payment verification failed. Contact support.");
                        }
                    } catch {
                        alert("Verification error. Contact support.");
                    }
                    setUpgradeLoading(false);
                },
                modal: {
                    ondismiss: () => setUpgradeLoading(false),
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch {
            alert("Something went wrong. Try again.");
            setUpgradeLoading(false);
        }
    };

    const isAlreadyPro = proStatus?.isPro === true;

    const handleEditStart = () => {
        if (!user) return;
        setEditForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            dob: user.dob || '',
            occupation: user.occupation || ''
        });
        setIsEditModalOpen(true);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const { apiEndpoint } = await import("../utils/api");
            // Update the display name (legacy name field)
            const payload = {
                ...editForm,
                name: `${editForm.firstName} ${editForm.lastName}`.trim()
            };

            const res = await fetch(apiEndpoint("/api/auth/profile"), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const updatedData = await res.json();
                updateDeepHubUser(updatedData.profile);
                setIsEditModalOpen(false);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setIsSaving(false);
        }
    };



    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const { apiEndpoint } = await import("../utils/api");
                const res = await fetch(apiEndpoint("/api/auth/profile"), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    updateDeepHubUser(data);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [token, navigate]);

    if (!user && !isLoading) return null;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
            <main className="pt-32 pb-20 px-4 md:px-8">
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* Profile Header */}
                    <section className="flex flex-col sm:flex-row items-center sm:items-center gap-5 px-6 py-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden">

                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 p-[1.5px] shadow-[0_0_18px_rgba(34,211,238,0.18)]">
                                <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                                    {user?.profilePicture || user?.avatar ? (
                                        <img src={user?.profilePicture || user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={26} className="text-white/25" />
                                    )}
                                </div>
                            </div>
                            {/* Verified dot */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
                                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 8 8"><path d="M1.5 4l1.8 1.8L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                        </div>

                        {/* Name + meta */}
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                            <h1 className="text-xl font-bold font-display text-[#F8FAFC] tracking-tight leading-none truncate">
                                {user?.name || user?.username}
                            </h1>
                            <p className="mt-1 text-xs text-[#94A3B8] flex items-center justify-center sm:justify-start gap-1.5 font-sans-academic">
                                <Shield size={12} className="text-[#38BDF8] flex-shrink-0" />
                                {user?.provider === 'google' ? 'Verified via Google' : user?.specialization || 'Academic Educator'}
                                <span className="text-[#1E293B]">·</span>
                                <span>{user?.email}</span>
                            </p>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-3 items-center">
                                {[
                                    'DeepHub V4',
                                    user?.role === 'teacher' ? 'Educator' : 'Student',
                                    'Academic Edition'
                                ].map(tag => (
                                    <span key={tag} className="px-2 py-0.5 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[10px] uppercase font-mono-stamp text-[#38BDF8]">
                                        {tag}
                                    </span>
                                ))}

                                {/* Subscription status */}
                                {proStatus?.isPro ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono-stamp uppercase border border-[#34D399] bg-[#34D399]/10 text-[#34D399]">
                                        Pro Educator
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono-stamp uppercase border border-[#1E293B] bg-[#1E293B] text-[#94A3B8]">
                                        Free Edition
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                            <button
                                onClick={handleEditStart}
                                className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#38BDF8] text-[#080C14] text-xs font-bold uppercase font-sans-academic hover:bg-[#0284c7] transition-colors"
                            >
                                <Edit2 size={12} />
                                Edit Details
                            </button>
                            <button
                                onClick={() => { logout(); navigate('/aboutus'); }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] text-xs font-semibold uppercase font-sans-academic hover:bg-[#1E293B] hover:text-[#F8FAFC] transition-colors"
                            >
                                <LogOut size={12} />
                                Exit Session
                            </button>
                        </div>
                    </section>

                    {/* USER ROLE & FUNCTIONAL WORKSPACE SELECTOR CARD */}
                    <section className="bg-[#0F172A] border border-[#1E293B] p-6 rounded-lg relative shadow-md">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8]">
                                    <UserIcon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold font-display text-[#F8FAFC] tracking-wide flex items-center gap-2">
                                        Account Role & Workspace Mode
                                        <span className="text-[10px] px-2 py-0.5 rounded border border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8] font-mono-stamp uppercase">
                                            {user?.role === 'teacher' ? 'Educator Mode' : 'Student Mode'}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-[#94A3B8] mt-0.5 font-sans-academic">
                                        Select your primary role to structure tools, paper generators, and workspace presets.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ROLE SELECTION CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                            {[
                                {
                                    id: 'student',
                                    title: 'Student / Scholar',
                                    icon: GraduationCap,
                                    badge: 'Learning Suite',
                                    desc: 'Paper Solver, Concept Explainer, Quiz Practice & My Library'
                                },
                                {
                                    id: 'teacher',
                                    title: 'Educator / Teacher',
                                    icon: BookOpen,
                                    badge: 'Teaching Suite',
                                    desc: 'Lesson Builder, Question Paper Generator, PPT Creator & Homework'
                                }
                            ].map((roleOption) => {
                                const isCurrentRole = user?.role === roleOption.id || (!user?.role && roleOption.id === 'student');
                                const RoleIcon = roleOption.icon;
                                return (
                                    <button
                                        key={roleOption.id}
                                        onClick={() => updateDeepHubUser({ role: roleOption.id })}
                                        className={`
                                            relative flex flex-col items-start p-4 border text-left transition-colors group rounded-md
                                            ${isCurrentRole
                                                ? 'bg-[#080C14] border-[#38BDF8] border-l-4 text-[#F8FAFC]'
                                                : 'bg-[#080C14] border-[#1E293B] text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-between w-full mb-2">
                                            <div className={`p-2 rounded ${isCurrentRole ? 'bg-[#38BDF8]/10 text-[#38BDF8]' : 'bg-[#1E293B] text-[#94A3B8]'}`}>
                                                <RoleIcon size={18} />
                                            </div>
                                            {isCurrentRole ? (
                                                <CheckCircle size={16} className="text-[#38BDF8] flex-shrink-0" />
                                            ) : (
                                                <span className="text-[10px] font-mono-stamp px-2 py-0.5 border border-[#1E293B] text-[#94A3B8] rounded">
                                                    Select
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-sm font-bold font-display truncate w-full text-[#F8FAFC]">{roleOption.title}</h4>
                                        <span className="text-[10px] font-mono-stamp uppercase text-[#38BDF8] mt-0.5">{roleOption.badge}</span>
                                        <p className="text-xs text-[#94A3B8] leading-relaxed mt-2 font-sans-academic">{roleOption.desc}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* REGIONAL & INDIAN LANGUAGE SELECTOR CARD */}
                    <section className="bg-[#0F172A] border border-[#1E293B] p-6 rounded-lg relative shadow-md">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8]">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold font-display text-[#F8FAFC] tracking-wide flex items-center gap-2">
                                        {t('languageSettings')}
                                        <span className="text-[10px] px-2 py-0.5 rounded border border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8] font-mono-stamp uppercase">
                                            11 Languages
                                        </span>
                                    </h3>
                                    <p className="text-xs text-[#94A3B8] mt-0.5 font-sans-academic">
                                        {t('languageSubtitle')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 border border-[#1E293B] bg-[#080C14] text-xs font-mono-stamp text-[#38BDF8] rounded-md">
                                <span className="font-bold">{currentLanguage.code.toUpperCase()}</span>
                                <span className="font-sans-academic font-bold text-[#F8FAFC]">{currentLanguage.nativeName}</span>
                                <span className="text-[#94A3B8]">({currentLanguage.name})</span>
                            </div>
                        </div>

                        {/* LANGUAGE SELECTION GRID */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                            {INDIAN_LANGUAGES.map((lang) => {
                                const isSelected = currentLanguage.code === lang.code;
                                return (
                                    <button
                                        key={lang.code}
                                        onClick={() => setLanguageByCode(lang.code)}
                                        className={`
                                            relative flex flex-col items-start p-3 border text-left transition-colors group rounded-md
                                            ${isSelected 
                                                ? 'bg-[#080C14] border-[#38BDF8] border-l-4 text-[#F8FAFC]' 
                                                : 'bg-[#080C14] border-[#1E293B] text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-between w-full mb-1">
                                            <span className="text-[10px] font-mono-stamp font-bold uppercase px-1.5 py-0.5 border border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#38BDF8] rounded">{lang.code}</span>
                                            {isSelected && (
                                                <CheckCircle size={14} className="text-[#38BDF8] flex-shrink-0" />
                                            )}
                                        </div>
                                        <span className="text-sm font-bold font-sans-academic truncate w-full text-[#F8FAFC]">{lang.nativeName}</span>
                                        <span className="text-[10px] text-[#94A3B8] truncate w-full font-sans-academic">{lang.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* THEME & APPEARANCE CARD */}
                    <section className="bg-[#0F172A] border border-[#1E293B] p-6 rounded-lg relative shadow-md">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#FF9900]">
                                    <Palette size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold font-display text-[#FFFFFF] tracking-wide">
                                        Site Display Theme
                                    </h3>
                                    <p className="text-xs text-[#AAB7B8] mt-0.5 font-sans-academic">
                                        DeepHub AI is configured in Dark Mode for maximum reading comfort and clarity.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border border-[#FF9900] border-l-4 bg-[#0F1B2A] rounded-md flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-[#FF9900]/10 text-[#FF9900]">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold font-display text-[#FFFFFF]">Dark Mode</h4>
                                    <p className="text-xs text-[#AAB7B8]">High contrast, crisp typography with Plus Jakarta Sans & Inter font hierarchy.</p>
                                </div>
                            </div>
                            <span className="text-xs font-mono-stamp px-2.5 py-1 bg-[#FF9900]/20 border border-[#FF9900]/40 text-[#FF9900] rounded uppercase font-bold">Active Mode</span>
                        </div>
                    </section>


                    {/* PRICING INTEGRATION */}
                    {upgradeSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-center"
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



                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                        {/* FREE CARD */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="rounded-2xl border border-white/20 bg-gradient-to-b from-white/5 to-transparent p-8 relative overflow-hidden ring-1 ring-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] h-full flex flex-col"
                        >
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative flex flex-col h-full">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs uppercase tracking-widest font-bold text-white/50">Free Tier</p>
                                </div>
                                <div className="flex items-end gap-2 mb-1">
                                    <span className="text-5xl font-black">₹0</span>
                                    <span className="text-white/40 text-sm mb-2">forever</span>
                                </div>
                                <p className="text-white/40 text-sm mt-1 mb-8">
                                    Current Active Plan. Your basic node access.
                                </p>

                                <div className="w-full text-center py-4 rounded-xl border border-white/10 bg-white/5 text-sm font-bold opacity-60 mb-8 cursor-default uppercase tracking-wider">
                                    Active Plan
                                </div>

                                <div className="space-y-3">
                                    {FREE_FEATURES.map((f) => (
                                        <div key={f.label} className="flex items-start gap-3">
                                            {f.limit.startsWith("❌") ? <LockIcon /> : <CheckIcon colorClass="text-white/60" />}
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
                            </div>
                        </motion.div>

                        {/* PRO CARD 1 MONTH */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="rounded-2xl border border-violet-400/30 bg-gradient-to-b from-violet-400/10 to-transparent p-8 relative overflow-hidden ring-1 ring-violet-400/30 shadow-[0_0_30px_rgba(139,92,246,0.1)] h-full flex flex-col"
                        >
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative flex flex-col h-full">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs uppercase tracking-widest font-bold text-violet-400">Pro Tier</p>
                                </div>
                                <div className="flex items-end gap-2 mb-1">
                                    <span className="text-5xl font-black">₹55</span>
                                    <span className="text-white/40 text-sm mb-2">/ 1 month</span>
                                </div>
                                <p className="text-white/40 text-sm mt-1 mb-8">
                                    Standard Pro Access. Cancel anytime.
                                </p>

                                <button
                                    onClick={() => handleUpgrade('pro')}
                                    disabled={upgradeLoading || isAlreadyPro}
                                    className="w-full py-4 rounded-xl bg-violet-600 text-white font-black text-sm uppercase tracking-wider hover:bg-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-8 shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]"
                                >
                                    {isAlreadyPro
                                        ? "✓ Included"
                                        : upgradeLoading
                                            ? "Processing..."
                                            : "Get 1 Month →"}
                                </button>

                                <div className="space-y-3">
                                    {PRO_FEATURES.map((f) => (
                                        <div key={f.label} className="flex items-start gap-3">
                                            <CheckIcon colorClass="text-violet-400" />
                                            <div className="flex-1 flex justify-between items-start gap-2">
                                                <span className="text-sm text-white/80">{f.label}</span>
                                                <span className="text-xs font-mono text-violet-400 text-right flex-shrink-0">
                                                    {f.limit.replace("✦ ", "")}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* EARLY ACCESS CARD */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-cyan-400/10 to-transparent p-8 relative overflow-hidden ring-1 ring-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.1)] h-full flex flex-col"
                        >
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative flex flex-col h-full">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs uppercase tracking-widest font-bold text-cyan-400">Early Access</p>
                                    <span className="text-[10px] bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-black px-2 py-1 rounded-sm uppercase tracking-wider shadow-lg animate-pulse">
                                        Limited Offer
                                    </span>
                                </div>
                                <div className="flex items-end gap-2 mb-1">
                                    <span className="text-5xl font-black">₹66</span>
                                    <span className="text-white/40 text-sm mb-2">/ 2 months</span>
                                </div>
                                <p className="text-white/40 text-sm mt-1 mb-8">
                                    Only for early access members.
                                </p>

                                <button
                                    onClick={() => handleUpgrade('early_access')}
                                    disabled={upgradeLoading || isAlreadyPro}
                                    className="w-full py-4 rounded-xl bg-cyan-400 text-black font-black text-sm uppercase tracking-wider hover:bg-cyan-300 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed mb-8"
                                >
                                    {isAlreadyPro
                                        ? "✓ You're on Pro"
                                        : upgradeLoading
                                            ? "Processing..."
                                            : "Claim Offer →"}
                                </button>

                                <div className="space-y-3">
                                    {PRO_FEATURES.map((f) => (
                                        <div key={f.label} className="flex items-start gap-3">
                                            <CheckIcon colorClass="text-cyan-400" />
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

                </div>
            </main>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsEditModalOpen(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-lg bg-[#09090b] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-violet-600" />

                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black tracking-tighter text-white">Edit Neural Persona</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 px-1">First Name</label>
                                <input
                                    type="text"
                                    value={editForm.firstName}
                                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:outline-none transition-all text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 px-1">Last Name</label>
                                <input
                                    type="text"
                                    value={editForm.lastName}
                                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:outline-none transition-all text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 px-1">Identity Mail</label>
                                <div className="relative group/mail">
                                    <input
                                        type="text"
                                        value={user?.email}
                                        disabled
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/20 cursor-not-allowed"
                                    />
                                    {user?.provider === 'google' && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-cyan-400">Verified</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 px-1">Date of Birth</label>
                                <input
                                    type="date"
                                    value={editForm.dob}
                                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:outline-none transition-all text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 px-1">Current Occupation</label>
                                <input
                                    type="text"
                                    value={editForm.occupation}
                                    onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                                    placeholder="e.g. Educator"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:outline-none transition-all text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                            >
                                Abandon Changes
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="flex-1 py-4 rounded-2xl bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-white/90 disabled:opacity-50 transition-all shadow-xl flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                Re-sync Identity
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Success Animation Notification */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: -50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: -50 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
                    >
                        <div className="bg-[#09090b]/80 backdrop-blur-2xl border border-cyan-500/50 rounded-full px-8 py-4 flex items-center gap-4 shadow-[0_0_50px_rgba(34,211,238,0.3)]">
                            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                                <CheckCircle size={24} className="text-black" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-white leading-none mb-1">Neural Sync Complete</h4>
                                <p className="text-[10px] text-cyan-400/70 font-bold uppercase tracking-tighter">Your Identity is now live across the network</p>
                            </div>
                            {/* Particle effects can be added here with more motion divs if requested */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-full blur-xl"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer1 />
        </div>
    );
}
