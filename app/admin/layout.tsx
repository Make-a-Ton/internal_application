"use client";

import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "var(--font-roboto-condensed), sans-serif" }}>
            <AdminSidebar />
            <main className="ml-64">
                {children}
            </main>
        </div>
    );
}
