"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Flag, MessageSquare, Bell, LogOut, Gavel, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

const sidebarItems = [
    { icon: LayoutDashboard, href: "/admin", label: "Dashboard" },
    { icon: Users, href: "/admin/teams", label: "Teams" },
    { icon: Flag, href: "/admin/checkpoints", label: "Checkpoints" },
    { icon: MessageSquare, href: "/admin/requests", label: "Requests" },
    { icon: Bell, href: "/admin/notifications", label: "Notifications" },
    { icon: Gavel, href: "/admin/judges", label: "Judges" },
    { icon: Trophy, href: "/admin/leaderboard", label: "Leaderboard" },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        router.push("/");
    };

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#5C0124] text-[#F4E4BC] flex flex-col z-40">
            {/* Logo */}
            <div className="p-6 border-b border-[#7A2840]">
                <h1 className="text-3xl font-extrabold tracking-tight">MAKE-A-TON</h1>
                <p className="text-xs text-[#D4AF37] uppercase tracking-widest mt-1">Admin Panel</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/admin" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
    );
}
