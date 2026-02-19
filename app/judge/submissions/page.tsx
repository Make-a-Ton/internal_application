"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, ChevronDown, ChevronUp, Loader2, FileText, Globe, Github, Video, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface SubmissionData {
    id: number;
    team_id: string;
    name: string;
    tagline: string;
    description: string;
    tech_stack: string;
    git_repo: string;
    vid_url: string;
    arch_image_url: string;
    screenshots: string[];
}

interface TeamData {
    id: string;
    name: string;
    college: string;
    track: string;
    submission?: SubmissionData;
}

function SubmissionsContent() {
    const { judge } = useAuth();
    const searchParams = useSearchParams();
    const [teams, setTeams] = useState<TeamData[]>([]);
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSubmissions() {
            if (!judge) return;

            setLoading(true);
            setError(null);

            try {
                // 1. Get assigned team IDs
                const { data: assignments, error: assignError } = await supabase
                    .from("judge_assignments")
                    .select("team_id")
                    .eq("judge_id", judge.id);

                if (assignError) throw assignError;

                const teamIds = (assignments || []).map(a => a.team_id);

                if (teamIds.length === 0) {
                    setTeams([]);
                    setLoading(false);
                    return;
                }

                // 2. Fetch the teams
                const { data: teamsData, error: teamsError } = await supabase
                    .from("team")
                    .select("id, name, college, track")
                    .in("id", teamIds);

                if (teamsError) throw teamsError;

                // 3. Fetch submissions for these teams
                const { data: submissionsData, error: subError } = await supabase
                    .from("submissions")
                    .select("*")
                    .in("team_id", teamIds);

                if (subError) {
                    console.error("Submissions fetch error:", subError);
                    // Don't fail entire page if submissions table has issues, but log it
                }

                // 4. Combine teams with their submissions
                const combinedTeams: TeamData[] = (teamsData || []).map(team => ({
                    ...team,
                    submission: (submissionsData || []).find(s => s.team_id === team.id),
                }));

                setTeams(combinedTeams);

                // Auto-expand team from URL
                const teamParam = searchParams.get("team");
                if (teamParam && teamIds.includes(teamParam)) {
                    setExpandedTeam(teamParam);
                }
            } catch (err: any) {
                console.error("Unexpected error:", err);
                setError(err.message || "Failed to load submissions.");
            } finally {
                setLoading(false);
            }
        }

        fetchSubmissions();
    }, [judge, searchParams]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#E7BB88] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
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
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#5C0124]">Submissions</h1>
                <p className="text-[#8B6F4E] mt-1">
                    Review project details submitted by your assigned teams
                </p>
            </div>

            {teams.length === 0 ? (
                <div className="bg-[#F8F0E3] rounded-2xl border border-[#E8D5B8] p-12 text-center">
                    <Users className="h-16 w-16 text-[#C09B6E] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#5C0124]">No Teams Assigned Yet</h3>
                    <p className="text-sm text-[#8B6F4E] mt-1">Contact admin if you believe this is an error.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {teams.map((team, i) => {
                        const isExpanded = expandedTeam === team.id;
                        const sub = team.submission;

                        return (
                            <motion.div
                                key={team.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#F8F0E3] rounded-2xl border border-[#E8D5B8] overflow-hidden shadow-sm"
                            >
                                {/* Team Header */}
                                <div className="p-6 border-b border-[#E8D5B8] flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-3 py-1 bg-[#D4AF37] text-[#3A0015] text-xs font-bold rounded-full uppercase">{team.track}</span>
                                            {sub ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase flex items-center gap-1">
                                                    <FileText className="h-3 w-3" /> Submitted
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full uppercase">Pending</span>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-bold text-[#5C0124]">{team.name}</h3>
                                        <p className="text-sm text-[#8B6F4E] mt-1">{team.college}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/judge/scoring?team=${team.id}`}
                                            className="px-6 py-3 bg-[#5C0124] hover:bg-[#7A2840] text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                                        >
                                            Score This Team
                                        </Link>
                                    </div>
                                </div>

                                {/* Toggle Button */}
                                <button
                                    onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                                    className="w-full px-6 py-3 flex items-center justify-between hover:bg-[#F0E4D0] transition-colors text-[#5C0124] font-bold text-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <span>{isExpanded ? "Hide Details" : "View Submission Details"}</span>
                                    </div>
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>

                                {/* Submission Details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-white/30"
                                        >
                                            <div className="p-6">
                                                {!sub ? (
                                                    <div className="py-12 text-center text-[#8B6F4E]">
                                                        <p className="italic">No project details submitted yet.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-8">
                                                        {/* Project Name & Tagline */}
                                                        <div>
                                                            <h4 className="text-xl font-bold text-[#3A0015]">{sub.name}</h4>
                                                            <p className="text-[#5C0124] font-medium mt-1">{sub.tagline}</p>
                                                        </div>

                                                        {/* Description */}
                                                        <div>
                                                            <p className="text-xs font-bold text-[#5C0124] uppercase tracking-widest mb-3">Project Description</p>
                                                            <div className="bg-white/50 rounded-xl p-4 border border-[#E8D5B8] text-[#3A0015] text-sm leading-relaxed whitespace-pre-wrap">
                                                                {sub.description}
                                                            </div>
                                                        </div>

                                                        {/* Tech Stack */}
                                                        <div>
                                                            <p className="text-xs font-bold text-[#5C0124] uppercase tracking-widest mb-3">Tech Stack</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {sub.tech_stack.split(/[,+]/).map((tech, idx) => (
                                                                    <span key={idx} className="px-3 py-1 bg-[#5C0124]/10 text-[#5C0124] rounded-lg text-xs font-bold">
                                                                        {tech.trim()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Links */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {sub.git_repo && (
                                                                <a
                                                                    href={sub.git_repo}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-3 p-4 bg-white/60 border border-[#E8D5B8] rounded-xl hover:bg-white transition-colors"
                                                                >
                                                                    <div className="w-10 h-10 bg-[#333] rounded-lg flex items-center justify-center text-white">
                                                                        <Github className="h-5 w-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold text-[#8B6F4E] uppercase">GitHub Repo</p>
                                                                        <p className="text-sm text-[#5C0124] font-bold truncate">View Source Code</p>
                                                                    </div>
                                                                    <ExternalLink className="h-4 w-4 ml-auto text-[#8B6F4E]" />
                                                                </a>
                                                            )}
                                                            {sub.vid_url && (
                                                                <a
                                                                    href={sub.vid_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-3 p-4 bg-white/60 border border-[#E8D5B8] rounded-xl hover:bg-white transition-colors"
                                                                >
                                                                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white">
                                                                        <Video className="h-5 w-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold text-[#8B6F4E] uppercase">Demo Video</p>
                                                                        <p className="text-sm text-[#5C0124] font-bold truncate">Watch Demo</p>
                                                                    </div>
                                                                    <ExternalLink className="h-4 w-4 ml-auto text-[#8B6F4E]" />
                                                                </a>
                                                            )}
                                                        </div>

                                                        {/* Screenshots & Architecture */}
                                                        <div className="space-y-6">
                                                            {sub.arch_image_url && (
                                                                <div>
                                                                    <p className="text-xs font-bold text-[#5C0124] uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                        <Globe className="h-4 w-4" /> Architecture Diagram
                                                                    </p>
                                                                    <div className="bg-white/50 rounded-2xl p-2 border border-[#E8D5B8]">
                                                                        <img
                                                                            src={sub.arch_image_url}
                                                                            alt="Architecture Diagram"
                                                                            className="w-full h-auto rounded-xl shadow-lg border border-[#E8D5B8]"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {sub.screenshots && sub.screenshots.length > 0 && (
                                                                <div>
                                                                    <p className="text-xs font-bold text-[#5C0124] uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                        <ImageIcon className="h-4 w-4" /> Project Screenshots
                                                                    </p>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                        {sub.screenshots.map((url, idx) => (
                                                                            <motion.div
                                                                                key={idx}
                                                                                whileHover={{ scale: 1.02 }}
                                                                                className="bg-white/50 rounded-xl p-1.5 border border-[#E8D5B8] shadow-sm"
                                                                            >
                                                                                <img
                                                                                    src={url}
                                                                                    alt={`Screenshot ${idx + 1}`}
                                                                                    className="w-full aspect-video object-cover rounded-lg"
                                                                                />
                                                                            </motion.div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function SubmissionsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen p-4 md:p-8 flex items-center justify-center"><Loader2 className="h-8 w-8 text-[#E7BB88] animate-spin" /></div>}>
            <SubmissionsContent />
        </Suspense>
    );
}
