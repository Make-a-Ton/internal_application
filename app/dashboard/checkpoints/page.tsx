"use client";

import { useAppState } from "../../context/AppContext";
import { Lock, Unlock, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useState } from "react";
import ConfirmationModal from "../../components/ConfirmationModal";

export default function CheckpointsPage() {
    const { team } = useAuth();
    const { teamCheckpointStatuses, updateCheckpointStatus, checkpointDefinitions, globalCheckpointStatus } = useAppState();

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        checkpointNumber: 1 | 2 | 3 | null;
    }>({ isOpen: false, checkpointNumber: null });

    const status = teamCheckpointStatuses.find(s => s.teamId === team?.id) || {
        id: 'virtual',
        teamId: team?.id || '',
        check_1: 'locked',
        check_2: 'locked',
        check_3: 'locked'
    };

    const handleConfirmSubmit = async () => {
        if (!team?.id || !modalConfig.checkpointNumber) return;
        await updateCheckpointStatus(team.id, modalConfig.checkpointNumber, "finished");
        setModalConfig({ ...modalConfig, isOpen: false });
    };

    return (
        <div className="min-h-screen bg-transparent pb-24">
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#7A2840]/20">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-[#5C0124] hover:bg-[#5C0124]/5 p-2 rounded-full transition-colors">
                            ←
                        </Link>
                        <h1 className="text-xl font-bold text-[#3A0015]">Team Checkpoints</h1>
                    </div>
                </div>
            </header>

            <main className="p-4 space-y-6 max-w-lg mx-auto">
                <div className="grid gap-4">
                    {[1, 2, 3].map((num) => {
                        const cpNum = num as 1 | 2 | 3;
                        const cpStatus = status[`check_${cpNum}`];
                        const def = checkpointDefinitions.find(d => d.id === cpNum);

                        // Global Lock Check
                        // If global row exists and is locked, we prevent NEW submissions (pending -> finished).
                        // However, we still show current status.
                        const isGloballyLocked = globalCheckpointStatus?.[`check_${cpNum}`] === 'locked';

                        return (
                            <div
                                key={num}
                                className={`relative p-5 rounded-2xl border-2 transition-all ${cpStatus === 'locked'
                                        ? "border-gray-200 bg-white/60"
                                        : cpStatus === 'pending'
                                            ? "border-[#D4AF37]/40 bg-[#FFF9E6]"
                                            : "border-green-500/20 bg-green-50"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${cpStatus === 'locked' ? "bg-gray-100 text-gray-500" : cpStatus === 'pending' ? "bg-[#D4AF37]/20 text-[#8a701f]" : "bg-green-100 text-green-700"
                                        }`}>
                                        Checkpoint {num}
                                    </span>
                                    {cpStatus === 'locked' && <Lock className="w-5 h-5 text-gray-300" />}
                                    {cpStatus === 'pending' && <Clock className="w-5 h-5 text-[#D4AF37]" />}
                                    {cpStatus === 'finished' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                </div>

                                <h3 className={`font-bold text-lg mb-2 ${cpStatus === 'locked' ? 'text-gray-500' : 'text-[#3A0015]'}`}>
                                    {def?.title}
                                </h3>
                                <p className="text-sm text-[#3A0015]/70 mb-4 leading-relaxed">
                                    {def?.description}
                                </p>

                                {cpStatus === 'pending' && (
                                    <>
                                        {isGloballyLocked ? (
                                            <div className="w-full py-2.5 bg-gray-100 text-gray-500 text-sm font-bold rounded-xl flex items-center justify-center gap-2 border border-gray-200">
                                                <AlertTriangle className="w-4 h-4 text-[#D4AF37]" /> Submissions Closed
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setModalConfig({ isOpen: true, checkpointNumber: cpNum })}
                                                className="w-full py-2.5 bg-[#5C0124] text-white text-sm font-bold rounded-xl hover:bg-[#7A2840] shadow-md shadow-[#5C0124]/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                Mark as Submitted <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </>
                                )}
                                {cpStatus === 'finished' && (
                                    <div className="w-full py-2.5 bg-green-100 text-green-700 text-sm font-bold rounded-xl flex items-center justify-center gap-2">
                                        Submission Verified <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                )}
                                {cpStatus === 'locked' && (
                                    <div className="w-full py-2.5 bg-gray-100 text-gray-400 text-sm font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                                        Locked
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={handleConfirmSubmit}
                title="Submit Checkpoint?"
                message={`Are you sure you want to mark Checkpoint ${modalConfig.checkpointNumber} as submitted? This indicates you have completed all requirements.`}
                confirmText="Confirm Submission"
                type="info"
                cancelText="Not yet"
            />
        </div>
    );
}
