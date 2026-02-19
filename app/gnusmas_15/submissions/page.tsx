"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Filter, ChevronDown, ChevronUp, Loader2, FileText, Globe, Github, Video, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

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

export default function AdminSubmissionsPage() {
    const [teams, setTeams] = useState<TeamData[]>([]);
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [trackFilter, setTrackFilter] = useState("all");

    useEffect(() => {
        async function fetchAllSubmissions() {
            setLoading(true);
            setError(null);

            try {
                // 1. Fetch all teams
                const { data: teamsData, error: teamsError } = await supabase
                    .from("team")
                    .select("id, name, college, track");

                if (teamsError) throw teamsError;

                // 2. Fetch all submissions
                const { data: submissionsData, error: subError } = await supabase
                    .from("submissions")
                    .select("*");

                if (subError) throw subError;

                // 3. Combine
                const combined: TeamData[] = (teamsData || []).map(team => ({
                    ...team,
                    submission: (submissionsData || []).find(s => s.team_id === team.id),
                }));

                setTeams(combined);
            } catch (err: any) {
                console.error("Error fetching admin submissions:", err);
                setError(err.message || "Failed to load submissions.");
            } finally {
                setLoading(false);
            }
        }

        fetchAllSubmissions();
    }, []);

    const filteredTeams = teams.filter(team => {
        const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.college.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTrack = trackFilter === "all" || team.track === trackFilter;
        return matchesSearch && matchesTrack;
    });

    const tracks = Array.from(new Set(teams.map(t => t.track))).filter(Boolean);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#5C0124] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#5C0124]">Team Submissions</h1>
                <p className="text-[#8B6F4E] mt-1">Monitor and review all project submissions</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B6F4E]" />
                    <input
                        type="text"
                        placeholder="Search by team or college..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8D5B8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5C0124]"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B6F4E]" />
                    <select
                        value={trackFilter}
                        onChange={(e) => setTrackFilter(e.target.value)}
                        className="pl-10 pr-8 py-3 bg-white border border-[#E8D5B8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5C0124] appearance-none cursor-pointer"
                    >
                        <option value="all">All Tracks</option>
                        {tracks.map(track => (
                            <option key={track} value={track}>{track.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredTeams.length === 0 ? (
                <div className="bg-[#F8F0E3] rounded-2xl border border-[#E8D5B8] p-12 text-center">
                    <Users className="h-16 w-16 text-[#C09B6E] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#5C0124]">No Submissions Found</h3>
                    <p className="text-sm text-[#8B6F4E] mt-1">Try adjusting your filters or search query.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTeams.map((team, i) => {
                        const isExpanded = expandedTeam === team.id;
                        const sub = team.submission;

                        return (
                            <motion.div
                                key={team.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-2xl border border-[#E8D5B8] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Summary Bar */}
                                <div
                                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                                    onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-[#5C0124]/10 rounded-xl flex items-center justify-center text-[#5C0124] font-bold">
                                            {team.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#3A0015]">{team.name}</h3>
                                            <p className="text-xs text-[#8B6F4E]">{team.college} · {team.track.toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {sub ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-extrabold rounded-full uppercase flex items-center gap-1">
                                                <FileText className="h-3 w-3" /> Submitted
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-extrabold rounded-full uppercase">Pending</span>
                                        )}
                                        {isExpanded ? <ChevronUp className="h-5 w-5 text-[#8B6F4E]" /> : <ChevronDown className="h-5 w-5 text-[#8B6F4E]" />}
                                    </div>
                                </div>

                                {/* Details Area */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-[#F8F0E3]/30 border-t border-[#E8D5B8]"
                                        >
                                            <div className="p-6">
                                                {!sub ? (
                                                    <div className="py-8 text-center text-[#8B6F4E]">
                                                        <p className="italic text-sm">Team hasn't submitted their project details yet.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-8">
                                                        {/* Info Row */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-[#5C0124] uppercase tracking-widest mb-1">Project Name</p>
                                                                    <p className="text-lg font-bold text-[#3A0015]">{sub.name}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-[#5C0124] uppercase tracking-widest mb-1">Tagline</p>
                                                                    <p className="text-[#5C0124] font-medium">{sub.tagline}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-[#5C0124] uppercase tracking-widest mb-2">Description</p>
                                                                    <div className="bg-white rounded-xl p-4 border border-[#E8D5B8] text-sm text-[#3A0015] leading-relaxed whitespace-pre-wrap">
                                                                        {sub.description}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-6">
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-[#5C0124] uppercase tracking-widest mb-2">Tech Stack</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {sub.tech_stack.split(/[,+]/).map((tech, idx) => (
                                                                            <span key={idx} className="px-3 py-1 bg-[#5C0124] text-white rounded-lg text-xs font-bold">
                                                                                {tech.trim()}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <p className="text-[10px] font-bold text-[#5C0124] uppercase tracking-widest mb-2">Links</p>
                                                                    <div className="space-y-2">
                                                                        {sub.git_repo && (
                                                                            <a href={sub.git_repo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#5C0124] hover:underline">
                                                                                <Github className="h-4 w-4" /> GitHub Repository
                                                                            </a>
                                                                        )}
                                                                        {sub.vid_url && (
                                                                            <a href={sub.vid_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#5C0124] hover:underline">
                                                                                <Video className="h-4 w-4" /> Demo Video
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Media Section */}
                                                        {(sub.arch_image_url || (sub.screenshots && sub.screenshots.length > 0)) && (
                                                            <div className="space-y-6 pt-4 border-t border-[#E8D5B8]">
                                                                {sub.arch_image_url && (
                                                                    <div>
                                                                        <p className="text-[10px] font-bold text-[#5C0124] uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                            <Globe className="h-4 w-4" /> Architecture Diagram
                                                                        </p>
                                                                        <img src={sub.arch_image_url} alt="Arch" className="max-w-md w-full rounded-xl border border-[#E8D5B8] shadow-sm" />
                                                                    </div>
                                                                )}

                                                                {sub.screenshots && sub.screenshots.length > 0 && (
                                                                    <div>
                                                                        <p className="text-[10px] font-bold text-[#5C0124] uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                            <ImageIcon className="h-4 w-4" /> Screenshots
                                                                        </p>
                                                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                                            {sub.screenshots.map((url, idx) => (
                                                                                <img key={idx} src={url} alt={`SS ${idx}`} className="w-full aspect-video object-cover rounded-lg border border-[#E8D5B8]" />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
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
