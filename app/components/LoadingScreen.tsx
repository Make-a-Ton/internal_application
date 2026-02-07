"use client";

import { motion } from "framer-motion";

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Full-Screen Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src="/Boat_Animation_Generated.mp4" type="video/mp4" />
            </video>

            {/* Darker Overlay for Better Text Readability */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Loading Content Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-10"
            >
                {/* Loading Animation Video */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden"
                >
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover mix-blend-screen"
                    >
                        <source src="/loading.mp4" type="video/mp4" />
                    </video>
                </motion.div>

                {/* Logo Text */}
                <motion.h1
                    animate={{
                        scale: [1, 1.02, 1],
                        opacity: [0.9, 1, 0.9]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-gold-light to-gold-medium drop-shadow-2xl mt-6"
                >
                    Make-A-Ton
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gold-light text-xl md:text-2xl font-bold mt-1 drop-shadow-lg"
                >
                    8.0
                </motion.p>

                <motion.p
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-gold-light/90 text-sm mt-6 tracking-widest uppercase font-semibold drop-shadow-md"
                >
                    Loading Dashboard...
                </motion.p>
            </motion.div>
        </div>
    );
}
