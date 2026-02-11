"use client";

import { motion } from "framer-motion";
import { Users, Flag, MessageSquare, Bell, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { useAppState } from "../context/AppContext";

export default function AdminDashboard() {
    const { checkpoints, requests, notifications } = useAppState();

    const unlockedCount = checkpoints.filter(c => !c.isLocked).length;
    const pendingRequests = requests.filter(r => r.status === "pending").length;

    const stats = [
        { label: "Total Teams", value: "24", icon: Users, color: "bg-[#5C0124]/10 text-[#5C0124]", href: "/admin/teams" },
        { label: "Active Requests", value: String(pendingRequests), icon: MessageSquare, color: "bg-orange-50 text-orange-600", href: "/admin/requests" },
        { label: "Checkpoints Released", value: `${unlockedCount} / ${checkpoints.length}`, icon: Flag, color: "bg-green-50 text-green-600", href: "/admin/checkpoints" },
        { label: "Notifications Sent", value: String(notifications.length), icon: Bell, color: "bg-[#D4AF37]/10 text-[#D4AF37]", href: "/admin/notifications" },
    ];

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#5C0124]">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Manage your MAKE-A-TON event</p>
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
                            className="block bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Recent Requests */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Recent Requests</h2>
                        <p className="text-sm text-gray-500">Latest help requests from teams</p>
                    </div>
                    <Link href="/admin/requests" className="text-sm font-semibold text-[#5C0124] hover:text-[#7A2840]">
                        View All →
                    </Link>
                </div>
                <div className="divide-y divide-gray-50">
                    {requests.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No requests yet</div>
                    ) : (
                        requests.slice(0, 5).map((req) => (
                            <div key={req.id} className="px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${req.status === "pending" ? "bg-orange-500" :
                                            req.status === "in-progress" ? "bg-blue-500" : "bg-green-500"
                                        }`} />
                                    <div>
                                        <p className="font-medium text-gray-900">{req.message}</p>
                                        <p className="text-xs text-gray-400">{req.team} · {req.timestamp}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {req.urgency === "critical" && (
                                        <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">CRITICAL</span>
                                    )}
                                    {req.status === "pending" && <AlertCircle className="h-4 w-4 text-orange-500" />}
                                    {req.status === "in-progress" && <Clock className="h-4 w-4 text-blue-500" />}
                                    {req.status === "done" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}
