"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Trash2, User, BookOpen, X } from "lucide-react";
import { useAppState } from "../../context/AppContext";

export default function AdminMentorsPage() {
    const { mentors, addMentor, deleteMentor } = useAppState();
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMentor, setNewMentor] = useState({ name: "", domain: "" });

    const filteredMentors = mentors.filter(mentor =>
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddMentor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMentor.name || !newMentor.domain) return;
        await addMentor(newMentor);
        setNewMentor({ name: "", domain: "" });
        setIsAddModalOpen(false);
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#5C0124]">Mentors</h1>
                    <p className="text-[#8B6F4E] mt-1">{mentors.length} mentors available</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C09B6E]" />
                        <input
                            type="text"
                            placeholder="Search mentors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#7A2840]/50 border border-[#7A2840] rounded-xl text-sm text-[#3A0015] placeholder:text-[#3A0015]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                            suppressHydrationWarning={true}
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#5C0124] text-[#F4E4BC] rounded-xl font-bold hover:bg-[#7A2840] transition-colors shadow-lg border border-[#D4AF37]/30"
                        suppressHydrationWarning={true}
                    >
                        <Plus className="h-5 w-5" />
                        Add Mentor
                    </button>
                </div>
            </div>

            {/* Mentors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredMentors.map((mentor, index) => (
                        <motion.div
                            key={mentor.id && mentor.id !== "" ? mentor.id : `mentor-${index}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-[#7A2840]/20 border border-[#7A2840] rounded-2xl p-6 relative group hover:bg-[#7A2840]/30 transition-all shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#5C0124] rounded-full flex items-center justify-center text-[#D4AF37] font-bold text-lg">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#3A0015] text-lg">{mentor.name}</h3>
                                        <div className="flex items-center gap-1 text-[#8B6F4E] text-sm mt-1">
                                            <BookOpen className="h-4 w-4" />
                                            {mentor.domain}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteMentor(mentor.id)}
                                    className="p-2 text-[#5C0124]/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete Mentor"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredMentors.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <User className="h-12 w-12 text-[#7A2840]/20 mx-auto mb-4" />
                        <p className="text-[#3A0015]/50">No mentors found</p>
                    </div>
                )}
            </div>

            {/* Add Mentor Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#7A2840]/10"
                        >
                            <div className="p-6 border-b border-[#7A2840]/10 flex items-center justify-between bg-[#5C0124] text-[#F4E4BC]">
                                <h2 className="text-xl font-bold">Add New Mentor</h2>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="p-1 hover:bg-[#7A2840] rounded-lg transition-colors"
                                    suppressHydrationWarning={true}
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAddMentor} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-[#5C0124] mb-1.5 uppercase tracking-wider">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newMentor.name}
                                        onChange={e => setNewMentor(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 bg-[#7A2840]/5 border border-[#7A2840]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-[#3A0015]"
                                        placeholder="Enter mentor's name"
                                        suppressHydrationWarning={true}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#5C0124] mb-1.5 uppercase tracking-wider">
                                        Domain Expertise
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newMentor.domain}
                                        onChange={e => setNewMentor(prev => ({ ...prev, domain: e.target.value }))}
                                        className="w-full px-4 py-3 bg-[#7A2840]/5 border border-[#7A2840]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-[#3A0015]"
                                        placeholder="e.g. AI/ML, Frontend, Backend"
                                        suppressHydrationWarning={true}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-[#5C0124] text-[#F4E4BC] rounded-xl font-bold text-lg hover:bg-[#7A2840] transition-colors shadow-lg mt-4"
                                    suppressHydrationWarning={true}
                                >
                                    Add Mentor
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
