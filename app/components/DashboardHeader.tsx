"use client";

import { Bell, UserCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardHeader() {
    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between">
            <Link href="/dashboard" className="text-lg font-bold text-gray-900 tracking-tight">
                Team Dashboard
            </Link>

            <div className="flex items-center gap-3">
                <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="p-1 rounded-full bg-burgundy text-gold-light hover:opacity-90 transition-opacity">
                    <UserCircle className="h-7 w-7" />
                </button>
            </div>
        </header>
    );
}
