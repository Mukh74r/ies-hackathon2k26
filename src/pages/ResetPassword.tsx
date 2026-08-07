import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiEndpoint } from '../utils/api';

export default function ResetPassword() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
    const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
    const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-emerald-500'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) return setError('Passwords do not match.');
        if (password.length < 6) return setError('Password must be at least 6 characters.');
        if (!token) return setError('Invalid or missing reset token.');

        setLoading(true);
        setError('');
        try {
            const res = await fetch(apiEndpoint('/api/auth/reset-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setDone(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4">
                <div className="text-center space-y-4">
                    <AlertCircle size={48} className="text-red-400 mx-auto"/>
                    <h1 className="text-xl font-black text-white">Invalid Reset Link</h1>
                    <p className="text-sm text-white/50">This link is missing a token. Please request a new one.</p>
                    <Link to="/forgot-password" className="inline-block mt-4 text-cyan-400 hover:text-white text-sm transition-colors">
                        Request New Link →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl"/>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-4">
                            <Lock size={22} className="text-cyan-400"/>
                        </div>
                        <h1 className="text-2xl font-black text-white">Set New Password</h1>
                        <p className="text-sm text-white/40">Choose a strong password for your DeepHub account.</p>
                    </div>

                    {!done ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* New password */}
                            <div>
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        placeholder="At least 6 characters"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 transition-all"
                                    />
                                    <button type="button" onClick={() => setShowPw(!showPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                                        {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                                    </button>
                                </div>
                                {/* Strength bar */}
                                {password && (
                                    <div className="mt-2 space-y-1">
                                        <div className="flex gap-1">
                                            {[1,2,3].map(i => (
                                                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : 'bg-white/10'}`}/>
                                            ))}
                                        </div>
                                        <p className={`text-[10px] font-bold ${strength === 1 ? 'text-red-400' : strength === 2 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                            {strengthLabel[strength]}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-2">Confirm Password</label>
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="Re-enter your password"
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    required
                                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none transition-all ${
                                        confirm && password !== confirm ? 'border-red-500/40' : 'border-white/10 focus:border-cyan-500/50'
                                    }`}
                                />
                                {confirm && password !== confirm && (
                                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                                )}
                            </div>

                            {error && (
                                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !password || !confirm || password !== confirm}
                                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-40 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all"
                            >
                                {loading ? <><Loader2 size={18} className="animate-spin"/> Updating...</> : 'Update Password'}
                            </button>
                        </form>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                                    <CheckCircle size={32} className="text-emerald-400"/>
                                </div>
                            </div>
                            <h2 className="text-lg font-black text-white">Password Updated!</h2>
                            <p className="text-sm text-white/50">Redirecting you to login in a moment...</p>
                        </motion.div>
                    )}
                </div>

                <p className="text-center text-xs text-white/20 mt-6">
                    Deep<span className="text-cyan-500">Hub</span> AI · Secure Reset
                </p>
            </motion.div>
        </div>
    );
}
