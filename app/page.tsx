"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, ArrowUpRight, Settings, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState(["", "", "", ""]);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle form submission (no auth for testing)
  const handleLogin = () => {
    setIsLoading(true);
    const enteredPin = pin.join("");

    // Judge PINs
    const judgePins: { [key: string]: string } = {
      "1001": "judge-1",
      "1002": "judge-2",
      "1003": "judge-3",
    };

    let destination = "/dashboard";
    if (enteredPin === "0000") {
      destination = "/admin";
    } else if (judgePins[enteredPin]) {
      destination = "/judge";
      if (typeof window !== "undefined") {
        localStorage.setItem("makeaton_judge_id", judgePins[enteredPin]);
      }
    }

    setTimeout(() => {
      router.push(destination);
    }, 2500);
  };

  // Handle PIN input changes
  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  return (
    <>
      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>

      <div className="min-h-screen flex items-center justify-center bg-burgundy text-gold-light bg-grid-pattern relative overflow-hidden font-sans selection:bg-gold-light/30">

        {/* Animated Background Ambience */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_#A84B60_0%,_transparent_60%)] blur-3xl"
        />

        {/* Rotating Gears (Theme: Industrial/Make-A-Ton) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-5%] text-gold-dark/10 pointer-events-none"
        >
          <Settings size={400} />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-5%] text-gold-dark/10 pointer-events-none"
        >
          <Settings size={300} />
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md bg-burgundy-light rounded-[2rem] shadow-2xl p-8 md:p-10 border border-gold-dark/30 relative z-10 mx-4 backdrop-blur-sm"
        >
          {/* Header */}
          <div className="text-center mb-10 relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -top-6 left-0 h-[1px] bg-gold-dark/30"
            />

            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-gold-light to-gold-medium mb-2 tracking-tight drop-shadow-sm"
            >
              Login
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gold-medium text-sm font-medium tracking-wide"
            >
              Welcome to Make-A-Ton 8.0
            </motion.p>
          </div>

          {/* Form */}
          <div className="space-y-8">
            {/* Username Input */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <label className="text-xs font-bold uppercase tracking-wider text-gold-medium ml-2">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
                  <User className="h-5 w-5 text-gold-medium group-focus-within:text-gold-light" />
                </div>
                <input
                  type="text"
                  placeholder="Enter your username"
                  defaultValue="Team Make-A-Ton"
                  className="w-full bg-black/20 border border-gold-dark/20 text-gold-light rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-gold-medium/50 focus:border-transparent transition-all placeholder:text-gold-dark/40 font-semibold text-lg"
                />
              </div>
            </motion.div>

            {/* PIN Input */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gold-medium ml-2">
                  Password (PIN)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-gold-medium hover:text-gold-light transition-colors p-1"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-between gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    ref={(el) => { pinRefs.current[i] = el; }}
                    type={showPin ? "text" : "password"}
                    maxLength={1}
                    value={pin[i]}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-full aspect-square bg-white/5 text-gold-light text-center text-3xl font-bold rounded-2xl border border-gold-dark/30 outline-none focus:bg-white/10 focus:ring-2 focus:ring-gold-light/50 transition-all shadow-inner focus:scale-105"
                  />
                ))}
              </div>
            </motion.div>

            {/* Login Button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-black hover:bg-black/90 text-gold-light font-bold py-3 pl-8 pr-2 rounded-full flex items-center justify-between transition-colors group mt-6 shadow-xl hover:shadow-gold-light/10 border border-gold-dark/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl tracking-wide">{isLoading ? "Loading..." : "Login"}</span>
              <div className="bg-gold-light text-burgundy rounded-full p-3 group-hover:rotate-45 transition-transform duration-300 shadow-lg">
                <ArrowUpRight className="h-6 w-6 stroke-[3]" />
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Kerala Boat Animation (Right - Moving Up) */}
        <motion.div
          initial={{ y: "100%", opacity: 0, rotate: -90 }}
          animate={{ y: "-100%", opacity: 1, rotate: -90 }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear"
          }}
          className="absolute top-0 right-[2%] md:right-[5%] w-[120px] md:w-[180px] h-auto pointer-events-none opacity-60 z-0"
        >
          <img
            src="/kerala-boat.png"
            alt="Kerala Boat Right"
            className="w-full h-auto drop-shadow-2xl grayscale-[30%] sepia-[20%]"
          />
        </motion.div>

        {/* Kerala Boat Animation (Left - Moving Down) */}
        <motion.div
          initial={{ y: "-100%", opacity: 0, rotate: 90 }}
          animate={{ y: "100%", opacity: 1, rotate: 90 }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            delay: 2 // Offset start time slightly
          }}
          className="absolute top-0 left-[2%] md:left-[5%] w-[120px] md:w-[180px] h-auto pointer-events-none opacity-60 z-0"
        >
          <img
            src="/kerala-boat.png"
            alt="Kerala Boat Left"
            className="w-full h-auto drop-shadow-2xl grayscale-[30%] sepia-[20%]"
          />
        </motion.div>

        {/* Footer / Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="absolute bottom-6 text-gold-dark/50 text-xs text-center w-full z-20"
        >
          &copy; 2026 Make-A-Ton 8.0. All rights reserved.
        </motion.div>
      </div>
    </>
  );
}
