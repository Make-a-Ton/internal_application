"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";

// ============== TYPES ==============
export interface CheckpointTask {
    id: string;
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
    team: string;
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
    read?: boolean;
}

// ============== JUDGE TYPES ==============
export interface Judge {
    id: string;
    name: string;
    pin: string;
    assignedTeamIds: string[];
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
    category: string;
    members: { name: string; role: string; isCheckedIn: boolean }[];
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

// ============== INITIAL DATA ==============
const initialCheckpoints: Checkpoint[] = [
    { id: 1, number: 1, title: "Ideation", description: "Complete the required tasks and document your progress to move forward.", isLocked: false, releasedAt: "Feb 10, 2026 10:00 AM" },
    { id: 2, number: 2, title: "Checkpoint 2", description: "Complete the required tasks and document your progress to move forward.", isLocked: true },
    { id: 3, number: 3, title: "Checkpoint 3", description: "Complete the required tasks and document your progress to move forward.", isLocked: true },
];

const initialJudges: Judge[] = [
    { id: "judge-1", name: "Judge 1", pin: "1001", assignedTeamIds: [] },
    { id: "judge-2", name: "Judge 2", pin: "1002", assignedTeamIds: [] },
    { id: "judge-3", name: "Judge 3", pin: "1003", assignedTeamIds: [] },
];

export const allTeams: TeamInfo[] = [
    {
        id: "1", name: "Team Rygtus", code: "TR01", category: "GENERAL",
        projectStatus: "submitted",
        members: [
            { name: "Keerthana D S", role: "Hacker", isCheckedIn: true },
            { name: "Afnash Ali P", role: "Hacker", isCheckedIn: true },
            { name: "Sajed Hussain", role: "Hacker", isCheckedIn: true },
            { name: "Ruvais P", role: "Hacker", isCheckedIn: true },
        ],
    },
    {
        id: "2", name: "Team Alpha", code: "TA02", category: "GENERAL",
        projectStatus: "in-progress",
        members: [
            { name: "Alex Johnson", role: "Hacker", isCheckedIn: true },
            { name: "Sarah Chen", role: "Hacker", isCheckedIn: false },
            { name: "Mike Davis", role: "Hacker", isCheckedIn: true },
        ],
    },
    {
        id: "3", name: "Team Beta", code: "TB03", category: "GENERAL",
        projectStatus: "pending",
        members: [
            { name: "Emma Wilson", role: "Hacker", isCheckedIn: true },
            { name: "James Lee", role: "Hacker", isCheckedIn: true },
            { name: "Priya Patel", role: "Hacker", isCheckedIn: true },
            { name: "Tom Brown", role: "Hacker", isCheckedIn: false },
        ],
    },
    {
        id: "4", name: "Team Gamma", code: "TG04", category: "GENERAL",
        projectStatus: "in-progress",
        members: [
            { name: "Arun Kumar", role: "Hacker", isCheckedIn: true },
            { name: "Lakshmi R", role: "Hacker", isCheckedIn: true },
            { name: "Navi S", role: "Hacker", isCheckedIn: true },
        ],
    },
    {
        id: "5", name: "Team Delta", code: "TD05", category: "GENERAL",
        projectStatus: "submitted",
        members: [
            { name: "Rahul M", role: "Hacker", isCheckedIn: true },
            { name: "Sneha K", role: "Hacker", isCheckedIn: true },
            { name: "Vivek T", role: "Hacker", isCheckedIn: true },
            { name: "Divya N", role: "Hacker", isCheckedIn: true },
        ],
    },
];

// ============== STORAGE HELPERS ==============
const STORAGE_KEY = "makeaton_app_state";

interface StoredState {
    checkpoints: Checkpoint[];
    requests: HelpRequest[];
    notifications: AppNotification[];
    checkpointTasks: { [key: string]: CheckpointTask[] };
    judges: Judge[];
    scores: TeamScore[];
}

function loadState(): StoredState | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function saveState(state: StoredState) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
}

// ============== LEADERBOARD HELPER ==============
export interface LeaderboardEntry {
    teamId: string;
    teamName: string;
    avgScore: number;
    judgeCount: number;
    breakdown: { [judgeId: string]: number };
}

