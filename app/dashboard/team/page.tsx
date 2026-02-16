"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Bell, User, Heart, ThumbsUp, Phone, QrCode, Clock, LogOut, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "../../components/BottomNav";
import { supabase } from "../../../lib/supabase";

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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
                <div className="text-center">
                    <p className="text-red-500 font-semibold mb-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-sm text-gray-500 underline"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6 text-gray-700" />
                        </Link>
                        <h1 className="text-xl font-extrabold text-gray-900">Profile</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Bell className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600">{teamInitials}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Team Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-900 text-white py-12 px-6 text-center"
            >
                {/* Team Avatar */}
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl font-extrabold text-gray-900">{teamInitials}</span>
                </div>

                {/* Team Name */}
                <h2 className="text-2xl font-extrabold mb-3">{team?.name ?? "Unknown Team"}</h2>

                {/* Track Badge */}
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-800 text-gray-300 text-xs font-bold rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    {team?.track ?? "GENERAL"}
                </span>
            </motion.section>

            {/* Project Status */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mx-4 mt-6"
            >
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Project Status
                    </p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-extrabold text-gray-900 capitalize">
                            {projectStatus}
                        </h3>
                        {projectStatus === "submitted" && (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
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
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Team</h2>
                    <span className="text-xs text-gray-400">{members.length}</span>
                </div>

                <div className="space-y-3">
                    {members.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>

                                {/* Info */}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">
                                            HACKER
                                        </span>
                                        {member.checkin && (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                CHECKED IN
                                            </span>
                                        )}
                                    </div>
                                    {/* Action Icons */}
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Heart className="h-4 w-4" />
                                        <ThumbsUp className="h-4 w-4" />
                                        <Phone className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Name (Right Side) */}
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-gray-900">{member.name}</span>

                                {/* QR Code Button */}
                                <button className="w-10 h-10 bg-gray-900 hover:bg-gray-800 text-white rounded-xl flex items-center justify-center transition-colors">
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
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-gray-200 shadow-sm"
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
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-100"
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
                className="text-center text-xs text-gray-300 mt-6"
            >
                MAKEATON v1.0
            </motion.p>

            <BottomNav />
        </div>
    );
}
