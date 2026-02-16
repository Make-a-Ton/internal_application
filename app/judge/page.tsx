"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, CheckCircle2, Flag, ChevronDown, ChevronUp, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppState } from "../context/AppContext";
import Link from "next/link";

export default function JudgeHomePage() {
    const { judges, checkpoints, checkpointTasks, teams } = useAppState();
    const [judgeId, setJudgeId] = useState("");
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

    useEffect(() => {
        setJudgeId(localStorage.getItem("makeaton_judge_id") || "");
    }, []);

    const judge = judges.find(j => j.id === judgeId);
    const assignedTeams = teams.filter(t => judge?.assignedTeamIds.includes(t.id));

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#D4AF37]">My Teams</h1>
                <p className="text-[#C09B6E] mt-1">
                    {judge ? `${judge.name} — ${assignedTeams.length} team(s) assigned` : "Loading..."}
                </p>
            </div>

            {assignedTeams.length === 0 ? (
                <div className="bg-[#7A2840]/50 rounded-2xl border border-[#7A2840] p-12 text-center">
                    <Users className="h-16 w-16 text-[#7A2840] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#C09B6E]">No Teams Assigned Yet</h3>
                    <p className="text-sm text-[#C09B6E]/60 mt-1">The admin will assign teams to you before judging begins.</p>
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
                                className="bg-[#7A2840]/50 rounded-2xl border border-[#7A2840] overflow-hidden"
                            >
                                {/* Team Header */}
                                <div className="p-6 border-b border-[#7A2840]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="px-3 py-1 bg-[#D4AF37] text-[#3A0015] text-xs font-bold rounded-full">{team.code}</span>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${team.projectStatus === "submitted" ? "bg-green-900/30 text-green-400" :
                                            team.projectStatus === "in-progress" ? "bg-blue-900/30 text-blue-400" :
                                                "bg-yellow-900/30 text-yellow-400"
                                            }`}>
                                            {team.projectStatus.toUpperCase()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#F4E4BC]">{team.name}</h3>
                                    <p className="text-sm text-[#C09B6E] mt-1">{team.college} · {team.category} · {team.members.length} members</p>
                                </div>

                                {/* Members */}
                                <div className="p-4 border-b border-[#7A2840]">
                                    <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">Team Members</p>
                                    <div className="flex flex-wrap gap-2">
                                        {team.members.map((m, j) => (
                                            <div key={j} className="flex items-center gap-2 py-1.5 px-3 bg-[#5C0124]/50 rounded-lg">
                                                <div className="w-6 h-6 bg-[#5C0124] rounded-full flex items-center justify-center text-[9px] font-bold text-[#D4AF37]">
                                                    {m.name.split(" ").map(n => n[0]).join("")}
                                                </div>
                                                <span className="text-sm text-[#F4E4BC]">{m.name}</span>
                                                <CheckCircle2 className={`h-3 w-3 ${m.isCheckedIn ? "text-green-400" : "text-[#C09B6E]/30"}`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Checkpoint Progress Toggle */}
                                <button
                                    onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#7A2840]/70 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Flag className="h-4 w-4 text-[#D4AF37]" />
                                        <span className="text-sm font-bold text-[#F4E4BC]">Checkpoint Progress & Tasks</span>
                                    </div>
                                    {isExpanded ? <ChevronUp className="h-4 w-4 text-[#C09B6E]" /> : <ChevronDown className="h-4 w-4 text-[#C09B6E]" />}
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
                                                        <div key={cp.id} className={`rounded-xl border p-4 ${cp.isLocked ? "border-[#7A2840] bg-[#5C0124]/30" : "border-[#D4AF37]/30 bg-[#D4AF37]/5"}`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Flag className={`h-4 w-4 ${cp.isLocked ? "text-[#C09B6E]" : "text-[#D4AF37]"}`} />
                                                                    <h4 className="font-bold text-[#F4E4BC] text-sm">
                                                                        CP {cp.number}: {cp.title}
                                                                    </h4>
                                                                </div>
                                                                {cp.isLocked ? (
                                                                    <span className="text-xs px-2 py-0.5 bg-[#5C0124] text-[#C09B6E] rounded-full font-bold">Locked</span>
                                                                ) : (
                                                                    <span className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded-full font-bold">Released</span>
                                                                )}
                                                            </div>

                                                            {cp.releasedAt && (
                                                                <p className="text-[11px] text-[#C09B6E] mb-2">Released: {cp.releasedAt}</p>
                                                            )}

                                                            {tasks.length === 0 ? (
                                                                <p className="text-xs text-[#C09B6E]/50 italic">No tasks submitted yet</p>
                                                            ) : (
                                                                <>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="flex-1 h-1.5 bg-[#5C0124] rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-green-400 rounded-full transition-all"
                                                                                style={{ width: `${tasks.length > 0 ? (completed / tasks.length) * 100 : 0}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-[11px] text-[#C09B6E] font-bold">{completed}/{tasks.length}</span>
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        {tasks.map(task => (
                                                                            <div key={task.id} className="flex items-start gap-2 text-sm">
                                                                                {task.completed ? (
                                                                                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                                                                                ) : (
                                                                                    <Circle className="h-4 w-4 text-[#C09B6E]/50 mt-0.5 shrink-0" />
                                                                                )}
                                                                                <span className={task.completed ? "text-[#C09B6E]" : "text-[#F4E4BC]"}>
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
                                        className="block w-full text-center bg-[#D4AF37] hover:bg-[#C09B6E] text-[#3A0015] font-bold py-3 rounded-xl transition-colors text-sm"
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
