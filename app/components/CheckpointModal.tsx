"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Plus, Check } from "lucide-react";

export interface CheckpointTask {
    id: string;
    text: string;
    completed: boolean;
}

export interface Checkpoint {
    id: number;
    number: number;
    title: string;
    description: string;
    isLocked: boolean;
}

interface CheckpointModalProps {
    isOpen: boolean;
    onClose: () => void;
    checkpoint: Checkpoint | null;
    tasks: CheckpointTask[];
    onTasksChange: (checkpointId: number, tasks: CheckpointTask[]) => void;
}

export default function CheckpointModal({ isOpen, onClose, checkpoint, tasks, onTasksChange }: CheckpointModalProps) {
    const [newTask, setNewTask] = useState("");
    const [isAddingTask, setIsAddingTask] = useState(false);

    const handleAddTask = () => {
        if (newTask.trim() && checkpoint) {
            const updatedTasks = [
                ...tasks,
                { id: Date.now().toString(), text: newTask.trim(), completed: false }
            ];
            onTasksChange(checkpoint.id, updatedTasks);
            setNewTask("");
            setIsAddingTask(false);
        }
    };

    const toggleTaskComplete = (taskId: string) => {
        if (checkpoint?.isLocked || !checkpoint) return;
        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        onTasksChange(checkpoint.id, updatedTasks);
    };

    const handleSubmit = () => {
        console.log("Submitting checkpoint tasks:", { checkpointId: checkpoint?.id, tasks });
        // TODO: API call to save tasks
        onClose();
    };

    if (!checkpoint) return null;

    const nextCheckpointNumber = checkpoint.number + 1;

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
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                                    CHECKPOINT {checkpoint.number}
                                </p>
                                <h2 className="text-3xl font-extrabold text-gray-900">{checkpoint.title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Plan Next Button */}
                        <button
                            className="w-full py-3 px-6 border-2 border-gray-900 text-gray-900 font-bold rounded-full text-center mb-8 hover:bg-gray-100 transition-colors"
                        >
                            Plan Next
                        </button>

                        {/* Plan Next Steps Section */}
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Plan Next Steps</h3>
                            <p className="text-gray-500 text-sm">
                                What are your goals for Checkpoint {nextCheckpointNumber}?
                            </p>
                        </div>

                        {/* Task List */}
                        <div className="space-y-3 mb-6">
                            {tasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 ${checkpoint.isLocked ? "opacity-60" : ""
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleTaskComplete(task.id)}
                                        disabled={checkpoint.isLocked}
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${task.completed
                                            ? "bg-green-500 border-green-500"
                                            : "border-gray-300 hover:border-gray-400"
                                            } ${checkpoint.isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                                    >
                                        {task.completed && <Check className="h-3 w-3 text-white" />}
                                    </button>
                                    <span className={`text-gray-800 ${task.completed ? "line-through text-gray-400" : ""}`}>
                                        {task.text}
                                    </span>
                                </motion.div>
                            ))}

                            {/* Add Task Input */}
                            {isAddingTask && !checkpoint.isLocked ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-blue-200"
                                >
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={newTask}
                                        onChange={(e) => setNewTask(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                                        placeholder="Enter your goal..."
                                        autoFocus
                                        className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                                    />
                                    <button
                                        onClick={handleAddTask}
                                        className="text-blue-600 font-semibold text-sm hover:text-blue-700"
                                    >
                                        Add
                                    </button>
                                </motion.div>
                            ) : !checkpoint.isLocked && (
                                <button
                                    onClick={() => setIsAddingTask(true)}
                                    className="flex items-center gap-3 p-4 w-full text-left text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-2xl border border-dashed border-gray-200 transition-colors"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span>Add a new goal...</span>
                                </button>
                            )}
                        </div>

                        {/* Locked State or Submit Button */}
                        {checkpoint.isLocked ? (
                            <div className="flex items-center justify-center gap-3 py-4 bg-gray-100 rounded-2xl text-gray-500">
                                <Lock className="h-5 w-5" />
                                <span className="font-semibold uppercase tracking-wider text-sm">
                                    Checkpoint Locked
                                </span>
                            </div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg"
                            >
                                Submit Tasks
                            </motion.button>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
