"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ClipboardCheck, Trophy, LogOut, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const sidebarItems = [
    { icon: LayoutDashboard, href: "/judge", label: "My Teams" },
    { icon: ClipboardCheck, href: "/judge/scoring", label: "Scoring" },
    { icon: Trophy, href: "/judge/leaderboard", label: "Leaderboard" },
];

interface JudgeSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function JudgeSidebar({ isOpen, onClose }: JudgeSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { judge, logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <>
            {/* Backdrop (mobile only) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 bottom-0 w-64 bg-[#5C0124] text-[#F4E4BC] flex flex-col z-40 transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0`}
            >
                {/* Logo + Close Button */}
                <div className="p-6 border-b border-[#7A2840] flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">MAKE-A-TON</h1>
                        <p className="text-xs text-[#D4AF37] uppercase tracking-widest mt-1">Judge Panel — {judge?.name || "Judge"}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[#7A2840] rounded-lg transition-colors md:hidden"
                    >
                        <X className="h-5 w-5 text-[#C09B6E]" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/judge" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${isActive
                                    ? "bg-[#7A2840] text-[#F4E4BC] border-r-2 border-[#D4AF37]"
                                    : "text-[#C09B6E] hover:text-[#F4E4BC] hover:bg-[#7A2840]/50"
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-[#7A2840]">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-[#C09B6E] hover:text-red-300 hover:bg-[#7A2840]/50 rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
