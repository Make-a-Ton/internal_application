"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, CheckCircle2, Flag, ChevronDown, ChevronUp, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppState, allTeams } from "../context/AppContext";
import Link from "next/link";

export default function JudgeHomePage() {
    const { judges, checkpoints, checkpointTasks } = useAppState();
    const [judgeId, setJudgeId] = useState("");
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

    useEffect(() => {
        setJudgeId(localStorage.getItem("makeaton_judge_id") || "");
    }, []);

    const judge = judges.find(j => j.id === judgeId);
    const assignedTeams = allTeams.filter(t => judge?.assignedTeamIds.includes(t.id));

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#5C0124]">My Teams</h1>
                <p className="text-gray-500 mt-1">
                    {judge ? `${judge.name} — ${assignedTeams.length} team(s) assigned` : "Loading..."}
                </p>
            </div>

            {assignedTeams.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <Users className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-400">No Teams Assigned Yet</h3>
                    <p className="text-sm text-gray-400 mt-1">The admin will assign teams to you before judging begins.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {assignedTeams.map((team, i) => {
                        const isExpanded = expandedTeam === team.id;

                        return (
                            <motion.div
                                key={team.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                            >
                                {/* Team Header */}
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="px-3 py-1 bg-[#5C0124] text-[#F4E4BC] text-xs font-bold rounded-full">{team.code}</span>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${team.projectStatus === "submitted" ? "bg-green-50 text-green-600" :
                                            team.projectStatus === "in-progress" ? "bg-blue-50 text-blue-600" :
                                                "bg-yellow-50 text-yellow-600"
                                            }`}>
                                            {team.projectStatus.toUpperCase()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{team.category} · {team.members.length} members</p>
                                </div>

                                {/* Members */}
                                <div className="p-4 border-b border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Team Members</p>
                                    <div className="flex flex-wrap gap-2">
                                        {team.members.map((m, j) => (
                                            <div key={j} className="flex items-center gap-2 py-1.5 px-3 bg-gray-50 rounded-lg">
                                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[9px] font-bold text-gray-500">
                                                    {m.name.split(" ").map(n => n[0]).join("")}
                                                </div>
                                                <span className="text-sm text-gray-700">{m.name}</span>
                                                <CheckCircle2 className={`h-3 w-3 ${m.isCheckedIn ? "text-green-500" : "text-gray-300"}`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Checkpoint Progress Toggle */}
                                <button
                                    onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Flag className="h-4 w-4 text-[#5C0124]" />
                                        <span className="text-sm font-bold text-gray-700">Checkpoint Progress & Tasks</span>
                                    </div>
                                    {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                </button>

                                {/* Expanded Checkpoint Details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 space-y-4">
                                                {checkpoints.map(cp => {
                                                    const tasks = checkpointTasks[`${team.id}:${cp.id}`] || [];
                                                    const completed = tasks.filter(t => t.completed).length;

                                                    return (
                                                        <div key={cp.id} className={`rounded-xl border p-4 ${cp.isLocked ? "border-gray-200 bg-gray-50" : "border-[#5C0124]/20 bg-[#5C0124]/[0.02]"}`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Flag className={`h-4 w-4 ${cp.isLocked ? "text-gray-400" : "text-[#5C0124]"}`} />
                                                                    <h4 className="font-bold text-gray-900 text-sm">
                                                                        CP {cp.number}: {cp.title}
                                                                    </h4>
                                                                </div>
                                                                {cp.isLocked ? (
                                                                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full font-bold">Locked</span>
                                                                ) : (
                                                                    <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-bold">Released</span>
                                                                )}
                                                            </div>

                                                            {cp.releasedAt && (
                                                                <p className="text-[11px] text-gray-400 mb-2">Released: {cp.releasedAt}</p>
                                                            )}

                                                            {tasks.length === 0 ? (
                                                                <p className="text-xs text-gray-400 italic">No tasks submitted yet</p>
                                                            ) : (
                                                                <>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-green-500 rounded-full transition-all"
                                                                                style={{ width: `${tasks.length > 0 ? (completed / tasks.length) * 100 : 0}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-[11px] text-gray-500 font-bold">{completed}/{tasks.length}</span>
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        {tasks.map(task => (
                                                                            <div key={task.id} className="flex items-start gap-2 text-sm">
                                                                                {task.completed ? (
                                                                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                                                ) : (
                                                                                    <Circle className="h-4 w-4 text-gray-300 mt-0.5 shrink-0" />
                                                                                )}
                                                                                <span className={task.completed ? "text-gray-700" : "text-gray-400"}>
                                                                                    {task.text}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Score Button */}
                                <div className="px-4 pb-4">
                                    <Link
                                        href={`/judge/scoring?team=${team.id}`}
                                        className="block w-full text-center bg-[#5C0124] hover:bg-[#7A2840] text-[#F4E4BC] font-bold py-3 rounded-xl transition-colors text-sm"
                                    >
                                        Score This Team
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
