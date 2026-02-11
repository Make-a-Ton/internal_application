"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { useAppState, HelpRequest } from "../../context/AppContext";

const statusOptions: HelpRequest["status"][] = ["pending", "in-progress", "done"];

export default function AdminRequestsPage() {
    const { requests, updateRequestStatus } = useAppState();
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
            case "pending": return <AlertCircle className="h-4 w-4 text-orange-500" />;
            case "in-progress": return <Clock className="h-4 w-4 text-blue-500" />;
            case "done": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        }
    };

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#5C0124]">Requests</h1>
                    <p className="text-gray-500 mt-1">Manage help requests from teams ({requests.length} total)</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5C0124]"
                    />
                </div>
                <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value as "all" | "critical" | "normal")}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5C0124]"
                >
                    <option value="all">All Urgencies</option>
                    <option value="critical">Critical</option>
                    <option value="normal">Normal</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as "all" | HelpRequest["status"])}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5C0124]"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <span>Status</span>
                    <span>Team</span>
                    <span className="col-span-2">Message</span>
                    <span>Urgency</span>
                    <span>Action</span>
                </div>

                {filteredRequests.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        {requests.length === 0 ? "No requests submitted yet" : "No matching requests"}
                    </div>
                ) : (
                    filteredRequests.map((req, index) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                {getStatusIcon(req.status)}
                                <span className="text-xs font-semibold text-gray-500 capitalize">
                                    {req.status.replace("-", " ")}
                                </span>
                            </span>
                            <span className="font-medium text-gray-900 text-sm">{req.team}</span>
                            <span className="col-span-2 text-sm text-gray-700 truncate">{req.message}</span>
                            <span>
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${req.urgency === "critical"
                                        ? "bg-red-50 text-red-600"
                                        : "bg-gray-100 text-gray-500"
                                    }`}>
                                    {req.urgency.toUpperCase()}
                                </span>
                            </span>
                            <span>
                                <select
                                    value={req.status}
                                    onChange={(e) => updateRequestStatus(req.id, e.target.value as HelpRequest["status"])}
                                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5C0124]"
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
