"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserCheck, Plus, X, Users } from "lucide-react";
import { useAppState, allTeams } from "../../context/AppContext";

export default function AdminJudgesPage() {
    const { judges, assignTeamToJudge, unassignTeamFromJudge, scores } = useAppState();
    const [selectedJudge, setSelectedJudge] = useState<string | null>(null);

    return (
        <div className="min-h-screen p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#5C0124]">Judges</h1>
                <p className="text-gray-500 mt-1">Manage judges and assign teams for judging</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {judges.map((judge, i) => {
                    const assignedTeams = allTeams.filter(t => judge.assignedTeamIds.includes(t.id));
                    const unassignedTeams = allTeams.filter(t => !judge.assignedTeamIds.includes(t.id));
                    const judgeScoreCount = scores.filter(s => s.judgeId === judge.id).length;
                    const isExpanded = selectedJudge === judge.id;

                    return (
                        <motion.div
                            key={judge.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                            {/* Judge Header */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-[#5C0124] text-[#F4E4BC] rounded-full flex items-center justify-center font-bold text-sm">
                                        {judge.name.split(" ").pop()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{judge.name}</h3>
                                        <p className="text-xs text-gray-400">PIN: {judge.pin}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-xs">
                                    <span className="px-2 py-1 bg-[#5C0124]/10 text-[#5C0124] rounded-full font-bold">
                                        {assignedTeams.length} teams
                                    </span>
                                    <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full font-bold">
                                        {judgeScoreCount} scored
                                    </span>
                                </div>
                            </div>

                            {/* Assigned Teams */}
                            <div className="p-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Assigned Teams</p>
                                {assignedTeams.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4">No teams assigned</p>
                                ) : (
                                    <div className="space-y-2">
                                        {assignedTeams.map(team => (
                                            <div key={team.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-3.5 w-3.5 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">{team.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => unassignTeamFromJudge(judge.id, team.id)}
                                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add Team */}
                            <div className="px-4 pb-4">
                                <button
                                    onClick={() => setSelectedJudge(isExpanded ? null : judge.id)}
                                    className="w-full text-sm font-bold text-[#5C0124] hover:bg-[#5C0124]/5 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                                >
                                    <Plus className="h-4 w-4" />
                                    Assign Team
                                </button>

                                {isExpanded && unassignedTeams.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="mt-3 space-y-1 border-t border-gray-100 pt-3"
                                    >
                                        {unassignedTeams.map(team => (
                                            <button
                                                key={team.id}
                                                onClick={() => {
                                                    assignTeamToJudge(judge.id, team.id);
                                                }}
                                                className="w-full flex items-center justify-between py-2 px-3 hover:bg-[#5C0124]/5 rounded-lg transition-colors text-left"
                                            >
                                                <span className="text-sm text-gray-700">{team.name}</span>
                                                <UserCheck className="h-4 w-4 text-[#5C0124]" />
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
