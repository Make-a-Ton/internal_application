"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Bell, Plus } from "lucide-react";
import Link from "next/link";

import GetHelpModal from "../../components/GetHelpModal";
import { useAppState } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";

export default function RequestsPage() {
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const { requests, addRequest, mentors } = useAppState();
    const { team } = useAuth();

    const handleNewRequest = (request: { category: string; urgency: string; description: string; mentorId?: string }) => {
        const teamId = team?.id;
        if (!teamId) return;

        const mentorName = request.mentorId ? mentors.find(m => m.id === request.mentorId)?.name : null;

        addRequest({
            teamId,
            category: request.category,
            urgency: request.urgency.toLowerCase() === "critical" ? "critical" : "normal",
            message: request.category === "Mentorship" && mentorName
                ? mentorName
                : (request.description || `[${request.urgency.toUpperCase()}] ${request.category} request`),
            description: request.description,
            mentorId: request.mentorId,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "done": return "bg-[#E7BB88]";
            case "in-progress": return "bg-yellow-500";
            case "pending": return "bg-[#D4AF37]";
            default: return "bg-[#C09B6E]";
        }
    };

    return (
        <div className="min-h-screen bg-transparent pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#7A2840]/20">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="p-2 -ml-2 hover:bg-[#7A2840]/10 rounded-full transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6 text-[#5C0124]" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-extrabold text-[#5C0124]">Requests</h1>
                            <p className="text-xs text-[#8B6F4E] uppercase tracking-widest">Track Your Help & Orders</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-[#7A2840]/10 rounded-full transition-colors">
                            <Bell className="h-5 w-5 text-[#8B6F4E]" />
                        </button>
                        <div className="w-9 h-9 bg-[#5C0124] rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-[#E7BB88]">TR</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* New Request Button */}
            <div className="px-4 pt-6">
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setIsHelpModalOpen(true)}
                    className="w-full bg-[#5C0124] hover:bg-[#7A2840] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                    <Plus className="h-5 w-5" />
                    New Request
                </motion.button>
            </div>

            {/* Requests List */}
            <div className="px-4 py-6 space-y-4">
                {requests.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[#3A0015]/60 text-sm">No requests yet</p>
                        <p className="text-[#3A0015]/40 text-xs mt-1">Tap &quot;New Request&quot; to get help</p>
                    </div>
                ) : (
                    requests.map((request, index) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}

                            className="bg-white/60 backdrop-blur-md rounded-xl p-4 border border-[#5C0124]/10 shadow-sm"
                        >
                            {/* Status Badge */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-2 h-2 rounded-full ${getStatusColor(request.status)}`} />
                                <span className="text-xs font-bold uppercase tracking-wider text-[#5C0124]">
                                    {request.status.replace("-", " ")}
                                </span>
                            </div>
                            {/* Message */}
                            <p className="font-semibold text-[#3A0015] mb-1">
                                {request.category === "Mentorship" && request.mentorId
                                    ? `mentorship needed : ${request.message}`
                                    : request.message
                                }
                            </p>
                            {/* Timestamp */}
                            <p className="text-xs text-[#3A0015]/60">{request.timestamp}</p>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Help Modal */}
            <GetHelpModal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
                onSubmit={handleNewRequest}
            />


        </div>
    );
}
