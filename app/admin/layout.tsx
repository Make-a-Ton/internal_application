"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#5C0124] text-[#F4E4BC]">
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Mobile Header with Hamburger */}
            <div className="sticky top-0 z-20 bg-[#5C0124] border-b border-[#7A2840] px-4 py-3 flex items-center gap-3 md:hidden">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-[#7A2840] rounded-lg transition-colors"
                >
                    <Menu className="h-6 w-6 text-[#D4AF37]" />
                </button>
                <h1 className="text-lg font-extrabold text-[#F4E4BC]">MAKE-A-TON</h1>
            </div>

            <main className="md:ml-64">
                {children}
            </main>
        </div>
    );
}
