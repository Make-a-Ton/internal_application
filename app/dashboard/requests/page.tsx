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
            case "pending": return "bg-blue-500";
            default: return "bg-gray-500";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6 text-gray-700" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-extrabold text-gray-900">Requests</h1>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Track Your Help & Orders</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Bell className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600">TR</span>
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
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                    <Plus className="h-5 w-5" />
                    New Request
                </motion.button>
            </div>

            {/* Requests List */}
            <div className="px-4 py-6 space-y-4">
                {requests.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-sm">No requests yet</p>
                        <p className="text-gray-300 text-xs mt-1">Tap &quot;New Request&quot; to get help</p>
                    </div>
                ) : (
                    requests.map((request, index) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                        >
                            {/* Status Badge */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-2 h-2 rounded-full ${getStatusColor(request.status)}`} />
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    {request.status.replace("-", " ")}
                                </span>
                            </div>
                            {/* Message */}
                            <p className="font-semibold text-gray-900 mb-1">{request.message}</p>
                            {/* Timestamp */}
                            <p className="text-xs text-gray-400">{request.timestamp}</p>
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
