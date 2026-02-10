"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

interface GetHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: { category: string; urgency: string; description: string }) => void;
}

const categories = ["Technical", "Infrastructure", "Mentorship", "Medical"];
const urgencyLevels = [
    { label: "Normal", color: "green" },
    { label: "Critical", color: "red" },
];

export default function GetHelpModal({ isOpen, onClose, onSubmit }: GetHelpModalProps) {
    const [selectedCategory, setSelectedCategory] = useState("Technical");
    const [selectedUrgency, setSelectedUrgency] = useState("Normal");
    const [description, setDescription] = useState("");

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit({ category: selectedCategory, urgency: selectedUrgency, description });
        }
        setDescription("");
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
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-extrabold text-gray-900">Get Help</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Category */}
                        <div className="mb-6">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">
                                Category
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${selectedCategory === category
                                            ? "bg-burgundy text-gold-light shadow-lg"
                                            : "bg-white border border-gray-200 text-gray-700 hover:border-burgundy/50"
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Urgency Level */}
                        <div className="mb-6">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">
                                Urgency Level
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {urgencyLevels.map((level) => (
                                    <button
                                        key={level.label}
                                        onClick={() => setSelectedUrgency(level.label)}
                                        className={`py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${selectedUrgency === level.label
                                            ? level.color === "green"
                                                ? "bg-green-50 border-2 border-green-500 text-green-700"
                                                : "bg-red-50 border-2 border-red-500 text-red-700"
                                            : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400"
                                            }`}
                                    >
                                        <span
                                            className={`h-2 w-2 rounded-full ${level.color === "green" ? "bg-green-500" : "bg-red-500"
                                                }`}
                                        />
                                        {level.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your issue in detail..."
                                className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-burgundy/50 focus:border-transparent resize-none"
                            />
                            <p className="text-xs text-gray-400 text-right mt-1">OPTIONAL</p>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg"
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
