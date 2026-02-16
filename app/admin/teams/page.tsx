"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, ChevronUp, Users, CheckCircle2 } from "lucide-react";
import { useAppState } from "../../context/AppContext";

export default function AdminTeamsPage() {
    const { teams } = useAppState();
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.college.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleTeam = (teamId: string) => {
        setExpandedTeam(expandedTeam === teamId ? null : teamId);
    };

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Teams</h1>
                    <p className="text-gray-500 mt-1">{teams.length} registered teams</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search teams, colleges..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Teams List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <span>Team Name</span>
                    <span>Code</span>
                    <span>College</span>
                    <span>Category</span>
                    <span>Members</span>
                    <span>Status</span>
                </div>

                {/* Team Rows */}
                {filteredTeams.map((team, index) => (
                    <motion.div
                        key={team.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        {/* Team Row */}
                        <button
                            onClick={() => toggleTeam(team.id)}
                            className="grid grid-cols-6 gap-4 px-6 py-4 w-full text-left hover:bg-gray-50 transition-colors border-b border-gray-50"
                        >
                            <span className="font-semibold text-gray-900 flex items-center gap-2">
                                {expandedTeam === team.id ? (
                                    <ChevronUp className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                )}
                                {team.name}
                            </span>
                            <span className="text-gray-600 font-mono text-sm">{team.code}</span>
                            <span className="text-gray-600 text-sm truncate" title={team.college}>{team.college}</span>
                            <span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                    {team.category}
                                </span>
                            </span>
                            <span className="flex items-center gap-1 text-gray-600">
                                <Users className="h-4 w-4" /> {team.members.length}
                            </span>
                            <span>
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${team.projectStatus === "submitted" ? "bg-green-50 text-green-600" :
                                    team.projectStatus === "in-progress" ? "bg-blue-50 text-blue-600" :
                                        "bg-yellow-50 text-yellow-600"
                                    }`}>
                                    {team.projectStatus.toUpperCase()}
                                </span>
                            </span>
                        </button>

                        {/* Expanded Members */}
                        {expandedTeam === team.id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-gray-50 px-6 py-4 border-b border-gray-100"
                            >
                                <div className="ml-8 space-y-2">
                                    {team.members.map((member, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 px-4 bg-white rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                    {member.name.split(" ").map(n => n[0]).join("")}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                                                    <p className="text-xs text-gray-400">{member.role}{member.food_pref ? ` · ${member.food_pref}` : ""}</p>
                                                </div>
                                            </div>
                                            <span className={`flex items-center gap-1 text-xs font-semibold ${member.isCheckedIn ? "text-green-600" : "text-gray-400"
                                                }`}>
                                                <CheckCircle2 className="h-3 w-3" />
                                                {member.isCheckedIn ? "Checked In" : "Not Checked In"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
