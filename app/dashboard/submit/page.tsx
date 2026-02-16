"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
    ChevronLeft, Bell, FileText, Globe, Image as ImageIcon,
    Link2, Github, Video, Upload, X, Save
} from "lucide-react";
import Link from "next/link";
import BottomNav from "../../components/BottomNav";

interface FileUpload {
    name: string;
    preview?: string;
    file: File;
}

export default function SubmitProjectPage() {
    // General Information
    const [projectName, setProjectName] = useState("");
    const [submissionTitle, setSubmissionTitle] = useState("");
    const [tagline, setTagline] = useState("");
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

    const archRef = useRef<HTMLInputElement>(null);
    const slidesRef = useRef<HTMLInputElement>(null);
    const screenshotRef = useRef<HTMLInputElement>(null);

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
        const remaining = 6 - screenshots.length;
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

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const inputClass = "w-full px-4 py-3 bg-[#3A0015] border border-[#7A2840] rounded-xl text-[#F4E4BC] text-sm placeholder-[#C09B6E]/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all";
    const labelClass = "block text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-2 text-center";

    return (
        <div className="min-h-screen bg-[#5C0124] pb-28">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#5C0124] border-b border-[#7A2840]">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="p-2 -ml-2 hover:bg-[#7A2840] rounded-full transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6 text-[#D4AF37]" />
                        </Link>
                        <h1 className="text-xl font-extrabold text-[#F4E4BC]">Project Submission</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-[#7A2840] rounded-full transition-colors">
                            <Bell className="h-5 w-5 text-[#C09B6E]" />
                        </button>
                        <div className="w-9 h-9 bg-[#7A2840] rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-[#D4AF37]">TR</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
                {/* ─── General Information ─── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#7A2840]/50 rounded-2xl p-6 border border-[#7A2840]"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <FileText className="h-5 w-5 text-[#D4AF37]" />
                        <h2 className="text-lg font-extrabold text-[#F4E4BC]">General Information</h2>
                    </div>

                    <div className="space-y-5">
                        {/* Project Name */}
                        <div>
                            <label className={labelClass}>Project Name</label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="e.g. AutoFlow"
                                className={inputClass}
                            />
                        </div>

                        {/* Submission Title */}
                        <div>
                            <label className={labelClass}>Submission Title</label>
                            <input
                                type="text"
                                value={submissionTitle}
                                onChange={(e) => setSubmissionTitle(e.target.value)}
                                placeholder="A descriptive title for your submission..."
                                className={inputClass}
                            />
                        </div>

                        {/* Project Tagline */}
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
                    className="bg-[#7A2840]/50 rounded-2xl p-6 border border-[#7A2840]"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Globe className="h-5 w-5 text-[#D4AF37]" />
                        <h2 className="text-lg font-extrabold text-[#F4E4BC]">Links & Media</h2>
                    </div>

                    <div className="space-y-5">
                        {/* GitHub & Demo Video — side by side */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>GitHub Repository</label>
                                <div className="relative">
                                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C09B6E]/50" />
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
                                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C09B6E]/50" />
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

                        {/* Architecture Diagram & Presentation Slides */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Architecture Diagram */}
                            <div>
                                <label className={labelClass}>Architecture Diagram</label>
                                <p className="text-[10px] text-[#C09B6E]/70 text-center mb-2">Images Only</p>
                                <input
                                    ref={archRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, setArchitectureDiagram)}
                                    className="hidden"
                                />
                                {architectureDiagram ? (
                                    <div className="flex items-center gap-2 bg-[#3A0015] border border-[#7A2840] rounded-xl px-3 py-2">
                                        <span className="text-xs text-[#F4E4BC] truncate flex-1">{architectureDiagram.name}</span>
                                        {architectureDiagram.preview && (
                                            <img src={architectureDiagram.preview} alt="" className="h-8 w-8 rounded object-cover" />
                                        )}
                                        <button
                                            onClick={() => setArchitectureDiagram(null)}
                                            className="text-red-400 hover:text-red-300 flex-shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => archRef.current?.click()}
                                        className="w-full py-3 border-2 border-dashed border-[#7A2840] rounded-xl text-xs text-[#C09B6E] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload Image
                                    </button>
                                )}
                            </div>

                            {/* Presentation Slides */}
                            <div>
                                <label className={labelClass}>Presentation Slides</label>
                                <p className="text-[10px] text-[#C09B6E]/70 text-center mb-2">PDF Only</p>
                                <input
                                    ref={slidesRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => handleFileUpload(e, setPresentationSlides)}
                                    className="hidden"
                                />
                                {presentationSlides ? (
                                    <div className="flex items-center gap-2 bg-[#3A0015] border border-[#7A2840] rounded-xl px-3 py-2">
                                        <span className="text-xs text-[#F4E4BC] truncate flex-1">{presentationSlides.name}</span>
                                        <button
                                            onClick={() => setPresentationSlides(null)}
                                            className="text-red-400 hover:text-red-300 flex-shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => slidesRef.current?.click()}
                                        className="w-full py-3 border-2 border-dashed border-[#7A2840] rounded-xl text-xs text-[#C09B6E] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload PDF
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* ─── Screenshots ─── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#7A2840]/50 rounded-2xl p-6 border border-[#7A2840]"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-[#D4AF37]" />
                            <h2 className="text-lg font-extrabold text-[#F4E4BC]">Screenshots (Max 6)</h2>
                        </div>
                        <span className="text-xs text-[#C09B6E]">{screenshots.length}/6</span>
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
                            <div key={i} className="relative group aspect-video rounded-xl overflow-hidden border border-[#7A2840]">
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

                    {screenshots.length < 6 && (
                        <button
                            onClick={() => screenshotRef.current?.click()}
                            className="w-full py-4 border-2 border-dashed border-[#7A2840] rounded-xl text-sm text-[#C09B6E] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-2"
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
                            : "bg-[#D4AF37] hover:bg-[#C09B6E] text-[#3A0015]"
                            } ${isSaving ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        <Save className="h-5 w-5" />
                        {isSaving ? "Saving..." : saved ? "✓ Saved Successfully!" : "Save Submission"}
                    </button>
                </motion.div>
            </div>

            <BottomNav />
        </div>
    );
}
