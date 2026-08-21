"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Building2, 
  Sparkles,
  ArrowRight,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password) {
      return;
    }
    setLoading(true);
    await login(username, password);
    setLoading(false);
  };

  const handleQuickDemoLogin = async () => {
    setUsername('admin');
    setPassword('1234');
    setLoading(true);
    await login('admin', '1234');
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden relative z-10 p-8 sm:p-10"
      >
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
              <Image 
                src="/logo.png" 
                alt="Bhumika ERP" 
                width={48} 
                height={48} 
                className="object-contain invert brightness-200"
                unoptimized
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
            <Sparkles size={12} className="text-emerald-400" />
            Enterprise ERP v2.0
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            BHUMIKA TILES
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Building Material & Hardware Management System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Username / ID
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                <User size={16} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username (e.g. admin)"
                required
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Manager PIN / Password
              </label>
              <span className="text-[10px] text-emerald-400/80 font-medium">Default: 1234</span>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter 4-digit PIN or password"
                required
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-slate-900"
              />
              <span>Remember session</span>
            </label>
            <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-500/70" /> Protected
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-950/50 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In to ERP</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Option */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all group"
          >
            <KeyRound size={14} className="text-emerald-400 group-hover:rotate-45 transition-transform" />
            <span>1-Click Manager Login (Rohit Chavan)</span>
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium text-center">
            <Building2 size={12} />
            <span>Parola, Dist. Jalgaon • Bhumika Tiles</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
