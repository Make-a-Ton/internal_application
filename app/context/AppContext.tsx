"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

// ============== TYPES ==============
export interface CheckpointTask {
    id: string; // UUID from DB
    text: string;
    completed: boolean;
}

export interface Checkpoint {
    id: number;
    number: number;
    title: string;
    description: string;
    isLocked: boolean;
    releasedAt?: string;
}

export interface HelpRequest {
    id: string;
    team: string; // Team Name
    teamId?: string; // Added for DB link
    category: string;
    urgency: "critical" | "normal";
    message: string;
    description: string;
    status: "pending" | "in-progress" | "done";
    timestamp: string;
}

export interface AppNotification {
    id: string;
    title: string;
    description?: string;
    url?: string;
    priority: "high" | "normal";
    timestamp: string;
    read?: boolean; // Client-side only for now
}

// ============== JUDGE TYPES ==============
export interface Judge {
    id: string;
    name: string;
    pin: string;
    assignedTeamIds: string[]; // Computed from judge_assignments
}

export interface TeamScore {
    id: string;
    judgeId: string;
    teamId: string;
    scores: {
        innovation: number;
        technicalComplexity: number;
        feasibility: number;
        marketViability: number;
        pitching: number;
        completion: number;
    };
    total: number;
    timestamp: string;
}

export interface TeamInfo {
    id: string;
    name: string;
    code: string;
    college: string;
    category: string;
    members: { name: string; role: string; isCheckedIn: boolean; food_pref?: string }[];
    projectStatus: "submitted" | "pending" | "in-progress";
}

export const SCORING_CRITERIA = [
    { key: "innovation", label: "Innovation & Creativity", description: "Originality of the idea" },
    { key: "technicalComplexity", label: "Technical Complexity", description: "Depth of technical implementation" },
    { key: "feasibility", label: "Feasibility & Practicality", description: "Can it be realistically built & used?" },
    { key: "marketViability", label: "Market Viability", description: "Potential market demand & impact" },
    { key: "pitching", label: "Pitching & Presentation", description: "Quality of demo & communication" },
    { key: "completion", label: "Project Completion", description: "How complete is the project?" },
] as const;

export type ScoreKey = typeof SCORING_CRITERIA[number]["key"];

// ============== LEADERBOARD HELPER ==============
export interface LeaderboardEntry {
    teamId: string;
    teamName: string;
    avgScore: number;
    judgeCount: number;
    breakdown: { [judgeId: string]: number };
}

export function computeLeaderboard(scores: TeamScore[], teams: TeamInfo[]): LeaderboardEntry[] {
    const teamScores: { [teamId: string]: { totals: number[]; byJudge: { [judgeId: string]: number } } } = {};

    for (const s of scores) {
        if (!teamScores[s.teamId]) teamScores[s.teamId] = { totals: [], byJudge: {} };
        teamScores[s.teamId].totals.push(s.total);
        teamScores[s.teamId].byJudge[s.judgeId] = s.total;
    }

    return Object.entries(teamScores)
        .map(([teamId, data]) => {
            const team = teams.find(t => t.id === teamId);
            return {
                teamId,
                teamName: team?.name || `Team ${teamId}`,
                avgScore: data.totals.reduce((a, b) => a + b, 0) / data.totals.length,
                judgeCount: data.totals.length,
                breakdown: data.byJudge,
            };
        })
        .sort((a, b) => b.avgScore - a.avgScore);
}

