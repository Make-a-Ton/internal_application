'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TARGET_DATE = new Date('2026-02-22T11:00:00+05:30').getTime(); // Assuming IST based on context

export default function CountdownTimer({ teamName }: { teamName: string }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = TARGET_DATE - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft();

        return () => clearInterval(timer);
    }, []);

    const TimeUnit = ({ value, label }: { value: number, label: string }) => (
        <div className="flex flex-col items-center mx-2 md:mx-4">
            <span className="text-2xl md:text-4xl font-black text-[#D4AF37] tabular-nums">
                {String(value).padStart(2, '0')}
            </span>
            <span className="text-[10px] md:text-xs text-[#E7BB88] uppercase tracking-widest mt-1">
                {label}
            </span>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-6 md:py-8"
        >
            <p className="text-[#C09B6E] text-[25px] md:text-3xl uppercase tracking-widest mb-1">Welcome</p>
            <h1 className="text-[35px] md:text-5xl font-black text-[#F4E4BC] bg-clip-text text-transparent bg-gradient-to-b from-[#F4E4BC] to-[#D4AF37] px-4">
                {teamName}
            </h1>
            <br/>
            <h3 className="text-[#C09B6E] text-xs md:text-xl font-bold uppercase tracking-[0.2em] mb-4 text-center">
                CODING ENDS IN
            </h3>

            <div className="flex items-center justify-center bg-[#3A0015]/40 backdrop-blur-sm border border-[#D4AF37]/20 rounded-2xl p-4 md:p-6 shadow-xl">
                <TimeUnit value={timeLeft.days} label="Days" />
                <span className="text-xl md:text-3xl font-bold text-[#5C0124] -mt-4">:</span>
                <TimeUnit value={timeLeft.hours} label="Hours" />
                <span className="text-xl md:text-3xl font-bold text-[#5C0124] -mt-4">:</span>
                <TimeUnit value={timeLeft.minutes} label="Mins" />
                <span className="text-xl md:text-3xl font-bold text-[#5C0124] -mt-4">:</span>
                <TimeUnit value={timeLeft.seconds} label="Secs" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-center"
            >

            </motion.div>
        </motion.div>
    );
}
