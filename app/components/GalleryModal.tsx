"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, ChevronLeft, ZoomIn } from "lucide-react";

interface GalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Sample gallery images (replace with actual uploaded images later)
const sampleImages = [
    { id: 1, src: "/gallery/sample1.jpg", alt: "Team moment 1" },
    { id: 2, src: "/gallery/sample2.jpg", alt: "Team moment 2" },
    { id: 3, src: "/gallery/sample3.jpg", alt: "Team moment 3" },
    { id: 4, src: "/gallery/sample4.jpg", alt: "Team moment 4" },
];

export default function GalleryModal({ isOpen, onClose }: GalleryModalProps) {
    const [images, setImages] = useState(sampleImages);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // Create object URLs for uploaded images
            const newImages = Array.from(files).map((file, index) => ({
                id: Date.now() + index,
                src: URL.createObjectURL(file),
                alt: file.name,
            }));
            setImages([...newImages, ...images]);
        }
    };

    const openFullScreen = (src: string) => {
        setSelectedImage(src);
    };

    const closeFullScreen = () => {
        setSelectedImage(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black"
                >
                    {/* Header */}
                    <div className="bg-gray-900 px-4 py-4 flex items-center justify-between border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-300 transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-white text-lg font-bold">Gallery</h1>
                                <p className="text-cyan-400 text-xs uppercase tracking-wider">Capture the Moment</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-gray-100 min-h-[calc(100vh-64px)] p-4 overflow-y-auto pb-24">
                        {/* Title Section */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-gray-900 text-xl font-bold">Team Gallery</h2>
                                <p className="text-gray-500 text-sm">Upload your team&apos;s best moments</p>
                            </div>
                            <button
                                onClick={handleUpload}
                                className="bg-gray-900 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                <Upload size={16} />
                                Upload
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {/* Image Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {images.map((image, index) => (
                                <motion.div
                                    key={image.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                                    onClick={() => openFullScreen(image.src)}
                                >
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                        <ZoomIn
                                            size={32}
                                            className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {images.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mb-4">
                                    <Upload size={32} className="text-gray-500" />
                                </div>
                                <p className="text-gray-500 text-center">No images yet. Upload your first photo!</p>
                            </div>
                        )}
                    </div>

                    {/* Full Screen Image Viewer */}
                    <AnimatePresence>
                        {selectedImage && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-60 bg-black flex items-center justify-center"
                                onClick={closeFullScreen}
                            >
                                <button
                                    onClick={closeFullScreen}
                                    className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                                >
                                    <X size={32} />
                                </button>
                                <motion.img
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0.8 }}
                                    src={selectedImage}
                                    alt="Full screen view"
                                    className="max-w-full max-h-full object-contain"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
