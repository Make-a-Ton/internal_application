"use client";

import { motion } from "framer-motion";
import { Lock, Unlock, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useAppState } from "../../context/AppContext";
import { useState } from "react";
import ConfirmationModal from "../../components/ConfirmationModal";

export default function AdminCheckpointsPage() {
    const { teams, teamCheckpointStatuses, unlockCheckpointGlobally, lockCheckpointGlobally, checkpointDefinitions, globalCheckpointStatus } = useAppState();

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'unlock' | 'lock';
        checkpointNumber: 1 | 2 | 3 | null;
    }>({ isOpen: false, type: 'unlock', checkpointNumber: null });

    const handleAction = async () => {
        if (!modalConfig.checkpointNumber) return;

        if (modalConfig.type === 'unlock') {
            await unlockCheckpointGlobally(modalConfig.checkpointNumber);
        } else {
            await lockCheckpointGlobally(modalConfig.checkpointNumber);
        }
        setModalConfig({ ...modalConfig, isOpen: false });
    };

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#5C0124]">Global Checkpoint Control</h1>
                    <p className="text-[#8B6F4E] mt-1">Manage checkpoint releases for the entire event</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((num, index) => {
                    const cpNum = num as 1 | 2 | 3;
                    const def = checkpointDefinitions.find(d => d.id === cpNum);

                    // Calculate stats
                    let lockedCount = 0;
                    let pendingCount = 0;
                    let finishedCount = 0;

                    teamCheckpointStatuses.forEach(status => {
                        const s = status[`check_${cpNum}`];
                        if (s === 'locked') lockedCount++;
                        else if (s === 'pending') pendingCount++;
                        else if (s === 'finished') finishedCount++;
                    });

                    const totalTracked = teamCheckpointStatuses.length;
                    const missingTeams = teams.length - totalTracked;
                    lockedCount += missingTeams;

                    const isActive = pendingCount > 0 || finishedCount > 0;

                    // Check if specifically globally locked (Relocked)
                    const isGloballyLocked = globalCheckpointStatus?.[`check_${cpNum}`] === 'locked';

                    // "Released" state visual: It is active AND NOT globally locked.
                    const isReleased = isActive && !isGloballyLocked;

                    return (
                        <motion.div
                            key={cpNum}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative flex flex-col h-full bg-white/40 backdrop-blur-sm rounded-2xl border-2 overflow-hidden transition-all ${!isReleased ? "border-gray-200" : "border-[#D4AF37]"
                                }`}
                        >
                            {/* Header */}
                            <div className={`p-6 border-b ${!isReleased ? "bg-gray-50 border-gray-100" : "bg-[#D4AF37]/10 border-[#D4AF37]/20"}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${!isReleased ? "bg-gray-200 text-gray-600" : "bg-[#D4AF37] text-[#3A0015]"
                                        }`}>
                                        Checkpoint {cpNum}
                                    </span>
                                    {!isReleased ? <Lock className="w-5 h-5 text-gray-400" /> : <Unlock className="w-5 h-5 text-[#D4AF37]" />}
                                </div>
                                <h3 className="text-xl font-extrabold text-[#3A0015] mb-2">{def?.title}</h3>
                                <p className="text-sm text-[#3A0015]/70 h-20 overflow-y-auto">{def?.description}</p>
                            </div>

                            {/* Stats */}
                            <div className="flex-1 p-6 space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-gray-500"><Lock className="w-4 h-4" /> Locked</span>
                                        <span className="font-bold text-gray-700">{lockedCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-[#D4AF37]"><Clock className="w-4 h-4" /> Pending</span>
                                        <span className="font-bold text-[#b08d2b]">{pendingCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-green-600"><CheckCircle2 className="w-4 h-4" /> Finished</span>
                                        <span className="font-bold text-green-700">{finishedCount}</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                                    <div style={{ width: `${(finishedCount / teams.length) * 100}%` }} className="bg-green-500" />
                                    <div style={{ width: `${(pendingCount / teams.length) * 100}%` }} className="bg-[#D4AF37]" />
                                </div>
                                <div className="text-xs text-right text-gray-400">
                                    {Math.round(((pendingCount + finishedCount) / (teams.length || 1)) * 100)}% Released
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="p-4 bg-white/50 border-t border-gray-100 flex gap-2">
                                <button
                                    onClick={() => setModalConfig({ isOpen: true, type: 'unlock', checkpointNumber: cpNum })}
                                    disabled={isReleased}
                                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isReleased
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-[#5C0124] text-white hover:bg-[#7A2840] shadow-lg shadow-[#5C0124]/20"
                                        }`}
                                >
                                    {isReleased ? (
                                        <>Released <CheckCircle2 className="w-4 h-4" /></>
                                    ) : (
                                        <>RELEASE <Unlock className="w-4 h-4" /></>
                                    )}
                                </button>

                                {isActive && (
                                    <button
                                        onClick={() => !isGloballyLocked && setModalConfig({ isOpen: true, type: 'lock', checkpointNumber: cpNum })}
                                        disabled={isGloballyLocked}
                                        className={`px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border ${isGloballyLocked
                                                ? "bg-red-50 text-red-600 border-red-200 cursor-default"
                                                : "bg-gray-200 text-gray-600 hover:bg-gray-300 border-gray-300"
                                            }`}
                                        title={isGloballyLocked ? "Globally Relocked" : "Re-lock Checkpoint"}
                                    >
                                        {isGloballyLocked ? (
                                            <>RELOCKED <Lock className="w-4 h-4" /></>
                                        ) : (
                                            <Lock className="w-4 h-4" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={handleAction}
                title={modalConfig.type === 'unlock' ? "Release Checkpoint?" : "Re-lock Checkpoint?"}
                message={modalConfig.type === 'unlock'
                    ? `Are you sure you want to RELEASE Checkpoint ${modalConfig.checkpointNumber} to ALL ${teams.length} TEAMS? This will unlock it for everyone.`
                    : `Are you sure you want to RE-LOCK Checkpoint ${modalConfig.checkpointNumber}? This will lock it for ALL teams, even if they were working on it.`}
                confirmText={modalConfig.type === 'unlock' ? "RELEASE TO ALL" : "RE-LOCK NOW"}
                type={modalConfig.type === 'unlock' ? "info" : "danger"}
                cancelText="Cancel"
            />
        </div>
    );
}
