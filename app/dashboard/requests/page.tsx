"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Bell, Plus } from "lucide-react";
import Link from "next/link";
import BottomNav from "../../components/BottomNav";
import GetHelpModal from "../../components/GetHelpModal";
import { useAppState } from "../../context/AppContext";

export default function RequestsPage() {
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const { requests, addRequest, teams } = useAppState();
    const [teamId, setTeamId] = useState("");

    useEffect(() => {
        const storedTeamId = localStorage.getItem("makeaton_team_id") || "";
        // Fallback: use first team from DB for demo if no team ID stored
        setTeamId(storedTeamId || (teams.length > 0 ? teams[0].id : ""));
    }, [teams]);

    const handleNewRequest = (request: { category: string; urgency: string; description: string }) => {
        addRequest({
            teamId,
            category: request.category,
            urgency: request.urgency === "critical" ? "critical" : "normal",
            message: request.description || `[${request.urgency.toUpperCase()}] ${request.category} request`,
            description: request.description,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "done": return "bg-green-500";
            case "in-progress": return "bg-yellow-500";
            case "pending": return "bg-[#D4AF37]";
            default: return "bg-[#C09B6E]";
        }
    };

    return (
        <div className="min-h-screen bg-[#5C0124] pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#5C0124] border-b border-[#7A2840]">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="p-2 -ml-2 hover:bg-[#7A2840] rounded-full transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6 text-[#D4AF37]" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-extrabold text-[#F4E4BC]">Requests</h1>
                            <p className="text-xs text-[#C09B6E] uppercase tracking-widest">Track Your Help & Orders</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-[#7A2840] rounded-full transition-colors">
                            <Bell className="h-5 w-5 text-[#C09B6E]" />
                        </button>
                        <div className="w-9 h-9 bg-[#7A2840] rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-[#D4AF37]">TR</span>
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
                    className="w-full bg-[#D4AF37] hover:bg-[#C09B6E] text-[#3A0015] font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                    <Plus className="h-5 w-5" />
                    New Request
                </motion.button>
            </div>

            {/* Requests List */}
            <div className="px-4 py-6 space-y-4">
                {requests.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[#C09B6E] text-sm">No requests yet</p>
                        <p className="text-[#C09B6E]/50 text-xs mt-1">Tap &quot;New Request&quot; to get help</p>
                    </div>
                ) : (
                    requests.map((request, index) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-[#7A2840]/50 rounded-xl p-4 border border-[#7A2840]"
                        >
                            {/* Status Badge */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-2 h-2 rounded-full ${getStatusColor(request.status)}`} />
                                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                                    {request.status.replace("-", " ")}
                                </span>
                            </div>
                            {/* Message */}
                            <p className="font-semibold text-[#F4E4BC] mb-1">{request.message}</p>
                            {/* Timestamp */}
                            <p className="text-xs text-[#C09B6E]">{request.timestamp}</p>
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

            <BottomNav />
        </div>
    );
}