// ============== CONTEXT ==============
interface AppState {
    teams: TeamInfo[];
    checkpoints: Checkpoint[];
    requests: HelpRequest[];
    notifications: AppNotification[];
    checkpointTasks: { [key: string]: CheckpointTask[] };
    judges: Judge[];
    scores: TeamScore[];
    toggleCheckpointLock: (id: number) => Promise<void>;
    addRequest: (req: Omit<HelpRequest, "id" | "timestamp" | "status" | "team"> & { teamId?: string }) => Promise<void>;
    updateRequestStatus: (id: string, status: HelpRequest["status"]) => Promise<void>;
    addNotification: (notif: Omit<AppNotification, "id" | "timestamp">) => Promise<void>;
    updateCheckpointTasks: (teamId: string, checkpointId: number, tasks: CheckpointTask[]) => Promise<void>;
    assignTeamToJudge: (judgeId: string, teamId: string) => Promise<void>;
    unassignTeamFromJudge: (judgeId: string, teamId: string) => Promise<void>;
    submitScore: (score: Omit<TeamScore, "id" | "timestamp">) => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function useAppState() {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppState must be used within AppProvider");
    return context;
}

export function AppProvider({ children }: { children: ReactNode }) {
    const [teams, setTeams] = useState<TeamInfo[]>([]);
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
    const [requests, setRequests] = useState<HelpRequest[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [checkpointTasks, setCheckpointTasks] = useState<{ [key: string]: CheckpointTask[] }>({});
    const [judges, setJudges] = useState<Judge[]>([]);
    const [scores, setScores] = useState<TeamScore[]>([]);

    const fetchData = async () => {
        // 1. Teams & Members
        const { data: teamsData, error: teamsError } = await supabase.from('teams').select('*');
        if (teamsError) console.error("Error fetching teams:", teamsError);
        const { data: membersData, error: membersError } = await supabase.from('team_members').select('*');
        if (membersError) console.error("Error fetching members:", membersError);

        if (teamsData) {
            const formattedTeams: TeamInfo[] = teamsData.map(t => ({
                id: t.id,
                name: t.name,
                code: t.code,
                college: t.college || 'Unknown',
                category: t.category,
                projectStatus: t.project_status as any,
                members: membersData?.filter(m => m.team_id === t.id).map(m => ({
                    name: m.name,
                    role: m.role,
                    isCheckedIn: m.is_checked_in,
                    food_pref: m.food_pref
                })) || []
            }));
            setTeams(formattedTeams);
        }

        // 2. Checkpoints
        const { data: cpData, error: cpError } = await supabase.from('checkpoints').select('*').order('number');
        if (cpError) console.error("Error fetching checkpoints:", cpError);
        if (cpData) {
            setCheckpoints(cpData.map(c => ({
                id: c.id,
                number: c.number,
                title: c.title,
                description: c.description,
                isLocked: c.is_locked,
                releasedAt: c.released_at ? new Date(c.released_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) : undefined,
            })));
        }

        // 3. Tasks
        const { data: tasksData, error: tasksError } = await supabase.from('checkpoint_tasks').select('*');
        if (tasksError) console.error("Error fetching tasks:", tasksError);
        if (tasksData) {
            const taskMap: { [key: string]: CheckpointTask[] } = {};
            tasksData.forEach(task => {
                const key = `${task.team_id}:${task.checkpoint_id}`;
                if (!taskMap[key]) taskMap[key] = [];
                taskMap[key].push({ id: task.id, text: task.text, completed: task.completed });
            });
            setCheckpointTasks(taskMap);
        }

        // 4. Judges & Assignments
        const { data: judgesData, error: judgesError } = await supabase.from('judges').select('*');
        if (judgesError) console.error("Error fetching judges:", judgesError);
        const { data: assignmentsData, error: assignmentsError } = await supabase.from('judge_assignments').select('*');
        if (assignmentsError) console.error("Error fetching assignments:", assignmentsError);

        if (judgesData) {
            setJudges(judgesData.map(j => ({
                id: j.id,
                name: j.name,
                pin: j.pin,
                assignedTeamIds: assignmentsData?.filter(a => a.judge_id === j.id).map(a => a.team_id) || []
            })));
        }

        // 5. Help Requests (Joined with Teams for name)
        const { data: reqData, error: reqError } = await supabase.from('help_requests').select('*, teams(name)').order('created_at', { ascending: false });
        if (reqError) console.error("Error fetching requests:", reqError);
        if (reqData) {
            setRequests(reqData.map(r => ({
                id: r.id,
                team: (r.teams as any)?.name || "Unknown Team",
                teamId: r.team_id,
                category: r.category,
                urgency: r.urgency as any,
                message: r.message,
                description: r.description,
                status: r.status as any,
                timestamp: new Date(r.created_at).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true })
            })));
        }

        // 6. Notifications
        const { data: notifData, error: notifError } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (notifError) console.error("Error fetching notifications:", notifError);
        if (notifData) {
            setNotifications(notifData.map(n => ({
                id: n.id,
                title: n.title,
                description: n.description,
                url: n.url,
                priority: n.priority as any,
                timestamp: new Date(n.created_at).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true })
            })));
        }

        // 7. Scores
        const { data: scoresData, error: scoresError } = await supabase.from('team_scores').select('*');
        if (scoresError) console.error("Error fetching scores:", scoresError);
        if (scoresData) {
            setScores(scoresData.map(s => ({
                id: s.id,
                judgeId: s.judge_id,
                teamId: s.team_id,
                scores: {
                    innovation: s.innovation,
                    technicalComplexity: s.technical_complexity,
                    feasibility: s.feasibility,
                    marketViability: s.market_viability,
                    pitching: s.pitching,
                    completion: s.completion
                },
                total: s.total,
                timestamp: new Date(s.created_at).toLocaleString()
            })));
        }
    };

    // Load data on mount
    useEffect(() => {
        fetchData();

        // Realtime Subscription (works if Realtime is enabled on tables in Supabase dashboard)
        const channel = supabase.channel('schema-db-changes')
            .on('postgres_changes', { event: '*', schema: 'public' }, () => {
                fetchData(); // Simplest strategy: refetch all on any change
            })
            .subscribe();

        // Polling fallback: refetch every 5 seconds for reliable cross-portal sync
        const pollInterval = setInterval(() => {
            fetchData();
        }, 5000);

        // Refetch when the user switches back to this tab/window
        const handleFocus = () => fetchData();
        window.addEventListener('focus', handleFocus);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(pollInterval);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const toggleCheckpointLock = useCallback(async (id: number) => {
        const cp = checkpoints.find(c => c.id === id);
        if (!cp) return;

        const newLocked = !cp.isLocked;
        const releasedAt = !newLocked ? new Date().toISOString() : null;

        await supabase.from('checkpoints').update({ is_locked: newLocked, released_at: releasedAt }).eq('id', id);
        // State updates automatically via subscription or we can optimistic update here
        setCheckpoints(prev => prev.map(c => c.id === id ? { ...c, isLocked: newLocked, releasedAt: releasedAt ? new Date(releasedAt).toLocaleString() : undefined } : c));
    }, [checkpoints]);

    const addRequest = useCallback(async (req: Omit<HelpRequest, "id" | "timestamp" | "status" | "team"> & { teamId?: string }) => {
        // If teamId not provided, we should probably fail or fetch from profile if using auth.
        // Assuming teamId is passed or handled.
        if (!req.teamId) {
            // Fallback for demo if teamId missing (e.g. from hardcoded components)
            // We can fetch a default team for now or just log error.
            console.error("Missing teamId for help request");
            return;
        }

        await supabase.from('help_requests').insert({
            team_id: req.teamId,
            category: req.category,
            urgency: req.urgency,
            message: req.message,
            description: req.description,
            status: 'pending'
        });
    }, []);

    const updateRequestStatus = useCallback(async (id: string, status: HelpRequest["status"]) => {
        await supabase.from('help_requests').update({ status }).eq('id', id);
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }, []);

    const addNotification = useCallback(async (notif: Omit<AppNotification, "id" | "timestamp">) => {
        await supabase.from('notifications').insert({
            title: notif.title,
            description: notif.description,
            url: notif.url,
            priority: notif.priority
        });
    }, []);

    const updateCheckpointTasks = useCallback(async (teamId: string, checkpointId: number, tasks: CheckpointTask[]) => {
        // First, check if tasks exist. If not, insert. If so, update status.
        // Actually, we are passing the full list of tasks for the checkpoint.
        // And DB stores individual tasks.
        // Strategy:
        // 1. Get existing tasks for this team/checkpoint from DB? Not needed if we trust the input.
        // 2. We can't batch delete/insert easily without transaction or complex query.
        // 3. Upsert by (team_id, checkpoint_id, text) because text is unique per checkpoint/team in current model?
        // Wait, text might change?
        // A better approach is to rely on 'text' being the unique key logic as per schema.

        const upsertData = tasks.map(t => ({
            team_id: teamId,
            checkpoint_id: checkpointId,
            text: t.text,
            completed: t.completed
        }));

        const { error } = await supabase.from('checkpoint_tasks').upsert(upsertData, { onConflict: 'team_id,checkpoint_id,text' });
        if (error) console.error("Error updating tasks:", error);

        // Local update
        const key = `${teamId}:${checkpointId}`;
        setCheckpointTasks(prev => ({ ...prev, [key]: tasks }));
    }, []);

    const assignTeamToJudge = useCallback(async (judgeId: string, teamId: string) => {
        await supabase.from('judge_assignments').insert({ judge_id: judgeId, team_id: teamId });
        setJudges(prev => prev.map(j =>
            j.id === judgeId ? { ...j, assignedTeamIds: [...j.assignedTeamIds, teamId] } : j
        ));
    }, []);

    const unassignTeamFromJudge = useCallback(async (judgeId: string, teamId: string) => {
        await supabase.from('judge_assignments').delete().match({ judge_id: judgeId, team_id: teamId });
        setJudges(prev => prev.map(j =>
            j.id === judgeId ? { ...j, assignedTeamIds: j.assignedTeamIds.filter(id => id !== teamId) } : j
        ));
    }, []);

    const submitScore = useCallback(async (score: Omit<TeamScore, "id" | "timestamp">) => {
        const dbScore = {
            judge_id: score.judgeId,
            team_id: score.teamId,
            innovation: score.scores.innovation,
            technical_complexity: score.scores.technicalComplexity,
            feasibility: score.scores.feasibility,
            market_viability: score.scores.marketViability,
            pitching: score.scores.pitching,
            completion: score.scores.completion,
            total: score.total
        };

        await supabase.from('team_scores').upsert(dbScore, { onConflict: 'judge_id,team_id' });
    }, []);

    return (
        <AppContext.Provider value={{
            teams, checkpoints, requests, notifications, checkpointTasks, judges, scores,
            toggleCheckpointLock, addRequest, updateRequestStatus, addNotification,
            updateCheckpointTasks, assignTeamToJudge, unassignTeamFromJudge, submitScore,
        }}>
            {children}
        </AppContext.Provider>
    );
}

// Keeping this for backward compatibility (but empty) to allow step-by-step migration
export const allTeams: TeamInfo[] = [];
