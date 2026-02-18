"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import AdminSidebar from "./components/AdminSidebar";
import AdminLogin from "./components/AdminLogin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        // Check session storage on mount
        const auth = sessionStorage.getItem("admin_auth");
        setIsAuthenticated(auth === "true");
    }, []);

    // Show loading or nothing while checking auth
    if (isAuthenticated === null) return null;

    if (!isAuthenticated) {
        return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
    }

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

            <main className="md:ml-64 bg-white text-[#3A0015] min-h-screen relative overflow-hidden">
                {/* Full-size pattern background */}
                <div
                    className="fixed inset-0 pointer-events-none z-0"
                    style={{
                        backgroundImage: "url('/pattern.svg')",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        opacity: 0.04,
                    }}
                />
                <div className="relative z-10 p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
