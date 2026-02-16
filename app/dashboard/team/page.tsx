"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Bell, User, Heart, ThumbsUp, Phone, QrCode, Clock, LogOut, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "../../components/BottomNav";
import { supabase } from "../../lib/supabase";

interface TeamData {
    id: string;
    name: string;
    track: string;
    college: string;
    problem_stat: string | null;
}

interface MemberData {
    id: string;
    team_id: string;
    name: string;
    food: string;
    checkin: boolean;
}

export default function TeamPage() {
    const router = useRouter();
    const [team, setTeam] = useState<TeamData | null>(null);
    const [members, setMembers] = useState<MemberData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);

            // Fetch the first team
            const { data: teamData, error: teamError } = await supabase
                .from("team")
                .select("*")
                .limit(1)
                .single();

            if (teamError) {
                setError("Failed to load team data.");
                setLoading(false);
                console.error("Team fetch error:", teamError);
                return;
            }

            setTeam(teamData);

            // Fetch members for this team
            const { data: memberData, error: memberError } = await supabase
                .from("member")
                .select("*")
                .eq("team_id", teamData.id);

            if (memberError) {
                setError("Failed to load member data.");
                setLoading(false);
                console.error("Member fetch error:", memberError);
                return;
            }

            setMembers(memberData || []);
            setLoading(false);
        }

        fetchData();
    }, []);

    const handleLogout = () => {
        router.push("/");
    };

    // Derive project status from problem_stat
    const projectStatus: "submitted" | "pending" | "in-progress" =
        team?.problem_stat ? "submitted" : "pending";

    // Generate initials from team name
    const teamInitials = team?.name
        ? team.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "..";

    if (loading) {
        return (
            <div className="min-h-screen bg-[#5C0124] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#E7BB88] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#5C0124] flex items-center justify-center px-6">
                <div className="text-center">
                    <p className="text-red-400 font-semibold mb-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-sm text-[#C09B6E] underline"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#5C0124] pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#5C0124] border-b border-[#7A2840]">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="p-2 -ml-2 hover:bg-[#7A2840] rounded-full transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6 text-[#D4AF37]" />
                        </Link>
                        <h1 className="text-xl font-extrabold text-[#F4E4BC]">Profile</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-[#7A2840] rounded-full transition-colors">
                            <Bell className="h-5 w-5 text-[#C09B6E]" />
                        </button>
                        <div className="w-9 h-9 bg-[#7A2840] rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-[#D4AF37]">TR</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Team Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-br from-[#7A2840] to-[#3A0015] text-[#F4E4BC] py-12 px-6 text-center"
            >
                {/* Team Avatar */}
                <div className="w-20 h-20 bg-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl font-extrabold text-[#3A0015]">TE</span>
                </div>

                {/* Team Name */}
                <h2 className="text-2xl font-extrabold mb-3">{team?.name ?? "Unknown Team"}</h2>

                {/* Category Badge */}
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#5C0124] text-[#C09B6E] text-xs font-bold rounded-full uppercase tracking-wider border border-[#7A2840]">
                    <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                    {teamCategory}
                </span>
            </motion.section>

            {/* Project Status */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mx-4 mt-6"
            >
                <div className="bg-[#7A2840]/50 rounded-xl p-5 border border-[#7A2840]">
                    <p className="text-xs font-bold text-[#C09B6E] uppercase tracking-widest mb-2">
                        Project Status
                    </p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-extrabold text-[#F4E4BC] capitalize">
                            {projectStatus}
                        </h3>
                        {projectStatus === "submitted" && (
                            <CheckCircle2 className="h-6 w-6 text-[#E7BB88]" />
                        )}
                    </div>
                </div>
            </motion.section>

            {/* Team Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mx-4 mt-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">Team</h2>
                    <span className="text-xs text-[#C09B6E]">{teamMembers.length}</span>
                </div>

                <div className="space-y-3">
                    {members.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="bg-[#7A2840]/50 rounded-xl p-4 border border-[#7A2840] flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-10 h-10 bg-[#5C0124] rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-[#C09B6E]" />
                                </div>

                                {/* Info */}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-[#C09B6E] uppercase">
                                            {member.role}
                                        </span>
                                        {member.isCheckedIn && (
                                            <span className="px-2 py-0.5 bg-[#E7BB88]/20 text-[#E7BB88] text-xs font-bold rounded-full">
                                                CHECKED IN
                                            </span>
                                        )}
                                    </div>
                                    {/* Action Icons */}
                                    <div className="flex items-center gap-3 text-[#C09B6E]/50">
                                        <Heart className="h-4 w-4" />
                                        <ThumbsUp className="h-4 w-4" />
                                        <Phone className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Name (Right Side) */}
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-[#F4E4BC]">{member.name}</span>

                                {/* QR Code Button */}
                                <button className="w-10 h-10 bg-[#D4AF37] hover:bg-[#C09B6E] text-[#3A0015] rounded-xl flex items-center justify-center transition-colors">
                                    <QrCode className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* View Checkpoints Button */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mx-4 mt-6"
            >
                <Link
                    href="/dashboard/checkpoints"
                    className="w-full bg-[#7A2840]/50 hover:bg-[#7A2840]/70 text-[#F4E4BC] font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-[#7A2840]"
                >
                    <Clock className="h-5 w-5" />
                    View Checkpoints
                </Link>
            </motion.section>

            {/* Logout Button */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mx-4 mt-4"
            >
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-900/50"
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </motion.section>

            {/* Version */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center text-xs text-[#C09B6E]/50 mt-6"
            >
                MAKEATON v1.0
            </motion.p>

            <BottomNav />
        </div>
    );
}
