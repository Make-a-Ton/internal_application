"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, ArrowRight } from "lucide-react";

export interface Notification {
    id: string;
    title: string;
    description?: string;
    url?: string;
    timestamp: string;
    priority?: "high" | "normal";
    read?: boolean;
}

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
}

export default function NotificationsModal({ isOpen, onClose, notifications }: NotificationsModalProps) {
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
        typeof window !== "undefined" && "Notification" in window
            ? Notification.permission
            : "default"
    );
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleRequestPermission = async () => {
        if (typeof window !== "undefined" && "Notification" in window) {
            try {
                const permission = await Notification.requestPermission();
                setNotificationPermission(permission);
                if (permission === "granted") {
                    new Notification("Notifications Enabled!", {
                        body: "You'll now receive updates from Makeaton.",
                        icon: "/favicon.ico"
                    });
                }
            } catch (error) {
                console.error("Error requesting notification permission:", error);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 z-40"
                        onClick={onClose}
                    />

                    {/* Sidebar Panel - Right Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-50 bg-[#5C0124] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-[#7A2840] flex-shrink-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-[#F4E4BC]">Notifications</h2>
                                    <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mt-1">
                                        {unreadCount === 0 ? "All Caught Up" : `${unreadCount} New`}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-[#C09B6E] hover:text-[#F4E4BC] hover:bg-[#7A2840] rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center">
                                    <Bell className="h-12 w-12 text-[#7A2840] mx-auto mb-3" />
                                    <p className="text-sm text-[#C09B6E]">No notifications yet</p>
                                    <p className="text-xs text-[#C09B6E]/50 mt-1">Notifications from admins will appear here</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#7A2840]/50">
                                    {notifications.map((notification, index) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="p-5 hover:bg-[#7A2840]/30 transition-colors cursor-pointer"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-[#F4E4BC] mb-1">
                                                    {notification.title}
                                                </h3>
                                                {notification.description && (
                                                    <p className="text-sm text-[#C09B6E] line-clamp-2 mb-2">
                                                        {notification.description}
                                                    </p>
                                                )}
                                                {notification.url && (
                                                    <p className="text-sm text-[#D4AF37] truncate mb-2">
                                                        {notification.url}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-[#C09B6E]/50">
                                                        {notification.timestamp}
                                                    </span>
                                                    {notification.priority === "high" && (
                                                        <span className="text-xs font-bold text-[#D4AF37] uppercase">
                                                            High
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* View Full History */}
                        {notifications.length > 0 && (
                            <div className="p-4 border-t border-[#7A2840] flex-shrink-0">
                                <button className="w-full text-center text-sm font-semibold text-[#D4AF37] hover:text-[#F4E4BC] flex items-center justify-center gap-2">
                                    View Full History
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {/* Get Notified Banner */}
                        {notificationPermission !== "granted" && (
                            <div className="p-4 bg-[#3A0015] flex items-center justify-between flex-shrink-0">
                                <span className="text-sm font-medium text-[#F4E4BC]">Get Notified?</span>
                                <button
                                    onClick={handleRequestPermission}
                                    className="px-4 py-2 bg-[#D4AF37] text-[#3A0015] text-sm font-bold rounded-full hover:bg-[#C09B6E] transition-colors"
                                >
                                    Allow
                                </button>
                            </div>
                        )}

                        {/* Permission Granted State */}
                        {notificationPermission === "granted" && (
                            <div className="p-4 bg-green-900/50 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-green-400">✓ Notifications Enabled</span>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
