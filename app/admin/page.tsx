"use client";

import { motion } from "framer-motion";
import { Users, Flag, MessageSquare, Bell, AlertCircle, CheckCircle2, Clock, Settings } from "lucide-react";
import Link from "next/link";
import { useAppState } from "../context/AppContext";

export default function AdminDashboard() {
    const { checkpoints, requests, notifications, teams } = useAppState();

    const unlockedCount = checkpoints.filter(c => !c.isLocked).length;
    const pendingRequests = requests.filter(r => r.status === "pending").length;

    const stats = [
        { label: "Total Teams", value: String(teams.length), icon: Users, color: "bg-[#7A2840] text-[#D4AF37]", href: "/admin/teams" },
        { label: "Active Requests", value: String(pendingRequests), icon: MessageSquare, color: "bg-[#7A2840] text-orange-400", href: "/admin/requests" },
        { label: "Checkpoints Released", value: `${unlockedCount} / ${checkpoints.length}`, icon: Flag, color: "bg-[#7A2840] text-[#E7BB88]", href: "/admin/checkpoints" },
        { label: "Notifications Sent", value: String(notifications.length), icon: Bell, color: "bg-[#7A2840] text-[#D4AF37]", href: "/admin/notifications" },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Rotating gear */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="fixed top-[-10%] right-[-5%] text-[#D4AF37]/5 pointer-events-none z-0"
            >
                <Settings size={400} />
            </motion.div>

            <div className="relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#5C0124]">Admin Dashboard</h1>
                    <p className="text-[#8B6F4E] mt-1">Manage your MAKE-A-TON event</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link
                                href={stat.href}
                                className="block bg-[#7A2840]/50 rounded-2xl p-6 border border-[#7A2840] hover:bg-[#7A2840]/70 hover:shadow-md transition-all"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <p className="text-sm text-[#3A0015]/70 mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-[#3A0015]">{stat.value}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Requests */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#7A2840]/50 rounded-2xl border border-[#7A2840]"
                >
                    <div className="p-6 border-b border-[#7A2840] flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-[#3A0015]">Recent Requests</h2>
                            <p className="text-sm text-[#3A0015]/60">Latest help requests from teams</p>
                        </div>
                        <Link href="/admin/requests" className="text-sm font-semibold text-[#5C0124] hover:text-[#7A2840]">
                            View All →
                        </Link>
                    </div>
                    <div className="divide-y divide-[#7A2840]/50">
                        {requests.length === 0 ? (
                            <div className="p-8 text-center text-[#3A0015]/50 text-sm">No requests yet</div>
                        ) : (
                            requests.slice(0, 5).map((req) => (
                                <div key={req.id} className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${req.status === "pending" ? "bg-orange-500" :
                                            req.status === "in-progress" ? "bg-blue-500" : "bg-[#E7BB88]"
                                            }`} />
                                        <div>
                                            <p className="font-medium text-[#3A0015]">{req.message}</p>
                                            <p className="text-xs text-[#3A0015]/60">{req.team} · {req.timestamp}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {req.urgency === "critical" && (
                                            <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs font-bold rounded-full">CRITICAL</span>
                                        )}
                                        {req.status === "pending" && <AlertCircle className="h-4 w-4 text-orange-500" />}
                                        {req.status === "in-progress" && <Clock className="h-4 w-4 text-blue-500" />}
                                        {req.status === "done" && <CheckCircle2 className="h-4 w-4 text-[#E7BB88]" />}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
