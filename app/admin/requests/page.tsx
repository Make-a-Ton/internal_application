"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { useAppState, HelpRequest } from "../../context/AppContext";

const statusOptions: HelpRequest["status"][] = ["pending", "in-progress", "done"];

export default function AdminRequestsPage() {
    const { requests, updateRequestStatus, mentors } = useAppState();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterUrgency, setFilterUrgency] = useState<"all" | "critical" | "normal">("all");
    const [filterStatus, setFilterStatus] = useState<"all" | HelpRequest["status"]>("all");

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesUrgency = filterUrgency === "all" || req.urgency === filterUrgency;
        const matchesStatus = filterStatus === "all" || req.status === filterStatus;
        return matchesSearch && matchesUrgency && matchesStatus;
    });

    const getStatusIcon = (status: HelpRequest["status"]) => {
        switch (status) {
            case "pending": return <AlertCircle className="h-4 w-4 text-orange-400" />;
            case "in-progress": return <Clock className="h-4 w-4 text-blue-400" />;
            case "done": return <CheckCircle2 className="h-4 w-4 text-[#E7BB88]" />;
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#5C0124]">Requests</h1>
                    <p className="text-[#8B6F4E] mt-1">Manage help requests from teams ({requests.length} total)</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C09B6E]" />
                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#7A2840]/50 border border-[#7A2840] rounded-xl text-sm text-[#3A0015] placeholder:text-[#3A0015]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                        suppressHydrationWarning={true}
                    />
                </div>
                <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value as "all" | "critical" | "normal")}
                    className="px-4 py-2.5 bg-[#7A2840]/50 border border-[#7A2840] rounded-xl text-sm text-[#3A0015] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    suppressHydrationWarning={true}
                >
                    <option value="all">All Urgencies</option>
                    <option value="critical">Critical</option>
                    <option value="normal">Normal</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as "all" | HelpRequest["status"])}
                    className="px-4 py-2.5 bg-[#7A2840]/50 border border-[#7A2840] rounded-xl text-sm text-[#3A0015] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    suppressHydrationWarning={true}
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
            </div>

            {/* Requests Table */}
            <div className="bg-[#7A2840]/30 rounded-2xl border border-[#7A2840] overflow-hidden">
                <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-[#5C0124] border-b border-[#7A2840] text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                    <span>Status</span>
                    <span>Team</span>
                    <span className="col-span-2">Message</span>
                    <span>Urgency</span>
                    <span>Action</span>
                </div>

                {filteredRequests.length === 0 ? (
                    <div className="p-8 text-center text-[#3A0015]/50 text-sm">
                        {requests.length === 0 ? "No requests submitted yet" : "No matching requests"}
                    </div>
                ) : (
                    filteredRequests.map((req, index) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-[#7A2840]/30 items-center hover:bg-[#7A2840]/30 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                {getStatusIcon(req.status)}
                                <span className="text-xs font-semibold text-[#3A0015]/70 capitalize">
                                    {req.status.replace("-", " ")}
                                </span>
                            </span>
                            <span className="font-medium text-[#3A0015] text-sm">{req.team}</span>
                            <div className="col-span-2">
                                <p className="text-sm font-bold text-[#5C0124]">
                                    {req.category === "Mentorship" && req.mentorId
                                        ? `mentorship needed: ${mentors.find(m => m.id === req.mentorId)?.name || req.mentorId}`
                                        : req.message
                                    }
                                </p>
                                {req.category === "Mentorship" && !req.mentorId && (
                                    <p className="text-[10px] font-bold text-red-500 mt-0.5 uppercase tracking-tight">
                                        mentor: name of mentor is required
                                    </p>
                                )}
                            </div>
                            <span>
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${req.urgency === "critical"
                                    ? "bg-red-900/30 text-red-400"
                                    : "bg-[#5C0124] text-[#C09B6E]"
                                    }`}>
                                    {req.urgency?.toUpperCase() || "NORMAL"}
                                </span>
                            </span>
                            <span>
                                <select
                                    value={req.status}
                                    onChange={(e) => updateRequestStatus(req.id, e.target.value as HelpRequest["status"])}
                                    className="px-3 py-1.5 bg-[#5C0124] border border-[#7A2840] rounded-lg text-xs font-medium text-[#F4E4BC] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                                    suppressHydrationWarning={true}
                                >
                                    {statusOptions.map(s => (
                                        <option key={s} value={s}>{s.replace("-", " ").toUpperCase()}</option>
                                    ))}
                                </select>
                            </span>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
