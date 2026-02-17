"use client";

import { Home, List, Flag, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { icon: Home, href: "/dashboard", label: "Home" },
    { icon: List, href: "/dashboard/requests", label: "Requests" },
    { icon: Flag, href: "/dashboard/checkpoints", label: "Checkpoints" },
    { icon: Calendar, href: "/dashboard/schedule", label: "Schedule" },
    { icon: Users, href: "/dashboard/team", label: "Team" },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#3A0015] rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl border border-[#5C0124]/30 backdrop-blur-md">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`p-3 rounded-full transition-all duration-200 ${isActive
                            ? "bg-[#D4AF37] text-[#3A0015] shadow-lg"
                            : "text-[#C09B6E] hover:text-[#E7BB88] hover:bg-[#5C0124]"
                            }`}
                        title={item.label}
                    >
                        <item.icon className="h-5 w-5" />
                    </Link>
                );
            })}
        </nav>
    );
}
