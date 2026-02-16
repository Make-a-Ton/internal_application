"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Bell, ArrowRight } from "lucide-react";
import Link from "next/link";
import BottomNav from "../../components/BottomNav";
import CheckpointModal from "../../components/CheckpointModal";
import { useAppState } from "../../context/AppContext";

export default function CheckpointsPage() {
    const { checkpoints, checkpointTasks, updateCheckpointTasks } = useAppState();
    const [selectedCheckpointId, setSelectedCheckpointId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const selectedCheckpoint = checkpoints.find(c => c.id === selectedCheckpointId) || null;

    const handleOpenCheckpoint = (checkpointId: number) => {
        setSelectedCheckpointId(checkpointId);
        setIsModalOpen(true);
    };

    const handleTasksChange = (checkpointId: number, tasks: { id: string; text: string; completed: boolean }[]) => {
        updateCheckpointTasks("1", checkpointId, tasks);
    };

    const currentTasks = selectedCheckpointId ? checkpointTasks[`1:${selectedCheckpointId}`] || [] : [];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6 text-gray-700" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-extrabold text-gray-900">Checkpoints</h1>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Your Roadmap</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Bell className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600">TR</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Checkpoints List */}
            <div className="px-4 py-6 space-y-4">
                {checkpoints.map((checkpoint, index) => (
                    <motion.div
                        key={checkpoint.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm ${checkpoint.isLocked ? "opacity-60" : ""}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                {/* Checkpoint Badge */}
                                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-3 uppercase tracking-wide ${checkpoint.isLocked ? "bg-gray-300 text-gray-600" : "bg-gray-900 text-white"
                                    }`}>
                                    {checkpoint.isLocked ? "🔒 Locked" : `Checkpoint ${checkpoint.number}`}
                                </span>

                                {/* Title */}
                                <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                                    {checkpoint.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                    {checkpoint.description}
                                </p>

                                {/* Task count */}
                                {(checkpointTasks[`1:${checkpoint.id}`]?.length || 0) > 0 && (
                                    <p className="text-xs text-blue-600 font-semibold mb-2">
                                        {checkpointTasks[`1:${checkpoint.id}`].length} task(s) added
                                    </p>
                                )}

                                {/* Open Tasks Button */}
                                {!checkpoint.isLocked && (
                                    <button
                                        onClick={() => handleOpenCheckpoint(checkpoint.id)}
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors group"
                                    >
                                        OPEN TASKS
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>

                            {/* Arrow Circle */}
                            {!checkpoint.isLocked && (
                                <button
                                    onClick={() => handleOpenCheckpoint(checkpoint.id)}
                                    className="flex-shrink-0 w-12 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                                >
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Checkpoint Modal */}
            {selectedCheckpoint && (
                <CheckpointModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    checkpoint={selectedCheckpoint}
                    tasks={currentTasks}
                    onTasksChange={handleTasksChange}
                />
            )}

            <BottomNav />
        </div>
    );
}
