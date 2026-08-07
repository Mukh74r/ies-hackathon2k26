import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiEndpoint } from '../utils/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(apiEndpoint('/api/auth/forgot-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase().trim() }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setSent(true);
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl"/>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative"
            >
                {/* Back to login */}
                <Link to="/login" className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-8 w-fit">
                    <ArrowLeft size={16}/> Back to Login
                </Link>

                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-4">
                            <Mail size={22} className="text-cyan-400"/>
                        </div>
                        <h1 className="text-2xl font-black text-white">Forgot Password?</h1>
                        <p className="text-sm text-white/40">
                            Enter your registered email and we'll send you a reset link.
                        </p>
                    </div>

                    {!sent ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-2">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="you@deephubai.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 transition-all"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !email.trim()}
                                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-40 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all"
                            >
                                {loading ? <><Loader2 size={18} className="animate-spin"/> Sending...</> : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 text-center py-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                                    <CheckCircle size={32} className="text-emerald-400"/>
                                </div>
                            </div>
                            <h2 className="text-lg font-black text-white">Check Your Inbox</h2>
                            <p className="text-sm text-white/50">
                                If <strong className="text-white/70">{email}</strong> is registered, a reset link has been sent. Check your spam folder too.
                            </p>
                            <p className="text-xs text-white/30">The link expires in 1 hour.</p>
                        </motion.div>
                    )}
                </div>

                {/* Brand */}
                <p className="text-center text-xs text-white/20 mt-6">
                    Deep<span className="text-cyan-500">Hub</span> AI · Secure Reset
                </p>
            </motion.div>
        </div>
    );
}
