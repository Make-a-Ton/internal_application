"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useAppState, computeLeaderboard } from "../../context/AppContext";

export default function JudgeLeaderboardPage() {
    const { scores, teams } = useAppState();
    const leaderboard = computeLeaderboard(scores, teams);

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-[#D4AF37]">Leaderboard</h1>
                <p className="text-[#C09B6E] mt-1">Overall team rankings</p>
            </div>

            {leaderboard.length === 0 ? (
                <div className="bg-[#7A2840]/50 rounded-2xl border border-[#7A2840] p-8 md:p-12 text-center">
                    <Trophy className="h-16 w-16 text-[#7A2840] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#C09B6E]">No Scores Yet</h3>
                    <p className="text-sm text-[#C09B6E]/60 mt-1">Scores will appear here once judges start scoring teams.</p>
                </div>
            ) : (
                <div className="bg-[#7A2840]/30 rounded-2xl border border-[#7A2840] overflow-x-auto">
                    {/* Table Header */}
                    <div className="grid grid-cols-4 gap-4 px-4 md:px-6 py-3 bg-[#5C0124] border-b border-[#7A2840] text-xs font-bold text-[#D4AF37] uppercase tracking-wider min-w-[400px]">
                        <span>Rank</span>
                        <span>Team</span>
                        <span>Judges Scored</span>
                        <span>Avg Score</span>
                    </div>

                    {/* Rows */}
                    {leaderboard.map((entry, i) => {
                        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
                        return (
                            <motion.div
                                key={entry.teamId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`grid grid-cols-4 gap-4 px-4 md:px-6 py-4 border-b border-[#7A2840]/30 items-center hover:bg-[#7A2840]/30 transition-colors min-w-[400px] ${i < 3 ? "bg-[#D4AF37]/5" : ""}`}
                            >
                                <span className="text-2xl">{medal}</span>
                                <span className="font-bold text-[#F4E4BC] text-sm md:text-base">{entry.teamName}</span>
                                <span className="text-sm text-[#C09B6E]">{entry.judgeCount} judge(s)</span>
                                <span className="text-lg font-bold text-[#D4AF37]">{entry.avgScore.toFixed(1)}</span>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
