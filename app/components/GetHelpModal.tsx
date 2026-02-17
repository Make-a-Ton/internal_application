"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, User, BookOpen } from "lucide-react";
import { useAppState } from "../context/AppContext";

interface GetHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: { category: string; urgency: string; description: string; mentorId?: string }) => void;
}

const categories = ["Technical", "Infrastructure", "Mentorship", "Medical"];
const urgencyLevels = [
    { label: "Normal", color: "green" },
    { label: "Critical", color: "red" },
];

export default function GetHelpModal({ isOpen, onClose, onSubmit }: GetHelpModalProps) {
    const { mentors } = useAppState();
    const [selectedCategory, setSelectedCategory] = useState("Technical");
    const [selectedUrgency, setSelectedUrgency] = useState("Normal");
    const [selectedMentorId, setSelectedMentorId] = useState<string>("");
    const [description, setDescription] = useState("");

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit({
                category: selectedCategory,
                urgency: selectedUrgency,
                description,
                mentorId: selectedCategory === "Mentorship" ? selectedMentorId : undefined
            });
        }
        setDescription("");
        setSelectedMentorId("");
        onClose();
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
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Handle */}
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-extrabold text-[#3A0015]">Get Help</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-[#8B6F4E] hover:text-[#5C0124] hover:bg-[#7A2840]/10 rounded-full transition-colors"
                                suppressHydrationWarning={true}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Category */}
                        <div className="mb-6">
                            <p className="text-xs font-bold text-[#5C0124] uppercase tracking-widest text-center mb-4">
                                Category
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${selectedCategory === category
                                            ? "bg-[#5C0124] text-white shadow-lg"
                                            : "bg-white border border-[#7A2840]/20 text-[#5C0124] hover:border-[#5C0124]"
                                            }`}
                                        suppressHydrationWarning={true}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mentor Selection (Only for Mentorship) */}
                        <AnimatePresence>
                            {selectedCategory === "Mentorship" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 overflow-hidden"
                                >
                                    <p className="text-xs font-bold text-[#5C0124] uppercase tracking-widest text-center mb-4">
                                        Select Mentor
                                    </p>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {mentors.length === 0 ? (
                                            <p className="text-center text-xs text-[#8B6F4E] py-4">No mentors available right now</p>
                                        ) : (
                                            mentors.map((mentor) => (
                                                <button
                                                    key={mentor.id}
                                                    onClick={() => setSelectedMentorId(mentor.id)}
                                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedMentorId === mentor.id
                                                        ? "bg-[#5C0124]/10 border-[#5C0124] shadow-sm"
                                                        : "bg-white border-[#7A2840]/10 hover:border-[#5C0124]/30"
                                                        }`}
                                                    suppressHydrationWarning={true}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedMentorId === mentor.id ? "bg-[#5C0124] text-white" : "bg-gray-100 text-[#5C0124]"
                                                            }`}>
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className={`text-sm font-bold ${selectedMentorId === mentor.id ? "text-[#5C0124]" : "text-[#3A0015]"
                                                                }`}>{mentor.name}</p>
                                                            <div className="flex items-center gap-1 text-[10px] text-[#8B6F4E]">
                                                                <BookOpen className="h-3 w-3" />
                                                                {mentor.domain}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {selectedMentorId === mentor.id && (
                                                        <div className="w-5 h-5 bg-[#5C0124] rounded-full flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-white rounded-full" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Urgency Level */}
                        <div className="mb-6">
                            <p className="text-xs font-bold text-[#5C0124] uppercase tracking-widest text-center mb-4">
                                Urgency Level
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {urgencyLevels.map((level) => (
                                    <button
                                        key={level.label}
                                        onClick={() => setSelectedUrgency(level.label)}
                                        className={`py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${selectedUrgency === level.label
                                            ? level.color === "green"
                                                ? "bg-[#E7BB88]/20 border-2 border-[#E7BB88] text-[#E7BB88]"
                                                : "bg-red-50 border-2 border-red-500 text-red-600"
                                            : "bg-white border border-[#7A2840]/20 text-[#5C0124] hover:border-[#5C0124]"
                                            }`}
                                        suppressHydrationWarning={true}
                                    >
                                        <span
                                            className={`h-2 w-2 rounded-full ${level.color === "green" ? "bg-[#E7BB88]" : "bg-red-500"
                                                }`}
                                        />
                                        {level.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        {selectedCategory !== "Mentorship" && (
                            <div className="mb-6">
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your issue in detail..."
                                    className="w-full h-32 p-4 bg-gray-50 border border-[#7A2840]/20 rounded-xl text-[#3A0015] placeholder:text-[#3A0015]/40 focus:outline-none focus:ring-2 focus:ring-[#5C0124] focus:border-transparent resize-none"
                                    suppressHydrationWarning={true}
                                />
                                <p className="text-xs text-[#8B6F4E] text-right mt-1">OPTIONAL</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={selectedCategory === "Mentorship" && !selectedMentorId}
                            className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg ${selectedCategory === "Mentorship" && !selectedMentorId
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-[#5C0124] hover:bg-[#7A2840] text-white"
                                }`}
                            suppressHydrationWarning={true}
                        >
                            Send Request
                            <ArrowRight className="h-5 w-5" />
                        </motion.button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
