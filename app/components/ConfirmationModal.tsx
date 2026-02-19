"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, CheckCircle2, X } from "lucide-react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "info",
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: "bg-red-50",
            border: "border-red-200",
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            buttonBg: "bg-red-600 hover:bg-red-700",
            buttonText: "text-white",
        },
        warning: {
            bg: "bg-[#FFF9E6]", // Light gold
            border: "border-[#D4AF37]/30",
            iconBg: "bg-[#D4AF37]/20",
            iconColor: "text-[#D4AF37]",
            buttonBg: "bg-[#D4AF37] hover:bg-[#b08d2b]",
            buttonText: "text-[#3A0015]",
        },
        info: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            buttonBg: "bg-[#5C0124] hover:bg-[#7A2840]", // Standard app primary
            buttonText: "text-white",
        },
    };

    const style = colors[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-white border ${style.border}`}
                    >
                        <div className={`p-6 ${style.bg} border-b ${style.border}`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${style.iconBg} ${style.iconColor}`}>
                                    {type === "danger" && <AlertTriangle className="w-6 h-6" />}
                                    {type === "warning" && <AlertTriangle className="w-6 h-6" />}
                                    {type === "info" && <Info className="w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-[#3A0015]">{title}</h3>
                                    <p className="mt-2 text-sm text-[#3A0015]/70 leading-relaxed">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-white flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-semibold text-[#3A0015]/60 hover:text-[#3A0015] hover:bg-[#3A0015]/5 rounded-lg transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`px-4 py-2 text-sm font-bold rounded-lg shadow-md transition-all ${style.buttonBg} ${style.buttonText}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
