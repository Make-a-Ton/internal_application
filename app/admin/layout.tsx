"use client";

import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#5C0124] text-[#F4E4BC]">
            <AdminSidebar />
            <main className="ml-64">
                {children}
            </main>
        </div>
    );
}
