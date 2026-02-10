"use client";

import { useState } from "react";
import { Bell, UserCircle } from "lucide-react";
import Link from "next/link";
import NotificationsModal, { Notification } from "./NotificationsModal";

// Sample notifications - will be replaced with data from admin dashboard later
const sampleNotifications: Notification[] = [
    {
        id: "1",
        title: "PPT Template",
        url: "https://tinyurl.com/bh07-ppt",
        timestamp: "9 days ago",
        priority: "high",
    },
    {
        id: "2",
        title: "Checkpoint 3 (final) will begin on 11:30PM.",
        description: "Teams should update the review status for Checkpoint 2 in Checkpoint 3, include any...",
        timestamp: "9 days ago",
        priority: "high",
    },
    {
        id: "3",
        title: "Tea and Snacks available at the food counter",
        description: "Participants may go and have them.",
        timestamp: "9 days ago",
    },
    {
        id: "4",
        title: "Inventory Items Added!!",
        description: "Participants can order items from the inventory until 5:00 PM, after which the...",
        timestamp: "9 days ago",
    },
    {
        id: "5",
        title: "Food inventory is open till 5:00PM",
        description: "Participants can order snacks & drinks via platform until 5:00PM",
        timestamp: "9 days ago",
    },
    {
        id: "6",
        title: "Checkpoint 3 will be happening on 6:00PM",
        description: "Participants should update the review, extra and plan of checkpoint 2.",
        timestamp: "9 days ago",
        priority: "high",
    },
    {
        id: "7",
        title: "Lunch Active!",
        description: "Lunch is being provided near the stage.",
        timestamp: "9 days ago",
        priority: "high",
    },
    {
        id: "8",
        title: "Take a break, enjoy games.",
        description: "Small gaming session arranged infront of gate, you guys can come and enjoy!!",
        timestamp: "9 days ago",
    },
];

export default function DashboardHeader() {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // For now using sample data - will be empty initially in production
    const [notifications] = useState<Notification[]>([]);

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between">
                <Link href="/dashboard" className="text-lg font-bold text-gray-900 tracking-tight">
                    Team Dashboard
                </Link>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsNotificationsOpen(true)}
                        className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Bell className="h-5 w-5" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                        )}
                    </button>
                    <Link
                        href="/dashboard/team"
                        className="p-1 rounded-full bg-burgundy text-gold-light hover:opacity-90 transition-opacity"
                    >
                        <UserCircle className="h-7 w-7" />
                    </Link>
                </div>
            </header>

            <NotificationsModal
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
            />
        </>
    );
}
