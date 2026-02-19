"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, CheckCircle2, Flag, ChevronDown, ChevronUp, Circle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import Link from "next/link";

interface MemberData {
    id: string;
    name: string;
    food: string;
    checkin: boolean;
}

interface TeamData {
    id: string;
    name: string;
    college: string;
    track: string;
    problem_stat: string | null;
    members: MemberData[];
}

interface CheckpointData {
    id: number;
    number: number;
    title: string;
    description: string;
    is_locked: boolean;
    released_at: string | null;
}

interface CheckpointTaskData {
    id: string;
    team_id: string;
    checkpoint_id: number;
    text: string;
    completed: boolean;
}

export default function JudgeHomePage() {
    const { judge } = useAuth();
    const [assignedTeams, setAssignedTeams] = useState<TeamData[]>([]);
    const [checkpoints, setCheckpoints] = useState<CheckpointData[]>([]);
    const [checkpointTasks, setCheckpointTasks] = useState<Record<string, CheckpointTaskData[]>>({});
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchJudgeData() {
            if (!judge) return;

            setLoading(true);
            setError(null);

            try {
                // 1. Get assigned team IDs from judge_assignments
                const { data: assignments, error: assignError } = await supabase
                    .from("judge_assignments")
                    .select("team_id")
                    .eq("judge_id", judge.id);

                if (assignError) {
                    console.error("Assignment fetch error:", assignError);
                    setError("Failed to load assignments.");
                    setLoading(false);
                    return;
                }

                const teamIds = (assignments || []).map(a => a.team_id);

                if (teamIds.length === 0) {
                    setAssignedTeams([]);
                    setLoading(false);
                    return;
                }

                // 2. Fetch the teams
                const { data: teamsData, error: teamsError } = await supabase
                    .from("team")
                    .select("id, name, college, track, problem_stat")
                    .in("id", teamIds);

                if (teamsError) {
                    console.error("Teams fetch error:", teamsError);
                    setError("Failed to load teams.");
                    setLoading(false);
                    return;
                }

                // 3. Fetch members for all assigned teams
                const { data: membersData, error: membersError } = await supabase
                    .from("member")
                    .select("id, team_id, name, food, checkin")
                    .in("team_id", teamIds);

                if (membersError) {
                    console.error("Members fetch error:", membersError);
                    setError("Failed to load members.");
                    setLoading(false);
                    return;
                }

                // 4. Combine teams with their members
                const teamsWithMembers: TeamData[] = (teamsData || []).map(team => ({
                    ...team,
                    members: (membersData || []).filter(m => m.team_id === team.id),
                }));

                setAssignedTeams(teamsWithMembers);

                // 5. Fetch checkpoints
                const { data: cpData, error: cpError } = await supabase
                    .from("checkpoints")
                    .select("*")
                    .order("number", { ascending: true });

                if (!cpError && cpData) {
                    setCheckpoints(cpData);
                }

                // 6. Fetch checkpoint tasks for assigned teams
                const { data: tasksData, error: tasksError } = await supabase
                    .from("checkpoint_tasks")
                    .select("*")
                    .in("team_id", teamIds);

                if (!tasksError && tasksData) {
                    // Group by "team_id:checkpoint_id"
                    const grouped: Record<string, CheckpointTaskData[]> = {};
                    for (const task of tasksData) {
                        const key = `${task.team_id}:${task.checkpoint_id}`;
                        if (!grouped[key]) grouped[key] = [];
                        grouped[key].push(task);
                    }
                    setCheckpointTasks(grouped);
                }
            } catch (err) {
                console.error("Unexpected error:", err);
                setError("Something went wrong.");
            }

            setLoading(false);
        }

        fetchJudgeData();
    }, [judge]);

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

    // Derive project status from problem_stat
    const getProjectStatus = (team: TeamData) =>
        team.problem_stat ? "submitted" : "pending";

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#5C0124]">My Teams</h1>
                <p className="text-[#8B6F4E] mt-1">
                    {judge ? `${judge.name} — ${assignedTeams.length} team(s) assigned` : "Loading..."}
                </p>
            </div>

            {assignedTeams.length === 0 ? (
                <div className="bg-[#F8F0E3] rounded-2xl border border-[#E8D5B8] p-12 text-center">
                    <Users className="h-16 w-16 text-[#C09B6E] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#5C0124]">No Teams Assigned Yet</h3>
                    <p className="text-sm text-[#8B6F4E] mt-1">The admin will assign teams to you before judging begins.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {assignedTeams.map((team, i) => {
                        const isExpanded = expandedTeam === team.id;
                        const projectStatus = getProjectStatus(team);

                        return (
                            <motion.div
                                key={team.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#F8F0E3] rounded-2xl border border-[#E8D5B8] overflow-hidden shadow-sm"
                            >
                                {/* Team Header */}
                                <div className="p-6 border-b border-[#E8D5B8]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="px-3 py-1 bg-[#D4AF37] text-[#3A0015] text-xs font-bold rounded-full uppercase">{team.track}</span>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${projectStatus === "submitted" ? "bg-[#E7BB88]/20 text-[#E7BB88]" : "bg-yellow-900/30 text-yellow-400"}`}>
                                            {projectStatus.toUpperCase()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#5C0124]">{team.name}</h3>
                                    <p className="text-sm text-[#8B6F4E] mt-1">{team.college} · {team.track} · {team.members.length} members</p>
                                </div>

                                {/* Members */}
                                <div className="p-4 border-b border-[#E8D5B8]">
                                    <p className="text-xs font-bold text-[#5C0124] uppercase tracking-wider mb-2">Team Members</p>
                                    <div className="flex flex-wrap gap-2">
                                        {team.members.map((m) => (
                                            <div key={m.id} className="flex items-center gap-2 py-1.5 px-3 bg-[#5C0124]/50 rounded-lg">
                                                <div className="w-6 h-6 bg-[#5C0124] rounded-full flex items-center justify-center text-[9px] font-bold text-[#D4AF37]">
                                                    {m.name.split(" ").map(n => n[0]).join("")}
                                                </div>
                                                <span className="text-sm text-[#F4E4BC]">{m.name}</span>
                                                <CheckCircle2 className={`h-3 w-3 ${m.checkin ? "text-green-400" : "text-[#C09B6E]/30"}`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Checkpoint Progress Toggle */}
                                <button
                                    onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#F0E4D0] transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Flag className="h-4 w-4 text-[#5C0124]" />
                                        <span className="text-sm font-bold text-[#3A0015]">Checkpoint Progress & Tasks</span>
                                    </div>
                                    {isExpanded ? <ChevronUp className="h-4 w-4 text-[#8B6F4E]" /> : <ChevronDown className="h-4 w-4 text-[#8B6F4E]" />}
                                </button>

                                {/* Expanded Checkpoint Details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 space-y-4">
                                                {checkpoints.map(cp => {
                                                    const tasks = checkpointTasks[`${team.id}:${cp.id}`] || [];
                                                    const completed = tasks.filter(t => t.completed).length;

                                                    return (
                                                        <div key={cp.id} className={`rounded-xl border p-4 ${cp.is_locked ? "border-[#7A2840] bg-[#5C0124]/30" : "border-[#D4AF37]/30 bg-[#D4AF37]/5"}`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Flag className={`h-4 w-4 ${cp.is_locked ? "text-[#C09B6E]" : "text-[#D4AF37]"}`} />
                                                                    <h4 className="font-bold text-[#F4E4BC] text-sm">
                                                                        CP {cp.number}: {cp.title}
                                                                    </h4>
                                                                </div>
                                                                {cp.is_locked ? (
                                                                    <span className="text-xs px-2 py-0.5 bg-[#5C0124] text-[#C09B6E] rounded-full font-bold">Locked</span>
                                                                ) : (
                                                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">Released</span>
                                                                )}
                                                            </div>

                                                            {cp.released_at && (
                                                                <p className="text-[11px] text-[#C09B6E] mb-2" suppressHydrationWarning>Released: {new Date(cp.released_at).toLocaleString()}</p>
                                                            )}

                                                            {tasks.length === 0 ? (
                                                                <p className="text-xs text-[#8B6F4E]/60 italic">No tasks submitted yet</p>
                                                            ) : (
                                                                <>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-[#5C0124] rounded-full transition-all"
                                                                                style={{ width: `${tasks.length > 0 ? (completed / tasks.length) * 100 : 0}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-[11px] text-[#8B6F4E] font-bold">{completed}/{tasks.length}</span>
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        {tasks.map(task => (
                                                                            <div key={task.id} className="flex items-start gap-2 text-sm">
                                                                                {task.completed ? (
                                                                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                                                                ) : (
                                                                                    <Circle className="h-4 w-4 text-gray-300 mt-0.5 shrink-0" />
                                                                                )}
                                                                                <span className={task.completed ? "text-[#8B6F4E]" : "text-[#3A0015]"}>
                                                                                    {task.text}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Score Button */}
                                <div className="px-4 pb-4">
                                    <Link
                                        href={`/judge/scoring?team=${team.id}`}
                                        className="block w-full text-center bg-[#5C0124] hover:bg-[#7A2840] text-[#F4E4BC] font-bold py-3 rounded-xl transition-colors text-sm"
                                    >
                                        Score This Team
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
