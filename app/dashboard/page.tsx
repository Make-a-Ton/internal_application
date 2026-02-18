"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Bell, Settings, Zap, Upload,
    Clock, AlertCircle, CheckCircle2, Loader2
} from "lucide-react";
import Link from "next/link";
import DashboardHeader from "../components/DashboardHeader";
import GetHelpModal from "../components/GetHelpModal";
import ProblemStatementSelection from "./components/ProblemStatementSelection";
import CountdownTimer from "./components/CountdownTimer";
import { useAppState } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface TeamDbData {
    id: string;
    name: string;
    track: string;
    college: string;
    problem_stat: string | null;
    prob_desc: string | null;
}

interface MemberDbData {
    id: string;
    team_id: string;
    name: string;
    food: string;
    checkin: boolean;
}

export default function DashboardPage() {
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const { requests, addRequest, notifications } = useAppState();
    const { team: authTeam } = useAuth();
    const [teamData, setTeamData] = useState<TeamDbData | null>(null);
    const [members, setMembers] = useState<MemberDbData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTeamData = async () => {
        if (!authTeam) return;
        setLoading(true);

        const { data: td, error: tErr } = await supabase
            .from("team")
            .select("*")
            .eq("id", authTeam.id)
            .single();

        if (!tErr && td) setTeamData(td);

        const { data: md, error: mErr } = await supabase
            .from("member")
            .select("*")
            .eq("team_id", authTeam.id);

        if (!mErr && md) setMembers(md);
        setLoading(false);
    };

    useEffect(() => {
        if (!authTeam) return;

        fetchTeamData();

        // Realtime subscription for team and member changes
        const channel = supabase
            .channel(`dashboard-team-${authTeam.id}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "team", filter: `id=eq.${authTeam.id}` },
                () => fetchTeamData()
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "member", filter: `team_id=eq.${authTeam.id}` },
                () => fetchTeamData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [authTeam]);

    // Get the 2 most recent requests (already sorted DESC by created_at from AppContext)
    const recentRequests = requests.slice(0, 2);

    // Derive project status from problem_stat
    const projectStatus: "submitted" | "pending" = teamData?.problem_stat ? "submitted" : "pending";
    const projectDesc = teamData?.problem_stat || "No problem statement submitted yet.";

    // Count checked-in members
    const checkedInCount = members.filter(m => m.checkin).length;

    // Get the 3 most recent notifications (already sorted DESC from AppContext)
    const recentNotifications = notifications.slice(0, 3);
    const latestNotification = notifications[0] || null;

    return (
        <div className="min-h-screen bg-transparent font-sans pb-24 relative overflow-hidden">

            <div className="relative z-10">
                <DashboardHeader />
                <GetHelpModal
                    isOpen={isHelpModalOpen}
                    onClose={() => setIsHelpModalOpen(false)}
                    onSubmit={async (data) => {
                        if (authTeam?.id) {
                            await addRequest({
                                teamId: authTeam.id,
                                category: data.category,
                                urgency: data.urgency.toLowerCase() as any,
                                message: data.description,
                                description: data.description
                            });
                        }
                    }}
                />

                {/* Hero Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative bg-gradient-to-br from-[#7A2840] via-[#5C0124] to-black text-[#F4E4BC] p-6 md:p-8 mx-4 mt-4 rounded-2xl overflow-hidden shadow-xl border border-white/15"
                >
                    {/* Background Gear */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-20%] right-[-10%] text-[#D4AF37]/10 pointer-events-none"
                    >
                        <Settings size={200} />
                    </motion.div>

                    <CountdownTimer teamName={teamData?.name ?? "..."} />

                    <div className="flex justify-between items-end mt-4 border-t border-white/10 pt-4">
                        <div>
                            <p className="text-[25px] text-[#C09B6E] uppercase tracking-wider">Track</p>
                            <p className="text-[30px] font-bold text-[#F4E4BC]">{teamData?.track || "General"}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[20px] text-[#C09B6E] uppercase tracking-wider">Members</p>
                            <p className="text-[30px] font-bold text-[#F4E4BC]">{checkedInCount}/{members.length} <span className="text-[#D4AF37]">Checked In</span></p>
                        </div>
                    </div>
                </motion.section>

                {/* Announcements */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mx-4 mt-6"
                >
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-sm font-bold text-[#5C0124] uppercase tracking-wider flex items-center gap-2">
                            Announcements
                            {latestNotification && (
                                <span className="h-2 w-2 bg-[#D4AF37] rounded-full animate-pulse" />
                            )}
                        </h2>
                        <span className="text-xs text-[#5C0124]/60">{notifications.length} total</span>
                    </div>

                    {recentNotifications.length > 0 ? (
                        <div className="space-y-3">
                            {recentNotifications.map((notif, index) => (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * index }}
                                    className="bg-[#7A2840]/50 rounded-xl p-4 border border-[#7A2840] shadow-sm"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 flex-shrink-0 p-1.5 rounded-lg ${notif.priority === "high"
                                            ? "bg-[#D4AF37]/20"
                                            : "bg-[#C09B6E]/20"
                                            }`}>
                                            <Bell className={`h-4 w-4 ${notif.priority === "high"
                                                ? "text-[#D4AF37]"
                                                : "text-[#C09B6E]"
                                                }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="font-semibold text-[#3A0015] text-sm truncate">{notif.title}</p>
                                                {notif.priority === "high" && (
                                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex-shrink-0">
                                                        Important
                                                    </span>
                                                )}
                                            </div>
                                            {notif.description && (
                                                <p className="text-xs text-[#3A0015]/70 line-clamp-2">{notif.description}</p>
                                            )}
                                            {notif.url && (
                                                <a
                                                    href={notif.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-[#D4AF37] hover:underline mt-1 inline-block"
                                                >
                                                    View details →
                                                </a>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-[#3A0015]/40 whitespace-nowrap flex-shrink-0">{notif.timestamp}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[#7A2840]/50 rounded-xl p-6 border border-[#7A2840] shadow-sm text-center text-[#3A0015]/60">
                            <Bell className="mx-auto h-10 w-10 mb-2 opacity-30" />
                            <p className="text-sm">No new announcements</p>
                            <p className="text-xs opacity-50">Stay tuned for updates</p>
                        </div>
                    )}
                </motion.section>

                {/* Selected Problem / Project Status */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mx-4 mt-6"
                >
                    <div className="relative bg-gradient-to-r from-[#3A0015] to-[#2A000F] text-[#F4E4BC] p-6 rounded-2xl overflow-hidden border border-white/15">
                        <span className={`absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold rounded-full ${projectStatus === "submitted"
                            ? "bg-[#E7BB88] text-[#5C0023]"
                            : "bg-[#C09B6E]/30 text-[#C09B6E]"
                            }`}>
                            {projectStatus === "submitted" ? "PROBLEM STATEMENT" : "NO PROBLEM SELECTED"}
                        </span>
                        {teamData?.problem_stat ? (
                            <>
                                <h2 className="text-lg md:text-xl font-bold mt-6 text-center text-[#D4AF37]">
                                    {teamData.problem_stat}
                                </h2>
                                <h3 className="text-sm text-[#C09B6E] mt-3 text-center leading-relaxed">
                                    {teamData.prob_desc}
                                </h3>
                                <p className="text-sm text-[#C09B6E] mt-3 text-center leading-relaxed">
                                    College: {teamData.college || "N/A"}
                                </p>
                            </>
                        ) : (
                            authTeam && (
                                <ProblemStatementSelection
                                    teamId={authTeam.id}
                                    onSuccess={() => {
                                        fetchTeamData();
                                        // Optional: Show a success toast or notification
                                    }}
                                />
                            )
                        )}
                        {/* Background Text */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                            <span className="text-[6rem] md:text-[8rem] font-black tracking-tighter">
                                {teamData?.track?.split(" ")[0]?.toUpperCase() || "HACK"}
                            </span>
                        </div>
                    </div>
                </motion.section>

                {/* Services */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mx-4 mt-6"
                >
                    <h2 className="text-sm font-bold text-[#5C0124] uppercase tracking-wider mb-3">Services</h2>
                    <button
                        onClick={() => setIsHelpModalOpen(true)}
                        className="w-full bg-[#7A2840]/50 p-5 rounded-xl border border-[#7A2840] shadow-sm hover:bg-[#7A2840]/70 hover:shadow-md transition-all text-left cursor-pointer flex items-center gap-4"
                    >
                        <div className="bg-[#5C0124] p-3 rounded-lg">
                            <Zap className="h-6 w-6 text-[#D4AF37]" />
                        </div>
                        <div>
                            <p className="font-bold text-[#3A0015] text-lg">Technical Support</p>
                            <p className="text-xs text-[#3A0015]/60">Get help from mentors & volunteers</p>
                        </div>
                    </button>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mx-4 mt-6"
                >
                    <Link href="/dashboard/submit">
                        <div className="bg-[#E7BB88] text-[#5C0023] p-5 rounded-2xl flex items-center justify-between shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-[#D4AF37]">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                                    <span className="h-2 w-2 bg-[#5C0023] rounded-full animate-pulse"></span> Action Required
                                </p>
                                <h3 className="text-xl font-extrabold mt-1">Submit Project</h3>
                                <p className="text-xs opacity-70">Upload repo & details</p>
                            </div>
                            <Upload className="h-6 w-6" />
                        </div>
                    </Link>
                </motion.section>



                {/* Checkpoints */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mx-4 mt-6"
                >
                    <Link
                        href="/dashboard/checkpoints"
                        className="bg-[#7A2840]/50 rounded-xl p-5 border border-[#7A2840] shadow-sm flex items-center justify-between hover:bg-[#7A2840]/70 hover:shadow-md transition-all cursor-pointer"
                    >
                        <div>
                            <h3 className="font-bold text-[#3A0015]">Checkpoints</h3>
                            <p className="text-xs text-[#3A0015]/60">Track your progress milestones</p>
                        </div>
                        <Clock className="h-5 w-5 text-[#3A0015]/50" />
                    </Link>
                </motion.section>

                {/* Recent Activity */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mx-4 mt-6 mb-10"
                >
                    <h2 className="text-sm font-bold text-[#5C0124] uppercase tracking-wider mb-3">Recent Requests</h2>
                    <div className="space-y-3">
                        {recentRequests.length > 0 ? (
                            recentRequests.map((req) => (
                                <div key={req.id} className="bg-[#7A2840]/50 rounded-xl p-4 border border-[#7A2840] shadow-sm flex items-start gap-3">
                                    {req.status === "done" ? (
                                        <CheckCircle2 className="h-5 w-5 text-[#E7BB88] mt-0.5 flex-shrink-0" />
                                    ) : req.status === "in-progress" ? (
                                        <Loader2 className="h-5 w-5 text-[#D4AF37] mt-0.5 flex-shrink-0 animate-spin" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-[#C09B6E] mt-0.5 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="font-semibold text-[#3A0015]">{req.category}</p>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${req.status === "done"
                                                ? "bg-[#E7BB88]/20 text-[#E7BB88]"
                                                : req.status === "in-progress"
                                                    ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                                                    : "bg-[#C09B6E]/20 text-[#C09B6E]"
                                                }`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#3A0015]/80 truncate">{req.message}</p>
                                    </div>
                                    <span className="text-xs text-[#3A0015]/50 whitespace-nowrap">{req.timestamp}</span>
                                </div>
                            ))
                        ) : (
                            <div className="bg-[#7A2840]/50 rounded-xl p-4 border border-[#7A2840] text-center">
                                <p className="text-sm text-[#3A0015]/60">No requests yet. Use Technical Support to get help!</p>
                            </div>
                        )}
                    </div>
                </motion.section>

            </div>
        </div>
    );
}
