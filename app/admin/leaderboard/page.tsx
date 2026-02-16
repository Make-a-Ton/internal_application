"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useAppState, computeLeaderboard } from "../../context/AppContext";

export default function AdminLeaderboardPage() {
    const { scores, judges, teams } = useAppState();
    const leaderboard = computeLeaderboard(scores, teams);

    return (
        <div className="min-h-screen p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#D4AF37]">Leaderboard</h1>
                <p className="text-[#C09B6E] mt-1">Overall team rankings from all judges</p>
            </div>

            {leaderboard.length === 0 ? (
                <div className="bg-[#7A2840]/50 rounded-2xl border border-[#7A2840] p-12 text-center">
                    <Trophy className="h-16 w-16 text-[#7A2840] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#C09B6E]">No Scores Yet</h3>
                    <p className="text-sm text-[#C09B6E]/60 mt-1">Scores will appear here once judges start scoring.</p>
                </div>
            ) : (
                <div className="bg-[#7A2840]/30 rounded-2xl border border-[#7A2840] overflow-hidden">
                    <div className="grid gap-4 px-6 py-3 bg-[#5C0124] border-b border-[#7A2840] text-xs font-bold text-[#D4AF37] uppercase tracking-wider"
                        style={{ gridTemplateColumns: `60px 1fr repeat(${judges.length}, 100px) 100px 80px` }}
                    >
                        <span>Rank</span>
                        <span>Team</span>
                        {judges.map(j => <span key={j.id}>{j.name}</span>)}
                        <span>Avg Score</span>
                        <span>Judges</span>
                    </div>

                    {leaderboard.map((entry, i) => {
                        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
                        return (
                            <motion.div
                                key={entry.teamId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`grid gap-4 px-6 py-4 border-b border-[#7A2840]/30 items-center hover:bg-[#7A2840]/30 transition-colors ${i < 3 ? "bg-[#D4AF37]/5" : ""}`}
                                style={{ gridTemplateColumns: `60px 1fr repeat(${judges.length}, 100px) 100px 80px` }}
                            >
                                <span className="text-2xl">{medal}</span>
                                <span className="font-bold text-[#F4E4BC]">{entry.teamName}</span>
                                {judges.map(j => (
                                    <span key={j.id} className="text-sm font-medium text-[#C09B6E]">
                                        {entry.breakdown[j.id] !== undefined ? entry.breakdown[j.id] : "—"}
                                    </span>
                                ))}
                                <span className="text-lg font-bold text-[#D4AF37]">{entry.avgScore.toFixed(1)}</span>
                                <span className="text-sm text-[#C09B6E]">{entry.judgeCount}/{judges.length}</span>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
