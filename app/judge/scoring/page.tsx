"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

// Scoring criteria definition (self-contained, no dependency on AppContext)
const SCORING_CRITERIA = [
    { key: "innovation", dbKey: "innovation", label: "Innovation & Creativity", description: "Originality of the idea" },
    { key: "technical_complexity", dbKey: "technical_complexity", label: "Technical Complexity", description: "Depth of technical implementation" },
    { key: "feasibility", dbKey: "feasibility", label: "Feasibility & Practicality", description: "Can it be realistically built & used?" },
    { key: "market_viability", dbKey: "market_viability", label: "Market Viability", description: "Potential market demand & impact" },
    { key: "pitching", dbKey: "pitching", label: "Pitching & Presentation", description: "Quality of demo & communication" },
    { key: "completion", dbKey: "completion", label: "Project Completion", description: "How complete is the project?" },
] as const;

type ScoreKey = typeof SCORING_CRITERIA[number]["key"];

interface AssignedTeam {
    id: string;
    name: string;
    college: string;
    track: string;
    problem_stat: string | null;
}

function ScoringContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { judge } = useAuth();

    const [assignedTeams, setAssignedTeams] = useState<AssignedTeam[]>([]);
    const [scoredTeamIds, setScoredTeamIds] = useState<string[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [currentScores, setCurrentScores] = useState<Record<ScoreKey, number>>({
        innovation: 5, technical_complexity: 5, feasibility: 5,
        market_viability: 5, pitching: 5, completion: 5,
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showDone, setShowDone] = useState(false);
    const [nextTeamName, setNextTeamName] = useState("");

    // Fetch assigned teams and existing scores
    useEffect(() => {
        async function fetchData() {
            if (!judge) return;
            setLoading(true);

            // 1. Get assigned team IDs
            const { data: assignments, error: assignErr } = await supabase
                .from("judge_assignments")
                .select("team_id")
                .eq("judge_id", judge.id);

            if (assignErr) {
                console.error("Assignment fetch error:", assignErr);
                setLoading(false);
                return;
            }

            const teamIds = (assignments || []).map(a => a.team_id);

            if (teamIds.length === 0) {
                setAssignedTeams([]);
                setLoading(false);
                return;
            }

            // 2. Fetch team details
            const { data: teamsData, error: teamsErr } = await supabase
                .from("team")
                .select("id, name, college, track, problem_stat")
                .in("id", teamIds);

            if (teamsErr) {
                console.error("Teams fetch error:", teamsErr);
            } else {
                setAssignedTeams(teamsData || []);
            }

            // 3. Fetch existing scores by this judge
            const { data: scoresData, error: scoresErr } = await supabase
                .from("team_scores")
                .select("*")
                .eq("judge_id", judge.id);

            if (scoresErr) {
                console.error("Scores fetch error:", scoresErr);
            } else if (scoresData) {
                setScoredTeamIds(scoresData.map(s => s.team_id));
            }

            setLoading(false);

            // Auto-select from URL param
            const teamParam = searchParams.get("team");
            if (teamParam && teamIds.includes(teamParam)) {
                setSelectedTeamId(teamParam);
                // Load existing score for this team
                const existing = scoresData?.find(s => s.team_id === teamParam);
                if (existing) {
                    setCurrentScores({
                        innovation: existing.innovation ?? 5,
                        technical_complexity: existing.technical_complexity ?? 5,
                        feasibility: existing.feasibility ?? 5,
                        market_viability: existing.market_viability ?? 5,
                        pitching: existing.pitching ?? 5,
                        completion: existing.completion ?? 5,
                    });
                }
            }
        }

        fetchData();
    }, [judge, searchParams]);

    // Load existing scores when team selection changes
    useEffect(() => {
        async function loadExistingScore() {
            if (!judge || !selectedTeamId) return;

            const { data, error } = await supabase
                .from("team_scores")
                .select("*")
                .eq("judge_id", judge.id)
                .eq("team_id", selectedTeamId)
                .maybeSingle();

            if (error) {
                console.error("Score fetch error:", error);
                return;
            }

            if (data) {
                setCurrentScores({
                    innovation: data.innovation ?? 5,
                    technical_complexity: data.technical_complexity ?? 5,
                    feasibility: data.feasibility ?? 5,
                    market_viability: data.market_viability ?? 5,
                    pitching: data.pitching ?? 5,
                    completion: data.completion ?? 5,
                });
            } else {
                // Reset to defaults for unscored team
                setCurrentScores({
                    innovation: 5, technical_complexity: 5, feasibility: 5,
                    market_viability: 5, pitching: 5, completion: 5,
                });
            }
        }

        loadExistingScore();
    }, [judge, selectedTeamId]);

    const selectedTeam = assignedTeams.find(t => t.id === selectedTeamId);
    const total = Object.values(currentScores).reduce((a, b) => a + b, 0);
    const maxTotal = SCORING_CRITERIA.length * 10;

    const handleSubmit = async () => {
        if (!judge || !selectedTeamId || submitting) return;
        setSubmitting(true);

        const dbScore = {
            judge_id: judge.id,
            team_id: selectedTeamId,
            innovation: currentScores.innovation,
            technical_complexity: currentScores.technical_complexity,
            feasibility: currentScores.feasibility,
            market_viability: currentScores.market_viability,
            pitching: currentScores.pitching,
            completion: currentScores.completion,
            total,
        };

        const { error } = await supabase
            .from("team_scores")
            .upsert(dbScore, { onConflict: "judge_id,team_id" });

        if (error) {
            console.error("Score submit error:", error);
            setSubmitting(false);
            return;
        }

        // Update scored teams list
        setScoredTeamIds(prev => [...new Set([...prev, selectedTeamId])]);

        // Find next unscored team
        const currentIndex = assignedTeams.findIndex(t => t.id === selectedTeamId);
        const updatedScoredIds = [...new Set([...scoredTeamIds, selectedTeamId])];

        let nextTeam: AssignedTeam | null = null;
        for (let i = 1; i <= assignedTeams.length; i++) {
            const idx = (currentIndex + i) % assignedTeams.length;
            if (!updatedScoredIds.includes(assignedTeams[idx].id)) {
                nextTeam = assignedTeams[idx];
                break;
            }
        }

        setNextTeamName(nextTeam?.name || "");
        setShowDone(true);
        setSubmitting(false);

        setTimeout(() => {
            setShowDone(false);
            if (nextTeam) {
                setSelectedTeamId(nextTeam.id);
                router.replace(`/judge/scoring?team=${nextTeam.id}`);
            }
        }, 2500);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#E7BB88] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 relative">
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
                    onChange={(e) => {
                        setSelectedTeamId(e.target.value);
                        if (e.target.value) {
                            router.replace(`/judge/scoring?team=${e.target.value}`);
                        }
                    }}
                    className="w-full max-w-md px-4 py-3 bg-[#F8F0E3] border border-[#E8D5B8] rounded-xl text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#5C0124]"
                >
                    <option value="">Choose a team...</option>
                    {assignedTeams.map(t => {
                        const isScored = scoredTeamIds.includes(t.id);
                        return (
                            <option key={t.id} value={t.id}>
                                {t.name} — {t.college} {isScored ? "✓" : ""}
                            </option>
                        );
                    })}
                </select>
            </div>

            {selectedTeam && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                    {/* Scoring Sliders */}
                    <div className="lg:col-span-2 space-y-5">
                        {SCORING_CRITERIA.map((criteria, i) => {
                            const key = criteria.key;
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
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-[#5C0124]">{selectedTeam.name}</h3>
                                <Link
                                    href={`/judge/submissions?team=${selectedTeam.id}`}
                                    className="text-xs font-bold text-[#5C0124] hover:underline flex items-center gap-1"
                                >
                                    View Submission <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                            <p className="text-xs text-[#8B6F4E] mb-4">{selectedTeam.college} · {selectedTeam.track}</p>

                            {/* Score Breakdown */}
                            <div className="space-y-2 mb-6">
                                {SCORING_CRITERIA.map(c => (
                                    <div key={c.key} className="flex justify-between text-sm">
                                        <span className="text-black">{c.label}</span>
                                        <span className="font-bold text-black">{currentScores[c.key]}</span>
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
                                disabled={showDone || submitting}
                                className="w-full font-bold py-4 rounded-xl transition-colors text-sm bg-[#D4AF37] hover:bg-[#C09B6E] text-[#3A0015] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Score"
                                )}
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
        <Suspense fallback={<div className="min-h-screen p-4 md:p-8"><p className="text-[#C09B6E]">Loading...</p></div>}>
            <ScoringContent />
        </Suspense>
    );
}