export function computeLeaderboard(scores: TeamScore[]): LeaderboardEntry[] {
    const teamScores: { [teamId: string]: { totals: number[]; byJudge: { [judgeId: string]: number } } } = {};

    for (const s of scores) {
        if (!teamScores[s.teamId]) teamScores[s.teamId] = { totals: [], byJudge: {} };
        teamScores[s.teamId].totals.push(s.total);
        teamScores[s.teamId].byJudge[s.judgeId] = s.total;
    }

    return Object.entries(teamScores)
        .map(([teamId, data]) => {
            const team = allTeams.find(t => t.id === teamId);
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
    checkpoints: Checkpoint[];
    requests: HelpRequest[];
    notifications: AppNotification[];
    checkpointTasks: { [key: string]: CheckpointTask[] };
    judges: Judge[];
    scores: TeamScore[];
    toggleCheckpointLock: (id: number) => void;
    addRequest: (req: Omit<HelpRequest, "id" | "timestamp" | "status" | "team">) => void;
    updateRequestStatus: (id: string, status: HelpRequest["status"]) => void;
    addNotification: (notif: Omit<AppNotification, "id" | "timestamp">) => void;
    updateCheckpointTasks: (teamId: string, checkpointId: number, tasks: CheckpointTask[]) => void;
    assignTeamToJudge: (judgeId: string, teamId: string) => void;
    unassignTeamFromJudge: (judgeId: string, teamId: string) => void;
    submitScore: (score: Omit<TeamScore, "id" | "timestamp">) => void;
}

const AppContext = createContext<AppState | null>(null);

export function useAppState() {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppState must be used within AppProvider");
    return context;
}

export function AppProvider({ children }: { children: ReactNode }) {
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(initialCheckpoints);
    const [requests, setRequests] = useState<HelpRequest[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [checkpointTasks, setCheckpointTasks] = useState<{ [key: string]: CheckpointTask[] }>({});
    const [judges, setJudges] = useState<Judge[]>(initialJudges);
    const [scores, setScores] = useState<TeamScore[]>([]);
    const hydrated = useRef(false);

    // Load from localStorage AFTER mount
    useEffect(() => {
        const stored = loadState();
        if (stored) {
            setCheckpoints(stored.checkpoints);
            setRequests(stored.requests);
            setNotifications(stored.notifications);
            setCheckpointTasks(stored.checkpointTasks);
            if (stored.judges) setJudges(stored.judges);
            if (stored.scores) setScores(stored.scores);
        }
        hydrated.current = true;
    }, []);

    // Save to localStorage whenever state changes
    useEffect(() => {
        if (!hydrated.current) return;
        saveState({ checkpoints, requests, notifications, checkpointTasks, judges, scores });
    }, [checkpoints, requests, notifications, checkpointTasks, judges, scores]);

    // Cross-tab sync
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    const s: StoredState = JSON.parse(e.newValue);
                    setCheckpoints(s.checkpoints);
                    setRequests(s.requests);
                    setNotifications(s.notifications);
                    setCheckpointTasks(s.checkpointTasks);
                    if (s.judges) setJudges(s.judges);
                    if (s.scores) setScores(s.scores);
                } catch { /* ignore */ }
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const toggleCheckpointLock = useCallback((id: number) => {
        setCheckpoints(prev => prev.map(cp =>
            cp.id === id
                ? { ...cp, isLocked: !cp.isLocked, releasedAt: cp.isLocked ? new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) : cp.releasedAt }
                : cp
        ));
    }, []);

    const addRequest = useCallback((req: Omit<HelpRequest, "id" | "timestamp" | "status" | "team">) => {
        const newReq: HelpRequest = { ...req, id: Date.now().toString(), team: "Team Rygtus", status: "pending", timestamp: new Date().toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase() };
        setRequests(prev => [newReq, ...prev]);
    }, []);

    const updateRequestStatus = useCallback((id: string, status: HelpRequest["status"]) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }, []);

    const addNotification = useCallback((notif: Omit<AppNotification, "id" | "timestamp">) => {
        const newNotif: AppNotification = { ...notif, id: Date.now().toString(), timestamp: new Date().toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true }) };
        setNotifications(prev => [newNotif, ...prev]);
    }, []);

    const updateCheckpointTasks = useCallback((teamId: string, checkpointId: number, tasks: CheckpointTask[]) => {
        const key = `${teamId}:${checkpointId}`;
        setCheckpointTasks(prev => ({ ...prev, [key]: tasks }));
    }, []);

    const assignTeamToJudge = useCallback((judgeId: string, teamId: string) => {
        setJudges(prev => prev.map(j =>
            j.id === judgeId && !j.assignedTeamIds.includes(teamId)
                ? { ...j, assignedTeamIds: [...j.assignedTeamIds, teamId] }
                : j
        ));
    }, []);

    const unassignTeamFromJudge = useCallback((judgeId: string, teamId: string) => {
        setJudges(prev => prev.map(j =>
            j.id === judgeId ? { ...j, assignedTeamIds: j.assignedTeamIds.filter(id => id !== teamId) } : j
        ));
    }, []);

    const submitScore = useCallback((score: Omit<TeamScore, "id" | "timestamp">) => {
        const newScore: TeamScore = {
            ...score,
            id: Date.now().toString(),
            timestamp: new Date().toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true }),
        };
        // Replace existing score by same judge for same team, or add new
        setScores(prev => {
            const existing = prev.findIndex(s => s.judgeId === score.judgeId && s.teamId === score.teamId);
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = newScore;
                return updated;
            }
            return [...prev, newScore];
        });
    }, []);

    return (
        <AppContext.Provider value={{
            checkpoints, requests, notifications, checkpointTasks, judges, scores,
            toggleCheckpointLock, addRequest, updateRequestStatus, addNotification,
            updateCheckpointTasks, assignTeamToJudge, unassignTeamFromJudge, submitScore,
        }}>
            {children}
        </AppContext.Provider>
    );
}
