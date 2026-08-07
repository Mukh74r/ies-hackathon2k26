import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    Sun,
    Award
} from 'lucide-react';
import { useLanguage, INDIAN_LANGUAGES } from '../context/LanguageContext';
import { useAuth, DeepHubUser } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user: rawUser, logout, token, updateDeepHubUser } = useAuth();
    const { currentLanguage, setLanguageByCode, t, theme, setTheme } = useLanguage();
    const navigate = useNavigate();

    // Safe fallback user object so profile never crashes
    const user: DeepHubUser = rawUser || {
        _id: 'guest',
        name: 'Faculty Educator',
        email: 'faculty@deephub.edu',
        username: 'faculty_educator',
        role: 'teacher',
        specialization: 'Physics & Curriculum Architecture',
        provider: 'local'
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: user.name || 'Faculty Educator',
        specialization: user.specialization || 'Physics & Curriculum Architecture',
        occupation: user.occupation || 'Senior Faculty'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleEditStart = () => {
        setEditForm({
            name: user.name || 'Faculty Educator',
            specialization: user.specialization || 'Physics & Curriculum Architecture',
            occupation: user.occupation || 'Senior Faculty'
        });
        setIsEditModalOpen(true);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            updateDeepHubUser({
                name: editForm.name,
                specialization: editForm.specialization,
                occupation: editForm.occupation
            });
            setIsEditModalOpen(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[#FF9900]/30 font-sans-academic transition-colors">
            <main className="pt-24 pb-20 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
                
                {/* ── Success Toast ── */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 rounded-md text-xs font-mono-stamp flex items-center justify-between shadow-lg"
                        >
                            <span>Profile details updated successfully.</span>
                            <Check size={14} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Profile Header Card ── */}
                <section className="p-6 sm:p-8 rounded-lg bg-[var(--card)] border border-[var(--border)] relative overflow-hidden shadow-xl">
                    <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF9900] to-[#00A4E4] p-0.5 shadow-lg flex-shrink-0">
                                <div className="w-full h-full rounded-full bg-[var(--card)] flex items-center justify-center font-bold text-xl text-[#FF9900]">
                                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'DH'}
                                </div>
                            </div>

                            {/* Name & Specialization */}
                            <div>
                                <h1 className="text-2xl font-bold font-display text-[var(--foreground)] tracking-tight">
                                    {user.name}
                                </h1>
                                <p className="text-xs text-[var(--muted-foreground)] mt-1 flex items-center justify-center sm:justify-start gap-2">
                                    <Shield size={13} className="text-[#FF9900]" />
                                    <span>{user.specialization || 'Curriculum Architecture'}</span>
                                    <span>·</span>
                                    <span>{user.email}</span>
                                </p>

                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                                    <span className="px-2 py-0.5 rounded bg-[#FF9900]/10 border border-[#FF9900]/30 text-[10px] uppercase font-mono-stamp text-[#FF9900]">
                                        DeepHub V4.2
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-[#00A4E4]/10 border border-[#00A4E4]/30 text-[10px] uppercase font-mono-stamp text-[#00A4E4]">
                                        {user.role === 'teacher' ? 'Educator Mode' : 'Student Mode'}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] uppercase font-mono-stamp text-emerald-400">
                                        Academic Edition
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleEditStart}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-[#FF9900] hover:bg-[#EC7211] text-[#0F1B2A] text-xs font-bold uppercase font-mono-stamp transition-colors shadow-sm"
                            >
                                <Edit2 size={13} />
                                <span>Edit Details</span>
                            </button>
                            <button
                                onClick={() => { logout(); navigate('/'); }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-xs font-semibold uppercase font-mono-stamp transition-colors"
                            >
                                <LogOut size={13} />
                                <span>Exit Session</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── Role & Workspace Mode ── */}
                <section className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)] shadow-md space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-[#FF9900]/10 text-[#FF9900]">
                            <UserIcon size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold font-display text-[var(--foreground)]">
                                Account Role & Workspace Mode
                            </h3>
                            <p className="text-xs text-[var(--muted-foreground)]">
                                Configure tools, blueprint generators, and exam presets for your functional workflow.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {[
                            {
                                id: 'teacher',
                                title: 'Educator / Teacher Suite',
                                icon: BookOpen,
                                badge: 'Teaching Studio',
                                desc: 'Question Paper Generator, 45-Min Lesson Builder, PPT Creator & Solution Key Manuals'
                            },
                            {
                                id: 'student',
                                title: 'Student / Scholar Suite',
                                icon: GraduationCap,
                                badge: 'Learning Studio',
                                desc: 'Paper Solver, Derivation Step-by-Step, Topic Explainer & Quiz Practice'
                            }
                        ].map((item) => {
                            const isCurrent = (user.role || 'teacher') === item.id;
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => updateDeepHubUser({ role: item.id })}
                                    className={`p-4 border rounded-md cursor-pointer transition-all flex flex-col justify-between ${
                                        isCurrent
                                            ? 'border-[#FF9900] border-l-4 bg-[var(--card)] shadow-md'
                                            : 'border-[var(--border)] bg-[var(--background)] opacity-75 hover:opacity-100 hover:border-[#FF9900]/40'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="p-2 rounded bg-[#FF9900]/10 text-[#FF9900]">
                                                <Icon size={16} />
                                            </div>
                                            {isCurrent && <CheckCircle size={16} className="text-[#FF9900]" />}
                                        </div>
                                        <h4 className="text-sm font-bold font-display text-[var(--foreground)]">{item.title}</h4>
                                        <p className="text-xs text-[var(--muted-foreground)] mt-1">{item.desc}</p>
                                    </div>
                                    <span className="text-[10px] font-mono-stamp text-[#00A4E4] mt-3 uppercase">{item.badge}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Regional Language Preference (Protected from Translation) ── */}
                <section className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)] shadow-md space-y-4 notranslate" translate="no">
                    <div className="flex items-center justify-between flex-wrap gap-3 notranslate" translate="no">
                        <div className="flex items-center gap-3 notranslate" translate="no">
                            <div className="p-2 rounded bg-[#FF9900]/10 text-[#FF9900]">
                                <Globe size={18} />
                            </div>
                            <div className="notranslate" translate="no">
                                <h3 className="text-base font-bold font-display text-[var(--foreground)] notranslate" translate="no">
                                    Regional & Indian Language Preference
                                </h3>
                                <p className="text-xs text-[var(--muted-foreground)] notranslate" translate="no">
                                    Select your preferred regional language for exam synthesis, lesson timelines, and student summaries.
                                </p>
                            </div>
                        </div>

                        <div className="px-3 py-1 rounded border border-[#2E3B4E] bg-[var(--background)] text-xs font-mono-stamp text-[#FF9900] notranslate" translate="no">
                            <span className="font-bold">{currentLanguage.code.toUpperCase()}</span> · <span>{currentLanguage.nativeName}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2 notranslate" translate="no">
                        {INDIAN_LANGUAGES.map((lang) => {
                            const isCurrent = currentLanguage.code === lang.code;
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => setLanguageByCode(lang.code)}
                                    className={`p-3 rounded-md border text-left transition-all notranslate ${
                                        isCurrent
                                            ? 'border-[#FF9900] border-l-4 bg-[var(--background)] shadow-sm'
                                            : 'border-[var(--border)] bg-[var(--background)] hover:border-[#FF9900]/50'
                                    }`}
                                    translate="no"
                                >
                                    <div className="flex items-center justify-between mb-1 notranslate" translate="no">
                                        <span className="text-[10px] font-mono-stamp font-bold text-[#FF9900] uppercase notranslate">{lang.code}</span>
                                        {isCurrent && <Check size={12} className="text-[#FF9900]" />}
                                    </div>
                                    <div className="text-sm font-bold text-[var(--foreground)] notranslate" translate="no">
                                        {lang.nativeName}
                                    </div>
                                    <div className="text-[10px] text-[var(--muted-foreground)] truncate notranslate" translate="no">
                                        {lang.name}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* ── Visual Theme Switcher ── */}
                <section className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)] shadow-md space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-[#FF9900]/10 text-[#FF9900]">
                            <Palette size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold font-display text-[var(--foreground)]">
                                Visual Theme Mode
                            </h3>
                            <p className="text-xs text-[var(--muted-foreground)]">
                                Both themes provide high-contrast readability and sharp typography.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {/* Dark Mode */}
                        <div
                            onClick={() => setTheme('dark')}
                            className={`p-4 border rounded-md cursor-pointer transition-all flex items-center justify-between ${
                                theme !== 'light'
                                    ? 'border-[#FF9900] border-l-4 bg-[var(--background)] shadow-sm'
                                    : 'border-[var(--border)] bg-[var(--background)] opacity-70 hover:opacity-100'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-[#FF9900]/10 text-[#FF9900]">
                                    <Moon size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold font-display text-[var(--foreground)]">Dark Mode</h4>
                                    <p className="text-xs text-[var(--muted-foreground)]">Deep navy canvas with crisp high-contrast white text.</p>
                                </div>
                            </div>
                            {theme !== 'light' && <span className="text-[10px] font-mono-stamp font-bold text-[#FF9900] uppercase">Active</span>}
                        </div>

                        {/* White Mode */}
                        <div
                            onClick={() => setTheme('light')}
                            className={`p-4 border rounded-md cursor-pointer transition-all flex items-center justify-between ${
                                theme === 'light'
                                    ? 'border-[#D97706] border-l-4 bg-[var(--background)] shadow-sm'
                                    : 'border-[var(--border)] bg-[var(--background)] opacity-70 hover:opacity-100'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-[#D97706]/10 text-[#D97706]">
                                    <Sun size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold font-display text-[var(--foreground)]">White Mode</h4>
                                    <p className="text-xs text-[var(--muted-foreground)]">Crisp clean paper slate with deep navy readable typography.</p>
                                </div>
                            </div>
                            {theme === 'light' && <span className="text-[10px] font-mono-stamp font-bold text-[#D97706] uppercase">Active</span>}
                        </div>
                    </div>
                </section>
            </main>

            {/* ── Edit Profile Modal ── */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 shadow-2xl space-y-4"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                                <h3 className="text-base font-bold font-display text-[var(--foreground)]">Edit Profile Details</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-mono-stamp text-[var(--muted-foreground)] mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 rounded bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none focus:border-[#FF9900]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono-stamp text-[var(--muted-foreground)] mb-1">Specialization / Subject</label>
                                    <input
                                        type="text"
                                        value={editForm.specialization}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, specialization: e.target.value }))}
                                        className="w-full px-3 py-2 rounded bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none focus:border-[#FF9900]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono-stamp text-[var(--muted-foreground)] mb-1">Occupation / Role</label>
                                    <input
                                        type="text"
                                        value={editForm.occupation}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, occupation: e.target.value }))}
                                        className="w-full px-3 py-2 rounded bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none focus:border-[#FF9900]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 rounded text-xs font-mono-stamp text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="px-4 py-2 rounded bg-[#FF9900] hover:bg-[#EC7211] text-[#0F1B2A] text-xs font-bold uppercase font-mono-stamp flex items-center gap-1.5 shadow-sm"
                                >
                                    {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                                    <span>Save Profile</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
