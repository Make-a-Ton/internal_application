"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Bell, Settings, Zap, UtensilsCrossed, Upload, Image,
    ChevronRight, Clock, CheckCircle2, AlertCircle
} from "lucide-react";
import DashboardHeader from "../components/DashboardHeader";
import BottomNav from "../components/BottomNav";
import GetHelpModal from "../components/GetHelpModal";
import OrderItemsModal from "../components/OrderItemsModal";
import GalleryModal from "../components/GalleryModal";

// Sample Data
const teamMembers = [
    { name: "Keerthana D S", pref: "Non-Vegetarian", breakfast: true, lunch: true, dinner: false },
    { name: "Afnash Ali P", pref: "Non-Vegetarian", breakfast: true, lunch: true, dinner: false },
    { name: "Sajed Hussain", pref: "N/A", breakfast: false, lunch: true, dinner: false },
    { name: "Ruvais P", pref: "Non-Vegetarian", breakfast: true, lunch: true, dinner: false },
];

const recentActivity = [
    { type: "Infrastructure", message: "[CRITICAL] Our fan gone.", time: "08:34 PM" },
    { type: "Infrastructure", message: "[CRITICAL] We need a fan... 😂😭😭", time: "03:48 PM" },
];

export default function DashboardPage() {
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-24">
            <DashboardHeader />
            <GetHelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
            <OrderItemsModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} />
            <GalleryModal isOpen={isGalleryModalOpen} onClose={() => setIsGalleryModalOpen(false)} />

            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative bg-gradient-to-br from-burgundy via-burgundy-light to-black text-gold-light p-6 md:p-8 mx-4 mt-4 rounded-2xl overflow-hidden shadow-xl"
            >
                {/* Background Gear */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] right-[-10%] text-gold-dark/10 pointer-events-none"
                >
                    <Settings size={200} />
                </motion.div>

                <span className="inline-block px-3 py-1 bg-lime-400 text-black text-xs font-bold rounded-full mb-4">
                    🎯 TEAM DASHBOARD
                </span>

                <p className="text-gold-medium text-sm font-semibold tracking-widest mb-2">HACKATHON ENDS IN</p>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Event Ended</h1>

                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs text-gold-dark uppercase tracking-wider">Team Name</p>
                        <p className="text-xl font-bold text-gold-light">Team Rygtus</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gold-dark uppercase tracking-wider">Current Phase</p>
                        <p className="text-xl font-bold text-gold-light">Judgement <span className="text-gold-medium">Phase</span></p>
                    </div>
                </div>
            </motion.section>

            {/* Announcements */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mx-4 mt-6"
            >
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Announcements</h2>
                    <button className="text-sm text-blue-600 font-semibold hover:underline">View All</button>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center text-gray-400">
                    <Bell className="mx-auto h-10 w-10 mb-2 opacity-30" />
                    <p className="text-sm">No new announcements</p>
                    <p className="text-xs opacity-50">Stay tuned for updates</p>
                </div>
            </motion.section>

            {/* Selected Problem */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mx-4 mt-6"
            >
                <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-2xl overflow-hidden">
                    <span className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-lime-400 text-black text-xs font-bold rounded-full">
                        SELECTED PROBLEM
                    </span>
                    <h3 className="text-lg md:text-xl font-bold mt-6 text-center">CLOUD-NATIVE & DEVOPS INTELLIGENCE CHALLENGE</h3>
                    <p className="text-xs text-gray-400 mt-3 text-center leading-relaxed">
                        Focus: Telemetry Intelligence, Change Impact Correlation & Proactive Reliability.
                        Audience: DevOps Engineers, Site Reliability Engineers, Platform Engineers, Cloud Architects, AI/ML Engineers...
                    </p>
                    {/* Background Text */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <span className="text-[6rem] md:text-[8rem] font-black tracking-tighter">INTELLIGENCE</span>
                    </div>
                </div>
            </motion.section>

            {/* Services */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mx-4 mt-6"
            >
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Services</h2>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setIsHelpModalOpen(true)}
                        className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left cursor-pointer"
                    >
                        <div className="bg-gray-100 p-2 rounded-lg w-fit mb-3">
                            <Zap className="h-5 w-5 text-gray-600" />
                        </div>
                        <p className="font-bold text-gray-900">Technical</p>
                        <p className="font-bold text-gray-900">Support</p>
                    </button>
                    <button
                        onClick={() => setIsOrderModalOpen(true)}
                        className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left cursor-pointer"
                    >
                        <div className="bg-lime-400 p-2 rounded-lg w-fit mb-3">
                            <UtensilsCrossed className="h-5 w-5 text-black" />
                        </div>
                        <p className="font-bold text-gray-900">Food &</p>
                        <p className="font-bold text-gray-900">Drinks</p>
                    </button>
                </div>
            </motion.section>

            {/* Submit Project */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mx-4 mt-6"
            >
                <div className="bg-lime-400 text-black p-5 rounded-2xl flex items-center justify-between shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                            <span className="h-2 w-2 bg-black rounded-full animate-pulse"></span> Action Required
                        </p>
                        <h3 className="text-xl font-extrabold mt-1">Submit Project</h3>
                        <p className="text-xs opacity-70">Upload repo & details</p>
                    </div>
                    <Upload className="h-6 w-6" />
                </div>
            </motion.section>

            {/* Shared Gallery */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mx-4 mt-6"
            >
                <button
                    onClick={() => setIsGalleryModalOpen(true)}
                    className="w-full bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="text-left">
                        <h3 className="font-bold text-gray-900">Shared Gallery</h3>
                        <p className="text-xs text-gray-400">View & upload event photos</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
                <div
                    onClick={() => setIsGalleryModalOpen(true)}
                    className="bg-gray-100 rounded-xl p-8 mt-3 flex items-center justify-center border border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                    <Image className="h-10 w-10 text-gray-300" />
                </div>
            </motion.section>

            {/* Food Coupons */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mx-4 mt-6"
            >
                <h2 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4" /> Food Coupons
                </h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="p-3 text-left">Participant</th>
                                <th className="p-3 text-left">Pref</th>
                                <th className="p-3 text-center">Breakfast</th>
                                <th className="p-3 text-center">Lunch</th>
                                <th className="p-3 text-center">Dinner</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamMembers.map((member, idx) => (
                                <tr key={idx} className="border-t border-gray-50 hover:bg-gray-50/50">
                                    <td className="p-3">
                                        <p className="font-semibold text-gray-900">{member.name}</p>
                                        <p className="text-xs text-green-600">✓ Checked-in</p>
                                    </td>
                                    <td className="p-3 text-green-600 font-medium">{member.pref}</td>
                                    <td className="p-3 text-center">
                                        {member.breakfast ? <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-300">-</span>}
                                    </td>
                                    <td className="p-3 text-center">
                                        {member.lunch ? <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-300">-</span>}
                                    </td>
                                    <td className="p-3 text-center">
                                        {member.dinner ? <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-300">-</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.section>

            {/* Checkpoints */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mx-4 mt-6"
            >
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900">Checkpoints</h3>
                        <p className="text-xs text-gray-400">Track your progress milestones</p>
                    </div>
                    <Clock className="h-5 w-5 text-gray-400" />
                </div>
            </motion.section>

            {/* Recent Activity */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mx-4 mt-6 mb-10"
            >
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Recent Activity</h2>
                <div className="space-y-3">
                    {recentActivity.map((activity, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-semibold text-green-600">{activity.type}</p>
                                <p className="text-sm text-gray-600">{activity.message}</p>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </motion.section>

            <BottomNav />
        </div>
    );
}
