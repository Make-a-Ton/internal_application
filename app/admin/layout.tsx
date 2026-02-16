"use client";

import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#5C0124] text-[#F4E4BC]">
            <AdminSidebar />
            <main className="ml-64 bg-white text-[#3A0015] min-h-screen relative overflow-hidden">
                {/* Full-size pattern background */}
                <div
                    className="fixed inset-0 ml-64 pointer-events-none z-0"
                    style={{
                        backgroundImage: "url('/pattern.svg')",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        opacity: 0.04,
                    }}
                />
                <div className="relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
