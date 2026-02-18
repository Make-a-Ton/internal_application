"use client";

import { useState, useCallback, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, X, Users, GripVertical, Award, Hash, Shield } from "lucide-react";
import { useAppState } from "../../context/AppContext";

export default function AdminJudgesPage() {
    const { judges, assignTeamToJudge, unassignTeamFromJudge, scores, teams } = useAppState();
    const [dragOverJudgeId, setDragOverJudgeId] = useState<string | null>(null);
    const [draggingTeamId, setDraggingTeamId] = useState<string | null>(null);

    // All teams are always shown in the pool (many-to-many: a team can have multiple judges)

    // Drag handlers
    const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>, teamId: string) => {
        e.dataTransfer.setData("text/plain", teamId);
        e.dataTransfer.effectAllowed = "move";
        setDraggingTeamId(teamId);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggingTeamId(null);
        setDragOverJudgeId(null);
    }, []);

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>, judgeId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverJudgeId(judgeId);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOverJudgeId(null);
    }, []);

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>, judgeId: string) => {
        e.preventDefault();
        const teamId = e.dataTransfer.getData("text/plain");
        if (teamId) {
            // Prevent duplicate assignment
            const judge = judges.find(j => j.id === judgeId);
            if (judge && !judge.assignedTeamIds.includes(teamId)) {
                assignTeamToJudge(judgeId, teamId);
            }
        }
        setDragOverJudgeId(null);
        setDraggingTeamId(null);
    }, [assignTeamToJudge, judges]);

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* ─── SECTION 1: JUDGES OVERVIEW ─── */}
            <div className="mb-10">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-[#5C0124]">Judges</h1>
                    <p className="text-[#8B6F4E] mt-1">Real-time data from the database</p>
                </div>

                {judges.length === 0 ? (
                    <div className="text-center py-12 text-[#8B6F4E]/60">
                        <Shield className="h-12 w-12 mx-auto mb-3 opacity-40" />
                        <p className="text-lg font-medium">No judges found</p>
                        <p className="text-sm">Add judges to the database to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {judges.map((judge, i) => {
                            const assignedTeams = teams.filter(t => judge.assignedTeamIds.includes(t.id));
                            const judgeScoreCount = scores.filter(s => s.judgeId === judge.id).length;

                            return (
                                <motion.div
                                    key={judge.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className="bg-gradient-to-br from-[#7A2840]/40 to-[#5C0124]/30 rounded-2xl border border-[#7A2840]/60 p-5 hover:border-[#D4AF37]/40 transition-colors flex items-center gap-5"
                                >
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="w-11 h-11 bg-[#D4AF37] text-[#3A0015] rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                            {judge.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-[#3A0015]">{judge.name}</h3>
                                            <div className="flex items-center gap-1 text-xs text-[#3A0015]/50">
                                                <Hash className="h-3 w-3" />
                                                <span>PIN: {judge.pin}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 text-xs ml-auto">
                                        <span className="flex items-center gap-1 px-2.5 py-1 bg-[#5C0124] text-[#D4AF37] rounded-full font-semibold">
                                            <Users className="h-3 w-3" />
                                            {assignedTeams.length} teams
                                        </span>
                                        <span className="flex items-center gap-1 px-2.5 py-1 bg-[#E7BB88]/20 text-[#E7BB88] rounded-full font-semibold">
                                            <Award className="h-3 w-3" />
                                            {judgeScoreCount} scored
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ─── SECTION 2: DRAG-AND-DROP ASSIGNMENT ─── */}
            <div>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-[#5C0124]">Assign Teams to Judges</h2>
                    <p className="text-[#8B6F4E] mt-1">
                        Drag teams from the pool and drop them onto a judge to create assignments
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                    {/* LEFT: Unassigned Teams Pool */}
                    <div className="bg-[#5C0124]/10 rounded-2xl border border-[#7A2840]/40 p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-4 w-4 text-[#5C0124]" />
                            <h3 className="text-sm font-bold text-[#5C0124] uppercase tracking-wider">
                                All Teams
                            </h3>
                            <span className="ml-auto text-xs text-[#8B6F4E] bg-[#5C0124]/10 px-2 py-0.5 rounded-full font-medium">
                                {teams.length}
                            </span>
                        </div>

                        {teams.length === 0 ? (
                            <div className="text-center py-8 text-[#8B6F4E]/50">
                                <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">No teams found in database</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                                <AnimatePresence>
                                    {teams.map(team => (
                                        <motion.div
                                            key={team.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e as unknown as DragEvent<HTMLDivElement>, team.id)}
                                            onDragEnd={handleDragEnd}
                                            className={`flex items-center gap-2.5 py-2.5 px-3 bg-white/80 rounded-xl border border-[#7A2840]/20 cursor-grab active:cursor-grabbing transition-all hover:border-[#D4AF37]/50 hover:shadow-md ${draggingTeamId === team.id ? "opacity-40 scale-95" : ""
                                                }`}
                                        >
                                            <GripVertical className="h-4 w-4 text-[#8B6F4E]/40 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-[#3A0015] truncate">{team.name}</p>
                                                <p className="text-xs text-[#8B6F4E] truncate">{team.college}</p>
                                            </div>
                                            <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#5C0124]/10 text-[#5C0124] uppercase shrink-0">
                                                {team.category}
                                            </span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Judge Drop Zones */}
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                        {judges.map((judge, i) => {
                            const assignedTeams = teams.filter(t => judge.assignedTeamIds.includes(t.id));
                            const isOver = dragOverJudgeId === judge.id;

                            return (
                                <motion.div
                                    key={judge.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    onDragOver={(e) => handleDragOver(e as unknown as DragEvent<HTMLDivElement>, judge.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e as unknown as DragEvent<HTMLDivElement>, judge.id)}
                                    className={`rounded-2xl border-2 transition-all duration-200 ${isOver
                                        ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-lg shadow-[#D4AF37]/10"
                                        : "border-[#7A2840]/40 bg-[#7A2840]/20"
                                        }`}
                                >
                                    {/* Judge Header */}
                                    <div className="flex items-center gap-3 p-4 border-b border-[#7A2840]/30">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${isOver ? "bg-[#D4AF37] text-[#3A0015]" : "bg-[#5C0124] text-[#D4AF37]"
                                            }`}>
                                            {judge.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#3A0015] text-sm">{judge.name}</h4>
                                            <p className="text-xs text-[#8B6F4E]">
                                                {assignedTeams.length} team{assignedTeams.length !== 1 ? "s" : ""} assigned
                                            </p>
                                        </div>
                                        {isOver && (
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="ml-auto text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/20 px-2 py-1 rounded-full"
                                            >
                                                Drop here
                                            </motion.span>
                                        )}
                                    </div>

                                    {/* Assigned Teams */}
                                    <div className="p-4">
                                        {assignedTeams.length === 0 ? (
                                            <div className={`text-center py-6 border-2 border-dashed rounded-xl transition-colors ${isOver ? "border-[#D4AF37]/60 text-[#D4AF37]" : "border-[#7A2840]/30 text-[#8B6F4E]/40"
                                                }`}>
                                                <p className="text-sm">
                                                    {isOver ? "Release to assign" : "Drag teams here"}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                <AnimatePresence>
                                                    {assignedTeams.map(team => (
                                                        <motion.div
                                                            key={team.id}
                                                            layout
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                                                            className="flex items-center gap-2 py-1.5 px-3 bg-[#5C0124]/40 rounded-lg border border-[#7A2840]/40 group hover:border-red-400/50 transition-colors"
                                                        >
                                                            <Users className="h-3 w-3 text-[#D4AF37]/60" />
                                                            <div className="min-w-0">
                                                                <span className="text-sm font-medium text-[#3A0015]">{team.name}</span>
                                                                <span className="text-xs text-[#8B6F4E] ml-1.5">· {team.college}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => unassignTeamFromJudge(judge.id, team.id)}
                                                                className="ml-1 p-0.5 text-[#3A0015]/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                                title="Remove assignment"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>

                                                {/* Extra drop hint when teams exist */}
                                                {isOver && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="flex items-center py-1.5 px-3 border-2 border-dashed border-[#D4AF37]/50 rounded-lg text-xs text-[#D4AF37] font-medium"
                                                    >
                                                        + Drop to add
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
