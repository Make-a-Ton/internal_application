"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#5C0124] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#5C0124] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
