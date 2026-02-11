"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useAppState, computeLeaderboard } from "../../context/AppContext";

export default function JudgeLeaderboardPage() {
    const { scores } = useAppState();
    const leaderboard = computeLeaderboard(scores);

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#5C0124]">Leaderboard</h1>
                <p className="text-gray-500 mt-1">Overall team rankings</p>
            </div>

            {leaderboard.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <Trophy className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-400">No Scores Yet</h3>
                    <p className="text-sm text-gray-400 mt-1">Scores will appear here once judges start scoring teams.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <span>Rank</span>
                        <span>Team</span>
                        <span>Judges Scored</span>
                        <span>Avg Score</span>
                    </div>

                    {/* Rows — only shows average, NOT per-judge breakdown */}
                    {leaderboard.map((entry, i) => {
                        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
                        return (
                            <motion.div
                                key={entry.teamId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition-colors ${i < 3 ? "bg-[#5C0124]/[0.02]" : ""}`}
                            >
                                <span className="text-2xl">{medal}</span>
                                <span className="font-bold text-gray-900">{entry.teamName}</span>
                                <span className="text-sm text-gray-500">{entry.judgeCount} judge(s)</span>
                                <span className="text-lg font-bold text-[#5C0124]">{entry.avgScore.toFixed(1)}</span>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
