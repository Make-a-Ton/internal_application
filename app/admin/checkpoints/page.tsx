"use client";

import { motion } from "framer-motion";
import { Lock, Unlock, ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { useAppState } from "../../context/AppContext";

export default function AdminCheckpointsPage() {
    const { checkpoints, toggleCheckpointLock, checkpointTasks, teams } = useAppState();
    const [expandedCheckpoint, setExpandedCheckpoint] = useState<number | null>(null);

    return (
        <div className="min-h-screen p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#D4AF37]">Checkpoints</h1>
                <p className="text-[#C09B6E] mt-1">Manage checkpoint releases and view team submissions</p>
            </div>

            <div className="space-y-6">
                {checkpoints.map((checkpoint, index) => {
                    const teamsWithTasks = teams.map(team => ({
                        team,
                        tasks: checkpointTasks[`${team.id}:${checkpoint.id}`] || [],
                    })).filter(t => t.tasks.length > 0);

                    const totalTasks = teamsWithTasks.reduce((sum, t) => sum + t.tasks.length, 0);

                    return (
                        <motion.div
                            key={checkpoint.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-[#7A2840]/50 rounded-2xl border border-[#7A2840] overflow-hidden"
                        >
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setExpandedCheckpoint(expandedCheckpoint === checkpoint.id ? null : checkpoint.id)}
                                        className="p-1 text-[#C09B6E] hover:text-[#D4AF37]"
                                    >
                                        {expandedCheckpoint === checkpoint.id ? (
                                            <ChevronUp className="h-5 w-5" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5" />
                                        )}
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-[#D4AF37] text-[#3A0015] text-xs font-bold rounded-full">
                                                CP {checkpoint.number}
                                            </span>
                                            <h3 className="text-lg font-bold text-[#F4E4BC]">{checkpoint.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            {checkpoint.releasedAt && (
                                                <p className="text-xs text-[#C09B6E]">Released: {checkpoint.releasedAt}</p>
                                            )}
                                            <p className="text-xs text-[#C09B6E]">
                                                {teamsWithTasks.length} team(s) · {totalTasks} tasks submitted
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => toggleCheckpointLock(checkpoint.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${checkpoint.isLocked
                                        ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                                        : "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                                        }`}
                                >
                                    {checkpoint.isLocked ? (
                                        <><Lock className="h-4 w-4" /> Locked</>
                                    ) : (
                                        <><Unlock className="h-4 w-4" /> Released</>
                                    )}
                                </button>
                            </div>

                            {expandedCheckpoint === checkpoint.id && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border-t border-[#7A2840]"
                                >
                                    {teamsWithTasks.length === 0 ? (
                                        <div className="p-8 text-center text-[#C09B6E] text-sm">
                                            No tasks submitted yet for this checkpoint
                                        </div>
                                    ) : (
                                        <div className="p-6 space-y-5">
                                            {teamsWithTasks.map(({ team, tasks }) => (
                                                <div key={team.id}>
                                                    <h4 className="font-bold text-[#F4E4BC] mb-2 text-sm">{team.name} ({team.code})</h4>
                                                    <div className="space-y-1.5 ml-2">
                                                        {tasks.map((task) => (
                                                            <div key={task.id} className="flex items-center gap-2">
                                                                {task.completed ? (
                                                                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                                                                ) : (
                                                                    <Circle className="h-4 w-4 text-[#C09B6E]/50" />
                                                                )}
                                                                <span className={`text-sm ${task.completed ? "text-[#C09B6E] line-through" : "text-[#F4E4BC]"}`}>
                                                                    {task.text}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
