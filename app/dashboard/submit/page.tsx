"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ChevronLeft, Bell, FileText, Globe, Image as ImageIcon,
    Link2, Github, Video, Upload, X, Save, AlertCircle, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

interface FileUpload {
    name: string;
    preview?: string;
    file?: File;
    url?: string; // For existing files
}

export default function SubmitProjectPage() {
    const { team, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // General Information
    const [projectName, setProjectName] = useState("");
    const [submissionTitle, setSubmissionTitle] = useState("");

    const [description, setDescription] = useState("");
    const [techStack, setTechStack] = useState("");

    // Links & Media
    const [githubRepo, setGithubRepo] = useState("");
    const [demoVideoUrl, setDemoVideoUrl] = useState("");
    const [architectureDiagram, setArchitectureDiagram] = useState<FileUpload | null>(null);
    const [presentationSlides, setPresentationSlides] = useState<FileUpload | null>(null);

    // Screenshots
    const [screenshots, setScreenshots] = useState<FileUpload[]>([]);

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submissionId, setSubmissionId] = useState<number | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const archRef = useRef<HTMLInputElement>(null);
    const slidesRef = useRef<HTMLInputElement>(null);
    const screenshotRef = useRef<HTMLInputElement>(null);

    // Fetch existing submission
    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || !team) {
            setIsLoadingData(false);
            return;
        }

        const fetchSubmission = async () => {
            try {
                const { data, error } = await supabase
                    .from("submissions")
                    .select("*")
                    .eq("team_id", team.id)
                    .maybeSingle();

                if (error) throw error;

                if (data) {
                    setSubmissionId(data.id);
                    setProjectName(data.name || "");
                    setTagline(data.tagline || "");
                    setDescription(data.description || "");
                    setTechStack(data.tech_stack || "");
                    setGithubRepo(data.git_repo || "");
                    setDemoVideoUrl(data.vid_url || "");

                    if (data.arch_image_url) {
                        setArchitectureDiagram({
                            name: "Architecture Diagram",
                            url: data.arch_image_url,
                            preview: data.arch_image_url
                        });
                    }

                    if (data.screenshots && Array.isArray(data.screenshots)) {
                        setScreenshots(data.screenshots.map((url: string, index: number) => ({
                            name: `Screenshot ${index + 1}`,
                            url: url,
                            preview: url
                        })));
                    }
                }
            } catch (err) {
                console.error("Error fetching submission:", err);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchSubmission();
    }, [team, isAuthenticated, authLoading]);

    const handleFileUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: (f: FileUpload | null) => void
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
        setter({ name: file.name, preview, file });
    };

    const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const remaining = 7 - screenshots.length;
        const newFiles = Array.from(files).slice(0, remaining).map(file => ({
            name: file.name,
            preview: URL.createObjectURL(file),
            file,
        }));
        setScreenshots(prev => [...prev, ...newFiles]);
    };

    const removeScreenshot = (index: number) => {
        setScreenshots(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFile = async (file: File, path: string) => {
        try {
            const { data, error } = await supabase.storage
                .from('pics')
                .upload(path, file, {
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('pics')
                .getPublicUrl(path);

            return publicUrl;
        } catch (err) {
            console.error("Upload failed", err);
            throw err;
        }
    };

    const handleSave = async () => {
        if (!team) {
            setError("You must be logged in as a team to submit.");
            return;
        }

        setIsSaving(true);
        setError(null);
        setSaved(false);

        try {
            // 1. Upload Architecture Diagram
            let archUrl = architectureDiagram?.url || null;
            if (architectureDiagram?.file) {
                const fileExt = architectureDiagram.file.name.split('.').pop();
                const fileName = `arch_${Date.now()}.${fileExt}`;
                const filePath = `submissions/${team.id}/${fileName}`;
                archUrl = await uploadFile(architectureDiagram.file, filePath);
            }

            // 2. Upload Screenshots
            const screenshotUrls: string[] = [];
            for (let i = 0; i < screenshots.length; i++) {
                const shot = screenshots[i];
                if (shot.file) {
                    const fileExt = shot.file.name.split('.').pop();
                    const fileName = `screenshot_${i}_${Date.now()}.${fileExt}`;
                    const filePath = `submissions/${team.id}/${fileName}`;
                    const url = await uploadFile(shot.file, filePath);
                    screenshotUrls.push(url);
                } else if (shot.url) {
                    screenshotUrls.push(shot.url);
                }
            }

            // 3. Save to Database
            const payload = {
                team_id: team.id,
                name: projectName,
                tagline,
                description,
                tech_stack: techStack,
                git_repo: githubRepo,
                vid_url: demoVideoUrl,
                arch_image_url: archUrl,
                screenshots: screenshotUrls,
            };

            const { error: upsertError } = await supabase
                .from('submissions')
                .upsert(
                    submissionId ? { id: submissionId, ...payload } : payload,
                    { onConflict: 'id' }
                );

            if (upsertError) throw upsertError;

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);

            // Refetch to get new ID if created
            if (!submissionId) {
                const { data: newData } = await supabase
                    .from("submissions")
                    .select("id")
                    .eq("team_id", team.id)
                    .single();
                if (newData) setSubmissionId(newData.id);
            }

        } catch (err: any) {
            console.error("Save failed:", err);
            setError(err.message || "Failed to save submission.");
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-[#F8F9FA] border border-[#7A2840]/20 rounded-xl text-[#3A0015] text-sm placeholder-[#3A0015]/40 focus:outline-none focus:ring-2 focus:ring-[#5C0124] focus:border-transparent transition-all";
    const labelClass = "block text-xs font-bold text-[#5C0124] uppercase tracking-widest mb-2 text-center";

    if (authLoading || isLoadingData) {
        return <div className="min-h-screen flex items-center justify-center text-[#5C0124]">Loading submission data...</div>;
    }

    if (!isAuthenticated && !authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <AlertCircle className="h-12 w-12 text-[#5C0124] mb-4" />
                <h2 className="text-xl font-bold text-[#3A0015]">Authentication Required</h2>
                <p className="text-[#3A0015]/60 mb-6">Please log in to submit your project.</p>
                <Link href="/login" className="px-6 py-2 bg-[#5C0124] text-white rounded-lg">Go to Login</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pb-28">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#7A2840]/20">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="p-2 -ml-2 hover:bg-[#7A2840]/10 rounded-full transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6 text-[#5C0124]" />
                        </Link>
                        <h1 className="text-xl font-extrabold text-[#5C0124]">Project Submission</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-[#7A2840]/10 rounded-full transition-colors">
                            <Bell className="h-5 w-5 text-[#8B6F4E]" />
                        </button>
                        <div className="w-9 h-9 bg-[#5C0124] rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-[#E7BB88]">TR</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-sm">Error saving submission</p>
                            <p className="text-xs opacity-80">{error}</p>
                        </div>
                    </div>
                )}

                {/* ─── General Information ─── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-[#5C0124]/10 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <FileText className="h-5 w-5 text-[#5C0124]" />
                        <h2 className="text-lg font-extrabold text-[#3A0015]">General Information</h2>
                    </div>

                    <div className="space-y-5">

                        {/* Project Tagline */}
                        <div>
                            <label className={labelClass}>Project Name</label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="One-liner describing your project..."
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Project Tagline (Short)</label>
                            <input
                                type="text"
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                                placeholder="One-liner describing your project..."
                                className={inputClass}
                            />
                        </div>



                        {/* Detailed Description */}
                        <div>
                            <label className={labelClass}>Detailed Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your project in detail — what it does, how it works, what problems it solves..."
                                rows={5}
                                className={`${inputClass} resize-y`}
                            />
                        </div>

                        {/* Tech Stack */}
                        <div>
                            <label className={labelClass}>Tech Stack</label>
                            <input
                                type="text"
                                value={techStack}
                                onChange={(e) => setTechStack(e.target.value)}
                                placeholder="e.g. Next.js 16 + React 19 + Tailwind + Supabase"
                                className={inputClass}
                            />
                        </div>
                    </div>
                </motion.section>

                {/* ─── Links & Media ─── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-[#5C0124]/10 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Globe className="h-5 w-5 text-[#5C0124]" />
                        <h2 className="text-lg font-extrabold text-[#3A0015]">Links & Media</h2>
                    </div>

                    <div className="space-y-5">
                        {/* GitHub & Demo Video */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>GitHub Repository</label>
                                <div className="relative">
                                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3A0015]/40" />
                                    <input
                                        type="url"
                                        value={githubRepo}
                                        onChange={(e) => setGithubRepo(e.target.value)}
                                        placeholder="https://github.com/..."
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Demo Video URL</label>
                                <div className="relative">
                                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3A0015]/40" />
                                    <input
                                        type="url"
                                        value={demoVideoUrl}
                                        onChange={(e) => setDemoVideoUrl(e.target.value)}
                                        placeholder="https://youtu.be/..."
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Architecture Diagram */}
                        <div>
                            <label className={labelClass}>Architecture Diagram</label>
                            <p className="text-[10px] text-[#3A0015]/60 text-center mb-2">Images Only</p>
                            <input
                                ref={archRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, setArchitectureDiagram)}
                                className="hidden"
                            />
                            {architectureDiagram ? (
                                <div className="flex items-center gap-2 bg-[#F8F9FA] border border-[#7A2840]/20 rounded-xl px-3 py-2">
                                    <span className="text-xs text-[#3A0015] truncate flex-1">{architectureDiagram.name}</span>
                                    {architectureDiagram.preview && (
                                        <img src={architectureDiagram.preview} alt="" className="h-8 w-8 rounded object-cover" />
                                    )}
                                    <button
                                        onClick={() => setArchitectureDiagram(null)}
                                        className="text-red-500 hover:text-red-600 flex-shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => archRef.current?.click()}
                                    className="w-full py-3 border-2 border-dashed border-[#7A2840]/30 rounded-xl text-xs text-[#3A0015]/60 hover:border-[#5C0124] hover:text-[#5C0124] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    Upload Image
                                </button>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* ─── Screenshots ─── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-[#5C0124]/10 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-[#5C0124]" />
                            <h2 className="text-lg font-extrabold text-[#3A0015]">Screenshots (Max 7)</h2>
                        </div>
                        <span className="text-xs text-[#3A0015]/60">{screenshots.length}/7</span>
                    </div>

                    <input
                        ref={screenshotRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleScreenshotUpload}
                        className="hidden"
                    />

                    {/* Screenshot Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {screenshots.map((ss, i) => (
                            <div key={i} className="relative group aspect-video rounded-xl overflow-hidden border border-[#7A2840]/20">
                                <img src={ss.preview} alt={ss.name} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeScreenshot(i)}
                                    className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {screenshots.length < 7 && (
                        <button
                            onClick={() => screenshotRef.current?.click()}
                            className="w-full py-4 border-2 border-dashed border-[#7A2840]/30 rounded-xl text-sm text-[#3A0015]/60 hover:border-[#5C0124] hover:text-[#5C0124] transition-colors flex items-center justify-center gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            Add Screenshots
                        </button>
                    )}
                </motion.section>


                {/* ─── Save Button ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`w-full py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-lg ${saved
                            ? "bg-[#E7BB88] text-[#5C0023]"
                            : "bg-[#5C0124] hover:bg-[#7A2840] text-white"
                            } ${isSaving ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        <Save className="h-5 w-5" />
                        {isSaving ? "Saving..." : saved ? "✓ Saved Successfully!" : "Save Submission"}
                    </button>
                </motion.div>
            </div>

        </div>

    );
}
