"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppState, SCORING_CRITERIA, ScoreKey } from "../../context/AppContext";
import { CheckCircle2, ArrowRight } from "lucide-react";

function ScoringContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { judges, scores, submitScore, teams } = useAppState();
    const [judgeId, setJudgeId] = useState("");
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [currentScores, setCurrentScores] = useState<Record<ScoreKey, number>>({
        innovation: 5, technicalComplexity: 5, feasibility: 5,
        marketViability: 5, pitching: 5, completion: 5,
    });
    const [showDone, setShowDone] = useState(false);
    const [nextTeamName, setNextTeamName] = useState("");

    useEffect(() => {
        const id = localStorage.getItem("makeaton_judge_id") || "";
        setJudgeId(id);
        const teamParam = searchParams.get("team");
        if (teamParam) setSelectedTeamId(teamParam);
    }, [searchParams]);

    const judge = judges.find(j => j.id === judgeId);
    const assignedTeams = teams.filter(t => judge?.assignedTeamIds.includes(t.id));
    const selectedTeam = teams.find(t => t.id === selectedTeamId);

    // Load existing scores if any
    useEffect(() => {
        if (judgeId && selectedTeamId) {
            const existing = scores.find(s => s.judgeId === judgeId && s.teamId === selectedTeamId);
            if (existing) {
                setCurrentScores(existing.scores);
            } else {
                setCurrentScores({
                    innovation: 5, technicalComplexity: 5, feasibility: 5,
                    marketViability: 5, pitching: 5, completion: 5,
                });
            }
        }
    }, [judgeId, selectedTeamId, scores]);

    const total = Object.values(currentScores).reduce((a, b) => a + b, 0);
    const maxTotal = SCORING_CRITERIA.length * 10;

    const handleSubmit = () => {
        if (!judgeId || !selectedTeamId) return;
        submitScore({
            judgeId,
            teamId: selectedTeamId,
            scores: currentScores,
            total,
        });

        // Find next unscored team
        const currentIndex = assignedTeams.findIndex(t => t.id === selectedTeamId);
        const scoredTeamIds = scores.filter(s => s.judgeId === judgeId).map(s => s.teamId);
        scoredTeamIds.push(selectedTeamId);

        let nextTeam = null;
        for (let i = 1; i <= assignedTeams.length; i++) {
            const idx = (currentIndex + i) % assignedTeams.length;
            if (!scoredTeamIds.includes(assignedTeams[idx].id)) {
                nextTeam = assignedTeams[idx];
                break;
            }
        }

        setNextTeamName(nextTeam?.name || "");
        setShowDone(true);

        setTimeout(() => {
            setShowDone(false);
            if (nextTeam) {
                setSelectedTeamId(nextTeam.id);
                router.replace(`/judge/scoring?team=${nextTeam.id}`);
            }
        }, 2500);
    };

    return (
        <div className="min-h-screen p-8 relative">
            {/* Done Overlay */}
            <AnimatePresence>
                {showDone && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-[#5C0124] rounded-3xl p-10 text-center shadow-2xl max-w-md mx-4 border border-[#7A2840]"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                                <CheckCircle2 className="h-20 w-20 text-[#E7BB88] mx-auto mb-4" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-[#F4E4BC] mb-2">Score Submitted!</h2>
                            <p className="text-[#C09B6E] mb-1">
                                <span className="font-bold text-[#D4AF37]">{selectedTeam?.name}</span> scored {total}/{maxTotal}
                            </p>
                            {nextTeamName ? (
                                <p className="text-sm text-[#C09B6E] flex items-center justify-center gap-1 mt-3">
                                    Moving to <span className="font-bold text-[#F4E4BC]">{nextTeamName}</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </p>
                            ) : (
                                <p className="text-sm text-[#E7BB88] font-bold mt-3">🎉 All teams scored!</p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#5C0124]">Scoring</h1>
                <p className="text-[#8B6F4E] mt-1">Rate teams on each criterion using the sliders</p>
            </div>

            {/* Team Selector */}
            <div className="mb-8">
                <label className="block text-sm font-bold text-[#5C0124] mb-2">Select Team</label>
                <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full max-w-md px-4 py-3 bg-[#F8F0E3] border border-[#E8D5B8] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5C0124] text-[#3A0015]"
                >
                    <option value="">Choose a team...</option>
                    {assignedTeams.map(t => {
                        const isScored = scores.some(s => s.judgeId === judgeId && s.teamId === t.id);
                        return (
                            <option key={t.id} value={t.id}>
                                {t.name} ({t.code}) — {t.college} {isScored ? "✓" : ""}
                            </option>
                        );
                    })}
                </select>
            </div>

            {selectedTeam && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Scoring Sliders */}
                    <div className="lg:col-span-2 space-y-5">
                        {SCORING_CRITERIA.map((criteria, i) => {
                            const key = criteria.key as ScoreKey;
                            const value = currentScores[key];
                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-[#F8F0E3] rounded-2xl p-5 border border-[#E8D5B8] shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div>
                                            <h3 className="font-bold text-[#3A0015]">{criteria.label}</h3>
                                            <p className="text-xs text-[#8B6F4E]">{criteria.description}</p>
                                        </div>
                                        <span className={`text-2xl font-bold ${value >= 8 ? "text-green-600" : value >= 5 ? "text-[#5C0124]" : "text-red-500"
                                            }`}>
                                            {value}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={10}
                                        step={1}
                                        value={value}
                                        onChange={(e) => setCurrentScores(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                                        className="w-full h-2 bg-[#E8D5B8] rounded-lg appearance-none cursor-pointer accent-[#5C0124]"
                                    />
                                    <div className="flex justify-between text-[10px] text-[#8B6F4E] mt-1">
                                        <span>0</span>
                                        <span>5</span>
                                        <span>10</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Score Summary */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#F8F0E3] rounded-2xl p-6 border border-[#E8D5B8] sticky top-8 shadow-sm"
                        >
                            <h3 className="font-bold text-[#3A0015] mb-4">{selectedTeam.name}</h3>
                            <p className="text-xs text-[#8B6F4E] mb-4">{selectedTeam.code} · {selectedTeam.college} · {selectedTeam.category}</p>

                            {/* Score Breakdown */}
                            <div className="space-y-2 mb-6">
                                {SCORING_CRITERIA.map(c => (
                                    <div key={c.key} className="flex justify-between text-sm">
                                        <span className="text-[#8B6F4E]">{c.label}</span>
                                        <span className="font-bold text-[#3A0015]">{currentScores[c.key as ScoreKey]}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-[#E8D5B8] pt-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-[#3A0015]">Total</span>
                                    <span className="text-3xl font-bold text-[#5C0124]">{total}<span className="text-sm text-[#8B6F4E]">/{maxTotal}</span></span>
                                </div>
                                <div className="mt-3 h-3 bg-[#E8D5B8] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-[#5C0124] to-[#D4AF37] rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(total / maxTotal) * 100}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={showDone}
                                className="w-full font-bold py-4 rounded-xl transition-colors text-sm bg-[#5C0124] hover:bg-[#7A2840] text-[#F4E4BC] disabled:opacity-50"
                            >
                                Submit Score
                            </button>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ScoringPage() {
    return (
        <Suspense fallback={<div className="min-h-screen p-8"><p className="text-[#8B6F4E]">Loading...</p></div>}>
            <ScoringContent />
        </Suspense>
    );
}
