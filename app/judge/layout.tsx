"use client";

import JudgeSidebar from "./components/JudgeSidebar";

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "var(--font-roboto-condensed), sans-serif" }}>
            <JudgeSidebar />
            <main className="ml-64">
                {children}
            </main>
        </div>
    );
}
