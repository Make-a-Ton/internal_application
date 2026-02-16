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
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#D4AF37]">Teams</h1>
                    <p className="text-[#C09B6E] mt-1">{teams.length} registered teams</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C09B6E]" />
                        <input
                            type="text"
                            placeholder="Search teams, colleges..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-[#7A2840]/50 border border-[#7A2840] rounded-xl text-sm text-[#F4E4BC] placeholder:text-[#C09B6E]/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Teams List */}
            <div className="bg-[#7A2840]/30 rounded-2xl border border-[#7A2840] overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-[#5C0124] border-b border-[#7A2840] text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
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
                            className="grid grid-cols-6 gap-4 px-6 py-4 w-full text-left hover:bg-[#7A2840]/50 transition-colors border-b border-[#7A2840]/30"
                        >
                            <span className="font-semibold text-[#F4E4BC] flex items-center gap-2">
                                {expandedTeam === team.id ? (
                                    <ChevronUp className="h-4 w-4 text-[#C09B6E]" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-[#C09B6E]" />
                                )}
                                {team.name}
                            </span>
                            <span className="text-[#C09B6E] font-mono text-sm">{team.code}</span>
                            <span className="text-[#C09B6E] text-sm truncate" title={team.college}>{team.college}</span>
                            <span>
                                <span className="px-2 py-1 bg-[#5C0124] text-[#C09B6E] text-xs font-semibold rounded-full">
                                    {team.category}
                                </span>
                            </span>
                            <span className="flex items-center gap-1 text-[#C09B6E]">
                                <Users className="h-4 w-4" /> {team.members.length}
                            </span>
                            <span>
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${team.projectStatus === "submitted" ? "bg-[#E7BB88]/20 text-[#E7BB88]" :
                                    team.projectStatus === "in-progress" ? "bg-blue-900/30 text-blue-400" :
                                        "bg-yellow-900/30 text-yellow-400"
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
                                className="bg-[#5C0124]/50 px-6 py-4 border-b border-[#7A2840]"
                            >
                                <div className="ml-8 space-y-2">
                                    {team.members.map((member, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 px-4 bg-[#7A2840]/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-[#5C0124] rounded-full flex items-center justify-center text-xs font-bold text-[#D4AF37]">
                                                    {member.name.split(" ").map(n => n[0]).join("")}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#F4E4BC] text-sm">{member.name}</p>
                                                    <p className="text-xs text-[#C09B6E]">{member.role}{member.food_pref ? ` · ${member.food_pref}` : ""}</p>
                                                </div>
                                            </div>
                                            <span className={`flex items-center gap-1 text-xs font-semibold ${member.isCheckedIn ? "text-[#E7BB88]" : "text-[#C09B6E]"
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
