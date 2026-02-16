"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Bell } from "lucide-react";
import { useAppState } from "../../context/AppContext";

export default function AdminNotificationsPage() {
    const { notifications, addNotification } = useAppState();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");
    const [priority, setPriority] = useState<"high" | "normal">("normal");
    const [isSending, setIsSending] = useState(false);

    const handleSend = () => {
        if (!title.trim()) return;
        setIsSending(true);

        setTimeout(() => {
            addNotification({ title: title.trim(), description: description.trim() || undefined, url: url.trim() || undefined, priority });
            setTitle("");
            setDescription("");
            setUrl("");
            setPriority("normal");
            setIsSending(false);
        }, 500);
    };

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#5C0124]">Notifications</h1>
                <p className="text-[#8B6F4E] mt-1">Send announcements to all participants</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Send Notification Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#7A2840]/50 rounded-2xl border border-[#7A2840] p-6"
                >
                    <h2 className="text-lg font-bold text-[#3A0015] mb-6">New Notification</h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-[#5C0124] mb-2">Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Checkpoint 3 will begin at 6:00PM"
                                className="w-full px-4 py-3 bg-[#5C0124] border border-[#7A2840] rounded-xl text-sm text-[#F4E4BC] placeholder:text-[#F4E4BC]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#5C0124] mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add more details..."
                                rows={3}
                                className="w-full px-4 py-3 bg-[#5C0124] border border-[#7A2840] rounded-xl text-sm text-[#F4E4BC] placeholder:text-[#F4E4BC]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#5C0124] mb-2">URL (optional)</label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-4 py-3 bg-[#5C0124] border border-[#7A2840] rounded-xl text-sm text-[#F4E4BC] placeholder:text-[#F4E4BC]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#5C0124] mb-2">Priority</label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPriority("normal")}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${priority === "normal"
                                        ? "bg-[#5C0124] text-[#F4E4BC] border border-[#D4AF37]"
                                        : "bg-[#5C0124]/50 text-[#C09B6E] border border-[#7A2840] hover:bg-[#5C0124]/70"
                                        }`}
                                >
                                    Normal
                                </button>
                                <button
                                    onClick={() => setPriority("high")}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${priority === "high"
                                        ? "bg-[#D4AF37] text-[#3A0015]"
                                        : "bg-[#5C0124]/50 text-[#C09B6E] border border-[#7A2840] hover:bg-[#5C0124]/70"
                                        }`}
                                >
                                    🔥 High
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!title.trim() || isSending}
                            className="w-full bg-[#D4AF37] hover:bg-[#C09B6E] disabled:bg-[#7A2840]/50 disabled:text-[#C09B6E] text-[#3A0015] font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <Send className="h-4 w-4" />
                            {isSending ? "Sending..." : "Send to All Participants"}
                        </button>
                    </div>
                </motion.div>

                {/* Sent History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#7A2840]/50 rounded-2xl border border-[#7A2840] overflow-hidden"
                >
                    <div className="p-6 border-b border-[#7A2840]">
                        <h2 className="text-lg font-bold text-[#3A0015]">Sent History</h2>
                        <p className="text-sm text-[#3A0015]/60 mt-1">{notifications.length} notifications sent</p>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="p-10 text-center">
                            <Bell className="h-12 w-12 text-[#7A2840] mx-auto mb-3" />
                            <p className="text-sm text-[#3A0015]/50">No notifications sent yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#7A2840]/50 max-h-[500px] overflow-y-auto">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="p-5">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-bold text-[#3A0015]">{notif.title}</h3>
                                        {notif.priority === "high" && (
                                            <span className="px-2 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold rounded-full">
                                                HIGH
                                            </span>
                                        )}
                                    </div>
                                    {notif.description && <p className="text-sm text-[#3A0015]/70 mt-1">{notif.description}</p>}
                                    {notif.url && <p className="text-sm text-[#5C0124] mt-1 truncate">{notif.url}</p>}
                                    <p className="text-xs text-[#3A0015]/40 mt-2">{notif.timestamp}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
