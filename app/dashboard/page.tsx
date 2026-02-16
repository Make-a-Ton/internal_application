"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Bell, Settings, Zap, Upload,
    Clock, AlertCircle, CheckCircle2, Loader2
} from "lucide-react";
import Link from "next/link";
import DashboardHeader from "../components/DashboardHeader";
import BottomNav from "../components/BottomNav";
import GetHelpModal from "../components/GetHelpModal";
import { useAppState } from "../context/AppContext";

export default function DashboardPage() {
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const { requests } = useAppState();

    // Get the 2 most recent requests (already sorted DESC by created_at from AppContext)
    const recentRequests = requests.slice(0, 2);

    return (
        <div className="min-h-screen bg-[#5C0124] font-sans pb-24 relative overflow-hidden">
            {/* Rotating gear background decorations */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="fixed top-[-15%] right-[-10%] text-[#D4AF37]/5 pointer-events-none z-0"
            >
                <Settings size={500} />
            </motion.div>
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="fixed bottom-[-15%] left-[-10%] text-[#D4AF37]/5 pointer-events-none z-0"
            >
                <Settings size={400} />
            </motion.div>

            <div className="relative z-10">
                <DashboardHeader />
                <GetHelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />

                {/* Hero Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative bg-gradient-to-br from-[#7A2840] via-[#5C0124] to-black text-[#F4E4BC] p-6 md:p-8 mx-4 mt-4 rounded-2xl overflow-hidden shadow-xl border border-white/15"
                >
                    {/* Background Gear */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-20%] right-[-10%] text-[#D4AF37]/10 pointer-events-none"
                    >
                        <Settings size={200} />
                    </motion.div>

                    <span className="inline-block px-3 py-1 bg-[#E7BB88] text-[#5C0023] text-xs font-bold rounded-full mb-4">
                        🎯 TEAM DASHBOARD
                    </span>

                    <p className="text-[#D4AF37] text-sm font-semibold tracking-widest mb-2">HACKATHON ENDS IN</p>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Event Ended</h1>

                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-[#C09B6E] uppercase tracking-wider">Team Name</p>
                            <p className="text-xl font-bold text-[#F4E4BC]">Team Rygtus</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-[#C09B6E] uppercase tracking-wider">Current Phase</p>
                            <p className="text-xl font-bold text-[#F4E4BC]">Judgement <span className="text-[#D4AF37]">Phase</span></p>
                        </div>
                    </div>
                </motion.section>

                {/* Announcements */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mx-4 mt-6"
                >
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider">Announcements</h2>
                        <button className="text-sm text-[#D4AF37] font-semibold hover:underline">View All</button>
                    </div>
                    <div className="bg-[#7A2840]/50 rounded-xl p-6 border border-white/15 shadow-sm text-center text-[#C09B6E]">
                        <Bell className="mx-auto h-10 w-10 mb-2 opacity-30" />
                        <p className="text-sm">No new announcements</p>
                        <p className="text-xs opacity-50">Stay tuned for updates</p>
                    </div>
                </motion.section>

                {/* Selected Problem */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mx-4 mt-6"
                >
                    <div className="relative bg-gradient-to-r from-[#3A0015] to-[#2A000F] text-[#F4E4BC] p-6 rounded-2xl overflow-hidden border border-white/15">
                        <span className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#E7BB88] text-[#5C0023] text-xs font-bold rounded-full">
                            SELECTED PROBLEM
                        </span>
                        <h3 className="text-lg md:text-xl font-bold mt-6 text-center text-[#D4AF37]">CLOUD-NATIVE & DEVOPS INTELLIGENCE CHALLENGE</h3>
                        <p className="text-xs text-[#C09B6E] mt-3 text-center leading-relaxed">
                            Focus: Telemetry Intelligence, Change Impact Correlation & Proactive Reliability.
                            Audience: DevOps Engineers, Site Reliability Engineers, Platform Engineers, Cloud Architects, AI/ML Engineers...
                        </p>
                        {/* Background Text */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                            <span className="text-[6rem] md:text-[8rem] font-black tracking-tighter">INTELLIGENCE</span>
                        </div>
                    </div>
                </motion.section>

                {/* Services */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mx-4 mt-6"
                >
                    <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-3">Services</h2>
                    <button
                        onClick={() => setIsHelpModalOpen(true)}
                        className="w-full bg-[#7A2840]/50 p-5 rounded-xl border border-white/15 shadow-sm hover:bg-[#7A2840]/70 hover:shadow-md transition-all text-left cursor-pointer flex items-center gap-4"
                    >
                        <div className="bg-[#5C0124] p-3 rounded-lg">
                            <Zap className="h-6 w-6 text-[#D4AF37]" />
                        </div>
                        <div>
                            <p className="font-bold text-[#F4E4BC] text-lg">Technical Support</p>
                            <p className="text-xs text-[#C09B6E]">Get help from mentors & volunteers</p>
                        </div>
                    </button>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mx-4 mt-6"
                >
                    <Link href="/dashboard/submit">
                        <div className="bg-[#E7BB88] text-[#5C0023] p-5 rounded-2xl flex items-center justify-between shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-white/15">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                                    <span className="h-2 w-2 bg-[#5C0023] rounded-full animate-pulse"></span> Action Required
                                </p>
                                <h3 className="text-xl font-extrabold mt-1">Submit Project</h3>
                                <p className="text-xs opacity-70">Upload repo & details</p>
                            </div>
                            <Upload className="h-6 w-6" />
                        </div>
                    </Link>
                </motion.section>



                {/* Checkpoints */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mx-4 mt-6"
                >
                    <Link
                        href="/dashboard/checkpoints"
                        className="bg-[#7A2840]/50 rounded-xl p-5 border border-white/15 shadow-sm flex items-center justify-between hover:bg-[#7A2840]/70 hover:shadow-md transition-all cursor-pointer"
                    >
                        <div>
                            <h3 className="font-bold text-[#F4E4BC]">Checkpoints</h3>
                            <p className="text-xs text-[#C09B6E]">Track your progress milestones</p>
                        </div>
                        <Clock className="h-5 w-5 text-[#C09B6E]" />
                    </Link>
                </motion.section>

                {/* Recent Activity */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mx-4 mt-6 mb-10"
                >
                    <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-3">Recent Requests</h2>
                    <div className="space-y-3">
                        {recentRequests.length > 0 ? (
                            recentRequests.map((req) => (
                                <div key={req.id} className="bg-[#7A2840]/50 rounded-xl p-4 border border-white/15 shadow-sm flex items-start gap-3">
                                    {req.status === "done" ? (
                                        <CheckCircle2 className="h-5 w-5 text-[#E7BB88] mt-0.5 flex-shrink-0" />
                                    ) : req.status === "in-progress" ? (
                                        <Loader2 className="h-5 w-5 text-[#D4AF37] mt-0.5 flex-shrink-0 animate-spin" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-[#C09B6E] mt-0.5 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="font-semibold text-[#E7BB88]">{req.category}</p>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${req.status === "done"
                                                    ? "bg-[#E7BB88]/20 text-[#E7BB88]"
                                                    : req.status === "in-progress"
                                                        ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                                                        : "bg-[#C09B6E]/20 text-[#C09B6E]"
                                                }`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#F4E4BC] truncate">{req.message}</p>
                                    </div>
                                    <span className="text-xs text-[#C09B6E] whitespace-nowrap">{req.timestamp}</span>
                                </div>
                            ))
                        ) : (
                            <div className="bg-[#7A2840]/50 rounded-xl p-4 border border-white/15 text-center">
                                <p className="text-sm text-[#C09B6E]">No requests yet. Use Technical Support to get help!</p>
                            </div>
                        )}
                    </div>
                </motion.section>

                <BottomNav />
            </div>
        </div>
    );
}
