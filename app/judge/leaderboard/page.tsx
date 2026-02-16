"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useAppState, computeLeaderboard } from "../../context/AppContext";

export default function JudgeLeaderboardPage() {
    const { scores, teams } = useAppState();
    const leaderboard = computeLeaderboard(scores, teams);

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#5C0124]">Leaderboard</h1>
                <p className="text-[#8B6F4E] mt-1">Overall team rankings</p>
            </div>

            {leaderboard.length === 0 ? (
                <div className="bg-[#F8F0E3] rounded-2xl border border-[#E8D5B8] p-12 text-center">
                    <Trophy className="h-16 w-16 text-[#C09B6E] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#5C0124]">No Scores Yet</h3>
                    <p className="text-sm text-[#8B6F4E] mt-1">Scores will appear here once judges start scoring teams.</p>
                </div>
            ) : (
                <div className="bg-[#F8F0E3] rounded-2xl border border-[#E8D5B8] overflow-hidden shadow-sm">
                    {/* Table Header */}
                    <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-[#5C0124] border-b border-[#E8D5B8] text-xs font-bold text-[#F4E4BC] uppercase tracking-wider">
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
                                className={`grid grid-cols-4 gap-4 px-6 py-4 border-b border-[#E8D5B8]/50 items-center hover:bg-[#F0E4D0] transition-colors ${i < 3 ? "bg-[#FDF8F0]" : ""}`}
                            >
                                <span className="text-2xl">{medal}</span>
                                <span className="font-bold text-[#3A0015]">{entry.teamName}</span>
                                <span className="text-sm text-[#8B6F4E]">{entry.judgeCount} judge(s)</span>
                                <span className="text-lg font-bold text-[#5C0124]">{entry.avgScore.toFixed(1)}</span>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
