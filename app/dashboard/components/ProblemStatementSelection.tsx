'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { getKireapTracks, submitProblemStatement } from "../actions";

interface KireapTrack {
    id: string;
    statement: string;
    description: string;
}

interface ProblemStatementSelectionProps {
    teamId: string;
    onSuccess: () => void;
}

export default function ProblemStatementSelection({ teamId, onSuccess }: ProblemStatementSelectionProps) {
    const [track, setTrack] = useState<"Software" | "Hardware" | "Kireap" | null>(null);
    const [problemStatement, setProblemStatement] = useState("");
    const [description, setDescription] = useState("");
    const [kireapTracks, setKireapTracks] = useState<KireapTrack[]>([]);
    const [selectedKireapId, setSelectedKireapId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (track === "Kireap") {
            const fetchTracks = async () => {
                const tracks = await getKireapTracks();
                setKireapTracks(tracks);
            };
            fetchTracks();
        } else {
            // Reset kireap specific state when switching away
            setSelectedKireapId("");
            if (track) {
                setProblemStatement("");
                setDescription("");
            }
        }
    }, [track]);

    const handleKireapSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedKireapId(id);
        const selected = kireapTracks.find(t => String(t.id) === id);
        if (selected) {
            setProblemStatement(selected.statement);
            setDescription(selected.description);
        } else {
            setProblemStatement("");
            setDescription("");
        }
    };

    const handleSubmit = async () => {
        if (!track) {
            setError("Please select a track.");
            return;
        }
        if (!problemStatement.trim()) {
            setError("Please provide a problem statement.");
            return;
        }
        if (!description.trim()) {
            setError("Please provide a description.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await submitProblemStatement(teamId, track.toLowerCase(), problemStatement, description);
            if (result.success) {
                onSuccess();
            } else {
                setError(result.error || "Submission failed.");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-[#3A0015]/30 border border-[#7A2840]/50 rounded-xl text-[#F4E4BC] placeholder-[#F4E4BC]/30 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all";
    const labelClass = "block text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-2";

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-[#F4E4BC] mb-6 text-center">Select Your Problem Statement</h2>

            {/* Track Selection */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {["Software", "Hardware", "Kireap"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTrack(t as any)}
                        className={`py-3 px-2 rounded-xl text-sm font-bold border transition-all ${track === t
                            ? "bg-[#D4AF37] text-[#5C0023] border-[#D4AF37]"
                            : "bg-[#3A0015]/30 text-[#C09B6E] border-[#7A2840]/50 hover:border-[#C09B6E]"
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Input Forms */}
            {track && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {track === "Kireap" ? (
                        <div>
                            <label className={labelClass}>Select Kireap Statement</label>
                            <div className="relative">
                                <select
                                    value={selectedKireapId}
                                    onChange={handleKireapSelect}
                                    disabled={kireapTracks.length === 0}
                                    className={`${inputClass} appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <option value="">
                                        {kireapTracks.length === 0
                                            ? "Failed to load tracks - Check connection"
                                            : "-- Select a Statement --"
                                        }
                                    </option>
                                    {kireapTracks.map((kt) => (
                                        <option key={kt.id} value={kt.id} className="bg-[#3A0015] text-[#F4E4BC]">
                                            {kt.statement}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C09B6E] pointer-events-none" />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className={labelClass}>Problem Statement</label>
                            <input
                                type="text"
                                value={problemStatement}
                                onChange={(e) => setProblemStatement(e.target.value)}
                                placeholder="Enter your problem statement title..."
                                className={inputClass}
                            />
                        </div>
                    )}

                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            readOnly={track === "Kireap"}
                            placeholder="Describe your problem statement..."
                            rows={4}
                            className={`${inputClass} ${track === "Kireap" ? "opacity-70 cursor-not-allowed" : ""}`}
                        />
                        {track === "Kireap" && <p className="text-[10px] text-[#C09B6E] mt-1">*Auto-filled from selected Kireap statement</p>}
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3 rounded-lg flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full py-3 bg-[#D4AF37] hover:bg-[#E7BB88] text-[#5C0023] font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                        {isLoading ? "Submitting..." : "Confirm Selection"}
                    </button>
                    <p className="text-[10px] text-[#C09B6E] text-center mt-2">
                        *This action cannot be undone. Please verify your details.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
