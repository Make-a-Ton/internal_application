"use client";

import BottomNav from "../components/BottomNav";
import AuthGuard from "../components/AuthGuard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#FDF8F0] font-sans text-[#3A0015] relative overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#3A0015]">

                {/* Full-size pattern background */}
                <div
                    className="fixed inset-0 pointer-events-none z-0"
                    style={{
                        backgroundImage: "url('/pattern.svg')",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        opacity: 0.05,
                    }}
                />

                <div className="relative z-10 pb-24">
                    {children}
                </div>

                <div className="relative z-20">
                    <BottomNav />
                </div>

            </div>
        </AuthGuard>
    );
}
