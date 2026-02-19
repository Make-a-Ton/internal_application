"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { CHECKPOINT_DEFINITIONS, CheckpointDefinition } from "../config/checkpoints";

// ============== TYPES ==============
export interface TeamCheckpointStatus {
    id: string;
    teamId: string;
    check_1: 'locked' | 'pending' | 'finished';
    check_2: 'locked' | 'pending' | 'finished';
    check_3: 'locked' | 'pending' | 'finished';
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
    mentorId?: string;
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

export interface Mentor {
    id: string;
    name: string;
    domain: string;
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
    teamCheckpointStatuses: TeamCheckpointStatus[];
    checkpointDefinitions: CheckpointDefinition[];
    requests: HelpRequest[];
    notifications: AppNotification[];
    judges: Judge[];
    scores: TeamScore[];
    mentors: Mentor[];
    addRequest: (req: Omit<HelpRequest, "id" | "timestamp" | "status" | "team"> & { teamId?: string; mentorId?: string }) => Promise<void>;
    updateRequestStatus: (id: string, status: HelpRequest["status"]) => Promise<void>;
    addNotification: (notif: Omit<AppNotification, "id" | "timestamp">) => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    updateNotification: (id: string, updates: Partial<Omit<AppNotification, "id" | "timestamp">>) => Promise<void>;
    assignTeamToJudge: (judgeId: string, teamId: string) => Promise<void>;
    unassignTeamFromJudge: (judgeId: string, teamId: string) => Promise<void>;
    submitScore: (score: Omit<TeamScore, "id" | "timestamp">) => Promise<void>;
    addMentor: (mentor: Omit<Mentor, "id">) => Promise<void>;
    deleteMentor: (id: string) => Promise<void>;
    updateCheckpointStatus: (teamId: string, checkpointNumber: 1 | 2 | 3, status: 'locked' | 'pending' | 'finished') => Promise<void>;
    unlockCheckpointGlobally: (checkpointNumber: 1 | 2 | 3) => Promise<void>;
    lockCheckpointGlobally: (checkpointNumber: 1 | 2 | 3) => Promise<void>;
    globalCheckpointStatus: TeamCheckpointStatus | null;
}

const AppContext = createContext<AppState | null>(null);

export function useAppState() {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppState must be used within AppProvider");
    return context;
}

export function AppProvider({ children }: { children: ReactNode }) {
    const [teams, setTeams] = useState<TeamInfo[]>([]);
    const [teamCheckpointStatuses, setTeamCheckpointStatuses] = useState<TeamCheckpointStatus[]>([]);
    const [requests, setRequests] = useState<HelpRequest[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [judges, setJudges] = useState<Judge[]>([]);
    const [scores, setScores] = useState<TeamScore[]>([]);
    const [mentors, setMentors] = useState<Mentor[]>([]);

    const [globalCheckpointStatus, setGlobalCheckpointStatus] = useState<TeamCheckpointStatus | null>(null);

    const fetchData = async () => {
        // 1. Teams & Members
        const { data: teamsData, error: teamsError } = await supabase.from('team').select('*');
        if (teamsError) {
            console.error("Error fetching teams (FULL):", JSON.stringify(teamsError, null, 2));
            console.error("Error fetching teams (MSG):", teamsError.message);
            console.error("Error fetching teams (DETAILS):", teamsError.details);
            console.error("Error fetching teams (HINT):", teamsError.hint);
        }
        const { data: membersData, error: membersError } = await supabase.from('member').select('*');
        if (membersError) console.error("Error fetching members:", membersError);

        if (teamsData) {
            const formattedTeams: TeamInfo[] = teamsData.map(t => ({
                id: t.id,
                name: t.name,
                code: String(t.password || ''),
                college: t.college || 'Unknown',
                category: t.track || 'general',
                projectStatus: (t.problem_stat ? 'submitted' : 'pending') as any,
                members: membersData?.filter(m => m.team_id === t.id).map(m => ({
                    name: m.name,
                    role: 'HACKER',
                    isCheckedIn: m.checkin ?? false,
                    food_pref: m.food
                })) || []
            }));
            setTeams(formattedTeams);
        }

        // 2. Checkpoints (New Schema)
        const { data: cpData, error: cpError } = await supabase.from('checkpoints').select('*');
        if (cpError) console.error("Error fetching checkpoints:", cpError);
        if (cpData) {
            // Seperate Global Row (team_id is null)
            const globalRow = cpData.find(c => c.team_id === null);
            if (globalRow) {
                setGlobalCheckpointStatus({
                    id: globalRow.id,
                    teamId: 'GLOBAL',
                    check_1: globalRow.check_1,
                    check_2: globalRow.check_2,
                    check_3: globalRow.check_3
                });
            } else {
                setGlobalCheckpointStatus(null);
            }

            // Set Team Statuses (filter out global row)
            setTeamCheckpointStatuses(cpData.filter(c => c.team_id !== null).map(c => ({
                id: c.id,
                teamId: c.team_id,
                check_1: c.check_1,
                check_2: c.check_2,
                check_3: c.check_3
            })));
        }

        // 3. Judges & Assignments
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

        // 4. Help Requests (Joined with Teams for name)
        const { data: reqData, error: reqError } = await supabase.from('help_requests').select('*, team(name)').order('created_at', { ascending: false });
        if (reqError) console.error("Error fetching requests:", reqError);
        if (reqData) {
            setRequests(reqData.map(r => ({
                id: r.id,
                team: (r.team as any)?.name || "Unknown Team",
                teamId: r.team_id,
                category: r.category,
                urgency: r.urgency || "normal",
                message: r.message,
                description: r.description || "",
                status: r.status || "pending",
                mentorId: r.mentor_id,
                timestamp: new Date(r.created_at).toLocaleString()
            })));
        }

        // 5. Notifications
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

        // 6. Scores
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

        // 7. Mentors
        const { data: mentorData, error: mentorError } = await supabase.from('mentor').select('*');
        if (mentorError) console.error("Error fetching mentors:", mentorError);
        if (mentorData) {
            setMentors(mentorData.map(m => ({
                id: m.id || String(Math.random()),
                name: m.name || "Unknown",
                domain: m.domain || "N/A"
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

    const addRequest = useCallback(async (req: Omit<HelpRequest, "id" | "timestamp" | "status" | "team"> & { teamId?: string }) => {
        if (!req.teamId) {
            console.error("Missing teamId for help request");
            alert("Error: Team ID not found. Please re-login.");
            return;
        }

        try {
            const { error } = await supabase.from('help_requests').insert({
                team_id: req.teamId,
                category: req.category,
                urgency: req.urgency,
                message: req.message,
                description: req.description,
                mentor_id: req.mentorId,
                status: 'pending'
            });

            if (error) {
                console.error("Supabase error adding request:", error);
                alert(`Failed to send request: ${JSON.stringify(error, null, 2)}`);
                throw error;
            }

            console.log("Help request added successfully");
        } catch (err) {
            console.error("Unexpected error in addRequest:", err);
            alert(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
        }
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

    const deleteNotification = useCallback(async (id: string) => {
        await supabase.from('notifications').delete().eq('id', id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const updateNotification = useCallback(async (id: string, updates: Partial<Omit<AppNotification, "id" | "timestamp">>) => {
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.url !== undefined) dbUpdates.url = updates.url;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        await supabase.from('notifications').update(dbUpdates).eq('id', id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
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

    const addMentor = useCallback(async (mentor: Omit<Mentor, "id">) => {
        await supabase.from('mentor').insert(mentor);
    }, []);

    const deleteMentor = useCallback(async (id: string) => {
        await supabase.from('mentor').delete().eq('id', id);
        setMentors(prev => prev.filter(m => m.id !== id));
    }, []);

    const updateCheckpointStatus = useCallback(async (teamId: string, checkpointNumber: 1 | 2 | 3, status: 'locked' | 'pending' | 'finished') => {
        const column = `check_${checkpointNumber}`;

        // Check if row exists
        const { data } = await supabase.from('checkpoints').select('id').eq('team_id', teamId).single();

        if (data) {
            // Update
            await supabase.from('checkpoints').update({ [column]: status }).eq('team_id', teamId);
        } else {
            // Create
            const newRow = {
                team_id: teamId,
                check_1: 'locked',
                check_2: 'locked',
                check_3: 'locked',
                [column]: status
            };
            await supabase.from('checkpoints').insert(newRow);
        }

        // Optimistic update
        setTeamCheckpointStatuses(prev => {
            const existing = prev.find(p => p.teamId === teamId);
            if (existing) {
                return prev.map(p => p.teamId === teamId ? { ...p, [column]: status } : p);
            } else {
                return [...prev, {
                    id: 'optimistic-' + Math.random(),
                    teamId: teamId,
                    check_1: checkpointNumber === 1 ? status : 'locked',
                    check_2: checkpointNumber === 2 ? status : 'locked',
                    check_3: checkpointNumber === 3 ? status : 'locked',
                } as TeamCheckpointStatus];
            }
        });
    }, []);

    const unlockCheckpointGlobally = useCallback(async (checkpointNumber: 1 | 2 | 3) => {
        const column = `check_${checkpointNumber}`;

        // 1. Update Global Row to 'pending' (Open)
        const { data: globalRow } = await supabase.from('checkpoints').select('id').is('team_id', null).single();

        if (globalRow) {
            await supabase.from('checkpoints').update({ [column]: 'pending' }).eq('id', globalRow.id);
        } else {
            // Create Global Row if it doesn't exist
            await supabase.from('checkpoints').insert({
                team_id: null,
                check_1: checkpointNumber === 1 ? 'pending' : 'locked',
                check_2: checkpointNumber === 2 ? 'pending' : 'locked',
                check_3: checkpointNumber === 3 ? 'pending' : 'locked'
            });
        }

        // Update local state for global
        setGlobalCheckpointStatus(prev => ({
            id: prev?.id || 'virtual-global',
            teamId: 'GLOBAL',
            check_1: checkpointNumber === 1 ? 'pending' : prev?.check_1 || 'locked',
            check_2: checkpointNumber === 2 ? 'pending' : prev?.check_2 || 'locked',
            check_3: checkpointNumber === 3 ? 'pending' : prev?.check_3 || 'locked',
        }));


        // 2. Ensuring all teams have at least a row and are set to 'pending' if they were 'locked'
        //    WE DO NOT OVERWRITE 'finished'.
        //    Actually, if we are "Unlocking", we basically just want to make sure everyone CAN submit.
        //    So we ensure they have a row.

        const updates: any[] = [];
        const inserts: any[] = [];

        teams.forEach(team => {
            const existing = teamCheckpointStatuses.find(s => s.teamId === team.id);
            const isRealRow = existing && existing.id && !existing.id.toString().startsWith('optimistic') && existing.id !== 'virtual';

            if (!isRealRow) {
                inserts.push({
                    team_id: team.id,
                    check_1: checkpointNumber === 1 ? 'pending' : 'locked',
                    check_2: checkpointNumber === 2 ? 'pending' : 'locked',
                    check_3: checkpointNumber === 3 ? 'pending' : 'locked',
                });
            } else {
                // If it exists, we ONLY update if it's currently 'locked'. 
                // If it's 'finished', we leave it. If it's 'pending', we leave it.
                if (existing?.[column as keyof TeamCheckpointStatus] === 'locked') {
                    updates.push({
                        id: existing!.id,
                        [column]: 'pending'
                    });
                }
            }
        });

        const promises = [];
        if (updates.length > 0) promises.push(supabase.from('checkpoints').upsert(updates));
        if (inserts.length > 0) promises.push(supabase.from('checkpoints').insert(inserts));

        await Promise.all(promises);

        // Optimistic Update Teams
        setTeamCheckpointStatuses(prev => {
            const newStatuses = [...prev];
            teams.forEach(t => {
                const idx = newStatuses.findIndex(s => s.teamId === t.id);
                if (idx >= 0) {
                    // Only update if locked
                    if (newStatuses[idx][column as keyof TeamCheckpointStatus] === 'locked') {
                        newStatuses[idx] = { ...newStatuses[idx], [column]: 'pending' };
                    }
                } else {
                    newStatuses.push({
                        id: 'optimistic-global-' + Math.random(),
                        teamId: t.id,
                        check_1: checkpointNumber === 1 ? 'pending' : 'locked',
                        check_2: checkpointNumber === 2 ? 'pending' : 'locked',
                        check_3: checkpointNumber === 3 ? 'pending' : 'locked',
                    } as TeamCheckpointStatus);
                }
            });
            return newStatuses;
        });

    }, [teams, teamCheckpointStatuses]);

    const lockCheckpointGlobally = useCallback(async (checkpointNumber: 1 | 2 | 3) => {
        const column = `check_${checkpointNumber}`;

        // ONLY Update Global Row to 'locked' (Closed)
        // Do NOT touch team rows.

        const { data: globalRow } = await supabase.from('checkpoints').select('id').is('team_id', null).single();
        if (globalRow) {
            await supabase.from('checkpoints').update({ [column]: 'locked' }).eq('id', globalRow.id);
        } else {
            await supabase.from('checkpoints').insert({
                team_id: null,
                check_1: checkpointNumber === 1 ? 'locked' : 'locked',
                check_2: checkpointNumber === 2 ? 'locked' : 'locked',
                check_3: checkpointNumber === 3 ? 'locked' : 'locked'
            });
        }

        // Update local state for global
        setGlobalCheckpointStatus(prev => ({
            id: prev?.id || 'virtual-global',
            teamId: 'GLOBAL',
            check_1: checkpointNumber === 1 ? 'locked' : prev?.check_1 || 'locked',
            check_2: checkpointNumber === 2 ? 'locked' : prev?.check_2 || 'locked',
            check_3: checkpointNumber === 3 ? 'locked' : prev?.check_3 || 'locked',
        }));

        // No changes to teamCheckpointStatuses needed!

    }, []);

    return (
        <AppContext.Provider value={{
            teams, teamCheckpointStatuses, checkpointDefinitions: CHECKPOINT_DEFINITIONS, requests, notifications, judges, scores, mentors,
            addRequest, updateRequestStatus, addNotification, deleteNotification, updateNotification,
            assignTeamToJudge, unassignTeamFromJudge, submitScore,
            addMentor, deleteMentor, updateCheckpointStatus, unlockCheckpointGlobally, lockCheckpointGlobally, globalCheckpointStatus
        }}>
            {children}
        </AppContext.Provider>
    );
}

