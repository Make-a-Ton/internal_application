"use client";

import JudgeSidebar from "./components/JudgeSidebar";

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#5C0124] text-[#F4E4BC]" style={{ fontFamily: "var(--font-coolvetica), sans-serif" }}>
            <JudgeSidebar />
            <main className="ml-64">
                {children}
            </main>
        </div>
    );
}
