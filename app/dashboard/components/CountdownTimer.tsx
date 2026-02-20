"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
    teamName: string;
}

export default function CountdownTimer({ teamName }: CountdownTimerProps) {
    // Set target date for the hackathon end. Just an example target date here:
    // Update to the actual hackathon end time as needed.
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Official countdown target: Feb 22, 2026 at 11:00 AM (submission deadline)
        const targetDate = new Date(2026, 1, 22, 11, 0, 0, 0); // month is 0-indexed

        const timer = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference <= 0) {
                clearInterval(timer);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            } else {
                setTimeLeft({
                    hours: Math.floor(difference / (1000 * 60 * 60)),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!mounted) {
        return <div className="animate-pulse h-24 bg-white/5 rounded-xl mt-4"></div>;
    }

    return (
        <div className="relative mt-4 bg-black/20 p-5 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden flex flex-col items-center">
            {/* Theming matched to Dashboard: text-[#F4E4BC] accents text-[#D4AF37] text-[#C09B6E] */}
            <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-[#E7BB88] uppercase tracking-widest">Time Remaining</h3>
            </div>

            <div className="flex items-center gap-4 text-center">
                <div className="flex flex-col items-center">
                    <span className="text-4xl md:text-5xl font-black text-[#F4E4BC] tracking-tight tabular-nums">
                        {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] text-[#C09B6E] uppercase font-bold tracking-wider mt-1">Hours</span>
                </div>

                <span className="text-3xl font-black text-[#7A2840] -translate-y-2">:</span>

                <div className="flex flex-col items-center">
                    <span className="text-4xl md:text-5xl font-black text-[#F4E4BC] tracking-tight tabular-nums">
                        {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] text-[#C09B6E] uppercase font-bold tracking-wider mt-1">Minutes</span>
                </div>

                <span className="text-3xl font-black text-[#7A2840] -translate-y-2">:</span>

                <div className="flex flex-col items-center">
                    <span className="text-4xl md:text-5xl font-black text-[#F4E4BC] tracking-tight tabular-nums opacity-90">
                        {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] text-[#C09B6E] uppercase font-bold tracking-wider mt-1">Seconds</span>
                </div>
            </div>

            <p className="text-xs text-[#E7BB88]/60 mt-4 font-medium italic">
                {teamName !== "..." ? `Keep building, ${teamName}!` : "Keep building!"}
            </p>
        </div>
    );
}
