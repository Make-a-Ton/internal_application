"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "../lib/supabase";

interface AuthTeam {
    id: string;
    name: string;
    track: string;
    college: string;
}

interface AuthJudge {
    id: string;
    name: string;
}

type AuthRole = "team" | "judge" | null;

interface AuthContextType {
    team: AuthTeam | null;
    judge: AuthJudge | null;
    role: AuthRole;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (teamName: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginAsJudge: (judgeName: string, pin: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [team, setTeam] = useState<AuthTeam | null>(null);
    const [judge, setJudge] = useState<AuthJudge | null>(null);
    const [role, setRole] = useState<AuthRole>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        const storedTeam = localStorage.getItem("makeaton_team");
        const storedJudge = localStorage.getItem("makeaton_judge");
        if (storedTeam) {
            try {
                setTeam(JSON.parse(storedTeam));
                setRole("team");
            } catch {
                localStorage.removeItem("makeaton_team");
            }
        } else if (storedJudge) {
            try {
                setJudge(JSON.parse(storedJudge));
                setRole("judge");
            } catch {
                localStorage.removeItem("makeaton_judge");
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (teamName: string, password: string): Promise<{ success: boolean; error?: string }> => {
        const pin = parseInt(password, 10);
        if (isNaN(pin)) {
            return { success: false, error: "Invalid PIN format" };
        }

        const { data, error } = await supabase
            .from("team")
            .select("id, name, track, college")
            .ilike("name", teamName)
            .eq("password", pin)
            .maybeSingle();

        if (error || !data) {
            return { success: false, error: "Invalid team name or password" };
        }

        const authTeam: AuthTeam = {
            id: data.id,
            name: data.name,
            track: data.track,
            college: data.college,
        };

        setTeam(authTeam);
        setRole("team");
        localStorage.setItem("makeaton_team", JSON.stringify(authTeam));
        return { success: true };
    }, []);

    const loginAsJudge = useCallback(async (judgeName: string, pin: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch("/api/auth/judge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ judgeName, pin }),
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                return { success: false, error: result.error || "Invalid judge name or PIN" };
            }

            const authJudge: AuthJudge = {
                id: result.judge.id,
                name: result.judge.name,
            };

            setJudge(authJudge);
            setRole("judge");
            localStorage.setItem("makeaton_judge", JSON.stringify(authJudge));
            return { success: true };
        } catch {
            return { success: false, error: "Login failed. Please try again." };
        }
    }, []);

    const logout = useCallback(() => {
        setTeam(null);
        setJudge(null);
        setRole(null);
        localStorage.removeItem("makeaton_team");
        localStorage.removeItem("makeaton_judge");
    }, []);

    return (
        <AuthContext.Provider value={{
            team,
            judge,
            role,
            isAuthenticated: !!team || !!judge,
            isLoading,
            login,
            loginAsJudge,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}
