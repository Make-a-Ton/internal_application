"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, User, ArrowRight, AlertCircle, Settings } from "lucide-react";

interface AdminLoginProps {
    onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const correctUser = process.env.NEXT_PUBLIC_ADMIN_USER;
        const correctPass = process.env.NEXT_PUBLIC_ADMIN_PASS;

        if (username === correctUser && password === correctPass) {
            // Store simple auth flag in sessionStorage
            sessionStorage.setItem("admin_auth", "true");
            setTimeout(() => {
                onLogin();
            }, 500);
        } else {
            setError("Invalid administrator credentials");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#5C0124] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Gear Decor */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] right-[-5%] text-[#D4AF37]/5 pointer-events-none"
            >
                <Settings size={600} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#7A2840]/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-[#D4AF37] rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12 shadow-inner">
                        <Lock className="h-10 w-10 text-[#5C0124]" />
                    </div>
                    <h1 className="text-3xl font-black text-[#F4E4BC] tracking-tight uppercase">
                        Admin <span className="text-[#D4AF37]">Access</span>
                    </h1>
                    <p className="text-[#C09B6E] text-xs font-bold tracking-[0.2em] mt-2 uppercase">
                        Make-A-Ton 8.0 Internal
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest ml-4">
                            Administrator Username
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
                                <User className="h-5 w-5 text-[#C09B6E] group-focus-within:text-[#D4AF37]" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/20 border border-white/5 text-[#F4E4BC] rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#D4AF37]/30 transition-all font-medium"
                                placeholder="Enter username"
                                required
                                suppressHydrationWarning={true}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest ml-4">
                            Security Password
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
                                <Lock className="h-5 w-5 text-[#C09B6E] group-focus-within:text-[#D4AF37]" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/5 text-[#F4E4BC] rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#D4AF37]/30 transition-all font-medium"
                                placeholder="Enter password"
                                required
                                suppressHydrationWarning={true}
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3"
                        >
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-400 text-xs font-bold tracking-tight">
                                {error}
                            </p>
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        className="w-full bg-[#D4AF37] hover:bg-[#E7BB88] text-[#5C0124] font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg disabled:opacity-50"
                    >
                        <span>{isLoading ? "AUTHENTICATING..." : "VERIFY IDENTITY"}</span>
                        {!isLoading && <ArrowRight className="h-5 w-5" />}
                    </motion.button>
                </form>

                <p className="text-center text-[#C09B6E]/30 text-[10px] mt-10 font-bold uppercase tracking-widest">
                    Authorized Personnel Only
                </p>
            </motion.div>
        </div>
    );
}
