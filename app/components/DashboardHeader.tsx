"use client";

import { useState } from "react";
import { Bell, UserCircle } from "lucide-react";
import Link from "next/link";
import NotificationsModal from "./NotificationsModal";
import { useAppState } from "../context/AppContext";

export default function DashboardHeader() {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const { notifications } = useAppState();

    // Map AppNotification to the format NotificationsModal expects
    const modalNotifications = notifications.map(n => ({
        id: n.id,
        title: n.title,
        description: n.description,
        url: n.url,
        timestamp: n.timestamp,
        priority: n.priority as "high" | "normal" | undefined,
        read: n.read,
    }));

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-[#5C0124] border-b border-[#7A2840] px-4 md:px-6 py-3 flex items-center justify-between">
                <Link href="/dashboard" className="text-lg font-bold text-[#D4AF37] tracking-tight">
                    Team Dashboard
                </Link>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsNotificationsOpen(true)}
                        className="relative p-2 text-[#C09B6E] hover:text-[#F4E4BC] hover:bg-[#7A2840] rounded-full transition-colors"
                    >
                        <Bell className="h-5 w-5" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                        )}
                    </button>
                    <Link
                        href="/dashboard/team"
                        className="p-1 rounded-full bg-[#7A2840] text-[#F4E4BC] hover:opacity-90 transition-opacity"
                    >
                        <UserCircle className="h-7 w-7" />
                    </Link>
                </div>
            </header>

            <NotificationsModal
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={modalNotifications}
            />
        </>
    );
}
