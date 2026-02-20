"use client";

import { useEffect, useState } from "react";

interface ScheduleEvent {
    time: string;   // "HH:MM" 24-hour
    label: string;
    date: string;   // "YYYY-MM-DD"
}

const SCHEDULE: ScheduleEvent[] = [
    // Day 1 — 21 Feb 2026
    { date: "2026-02-21", time: "08:00", label: "Check In" },
    { date: "2026-02-21", time: "11:00", label: "Hacking Starts" },
    { date: "2026-02-21", time: "13:00", label: "Lunch" },
    { date: "2026-02-21", time: "20:00", label: "Dinner" },
    { date: "2026-02-21", time: "22:00", label: "Games" },
    { date: "2026-02-22", time: "00:00", label: "Midnight Snack" },
    // Day 2 — 22 Feb 2026
    { date: "2026-02-22", time: "07:00", label: "Submission Opens" },
    { date: "2026-02-22", time: "10:00", label: "Submission Ends" },
    { date: "2026-02-22", time: "10:30", label: "Judging Starts" },
    { date: "2026-02-22", time: "13:00", label: "Judging Ends" },
    { date: "2026-02-22", time: "13:00", label: "Lunch Starts" },
    { date: "2026-02-22", time: "14:00", label: "Lunch Ends" },
    { date: "2026-02-22", time: "14:30", label: "Valedictory" },
];

const DATE_LABELS: Record<string, string> = {
    "2026-02-21": "Day 1 — February 21, 2026",
    "2026-02-22": "Day 2 — February 22, 2026",
};

function parseEventDateTime(event: ScheduleEvent): Date {
    const [year, month, day] = event.date.split("-").map(Number);
    const [hour, minute] = event.time.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function formatTime(time: string) {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

interface SchedulePageProps {
    theme?: "dark" | "light";
}

export default function SchedulePage({ theme = "light" }: SchedulePageProps) {
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());
        const timer = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    const isDark = theme === "dark";
    const gold = "#D4AF37";

    // Compute states only when mounted (avoid SSR/hydration mismatch)
    const currentTime = now ?? new Date(0); // before mount treat all as future

    const events = SCHEDULE.map((event, index) => {
        const eventTime = parseEventDateTime(event);
        const isPast = now !== null && currentTime >= eventTime;
        return { ...event, index, eventTime, isPast };
    });

    const firstFutureIdx = events.findIndex((e) => !e.isPast);
    // "active" = the event that is currently happening (last past before next upcoming)
    // If all past → last event. If none past → first event.
    const activeIdx =
        firstFutureIdx === -1
            ? events.length - 1
            : Math.max(0, firstFutureIdx - 1);

    // Group by date
    const grouped: { date: string; events: typeof events }[] = [];
    for (const event of events) {
        let group = grouped.find((g) => g.date === event.date);
        if (!group) {
            group = { date: event.date, events: [] };
            grouped.push(group);
        }
        group.events.push(event);
    }

    // Colours
    const pageBg = isDark ? "#3A0015" : "#FDF8F0";
    const textColor = isDark ? "#F4E4BC" : "#3A0015";
    const mutedColor = isDark ? "#C8A97F" : "#7A4055";
    const cardBg = isDark ? "#52001F" : "#FFFFFF";
    const cardBorder = isDark ? "#8A3050" : "#E8D5C0";
    const lineGold = gold;
    const lineDim = isDark ? "#6A1830" : "#E0CFC0";
    const headerChipBg = isDark ? "#5C0124" : "#F4E4BC";

    return (
        <div style={{ minHeight: "100vh", background: pageBg, color: textColor, padding: "32px 16px" }}>
            {/* Header */}
            <div style={{ maxWidth: 640, margin: "0 auto 40px", textAlign: "center" }}>
                <div style={{
                    display: "inline-block", background: gold, color: "#3A0015",
                    padding: "4px 16px", borderRadius: 999, fontSize: 11,
                    fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12,
                }}>
                    Make-a-Ton 8.0
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px" }}>Event Schedule</h1>
                <p style={{ fontSize: 13, color: mutedColor, margin: 0 }}>
                    Live tracking · checkpoints auto-complete as time passes
                </p>

                {/* Clock badge */}
                {now && (
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        marginTop: 16, padding: "8px 18px", borderRadius: 999,
                        background: isDark ? "rgba(212,175,55,0.12)" : "rgba(212,175,55,0.1)",
                        border: `1px solid ${gold}`, color: gold, fontSize: 13, fontWeight: 600,
                    }}>
                        <span style={{
                            display: "inline-block", width: 8, height: 8,
                            borderRadius: "50%", background: gold, animation: "pulse 1.5s infinite",
                        }} />
                        {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        &nbsp;·&nbsp;
                        {now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                )}
            </div>

            {/* Timeline */}
            <div style={{ maxWidth: 640, margin: "0 auto" }}>
                {grouped.map(({ date, events: dayEvents }) => (
                    <div key={date} style={{ marginBottom: 48 }}>
                        {/* Day divider */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                            <div style={{ flex: 1, height: 1, background: cardBorder }} />
                            <span style={{
                                background: headerChipBg, color: textColor,
                                padding: "4px 14px", borderRadius: 999,
                                fontSize: 11, fontWeight: 700,
                                letterSpacing: "0.12em", textTransform: "uppercase",
                            }}>
                                {DATE_LABELS[date] ?? date}
                            </span>
                            <div style={{ flex: 1, height: 1, background: cardBorder }} />
                        </div>

                        {/* Events */}
                        {dayEvents.map((event, i) => {
                            const isActive = event.index === activeIdx;
                            const isNext = event.index === activeIdx + 1;
                            const isPast = event.isPast;
                            const isLast = i === dayEvents.length - 1;

                            const dotSize = isActive ? 44 : 32;
                            const dotBg = isPast ? gold : isActive ? (isDark ? "#3A0015" : "#FDF8F0") : (isDark ? "#2A000F" : "#F4E4BC");
                            const dotBorder = isPast || isActive ? gold : cardBorder;

                            return (
                                <div key={`${date}-${event.time}-${i}`} style={{ display: "flex", gap: 16 }}>
                                    {/* Dot + line column */}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 44 }}>
                                        {/* Top spacer / line */}
                                        <div style={{
                                            width: 2,
                                            height: 20,
                                            background: i === 0 ? "transparent" : (isPast ? lineGold : lineDim),
                                            transition: "background 0.5s",
                                        }} />

                                        {/* Dot */}
                                        <div style={{
                                            width: dotSize,
                                            height: dotSize,
                                            borderRadius: "50%",
                                            background: dotBg,
                                            border: `2px solid ${dotBorder}`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0,
                                            transition: "all 0.4s ease",
                                            position: "relative",
                                            boxShadow: isActive
                                                ? `0 0 0 5px ${isDark ? "rgba(212,175,55,0.18)" : "rgba(212,175,55,0.22)"}, 0 0 20px rgba(212,175,55,0.35)`
                                                : "none",
                                        }}>
                                            {isPast ? (
                                                // Checkmark
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                    <path d="M2.5 7L5.5 10L11.5 4" stroke="#3A0015" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            ) : (
                                                <div style={{
                                                    width: isActive ? 10 : 8,
                                                    height: isActive ? 10 : 8,
                                                    borderRadius: "50%",
                                                    background: isActive ? gold : (isDark ? "#6A1830" : "#C8B0A0"),
                                                }} />
                                            )}
                                        </div>

                                        {/* Bottom line */}
                                        {!isLast && (
                                            <div style={{
                                                width: 2, flex: 1, minHeight: 28,
                                                background: isPast ? lineGold : lineDim,
                                                transition: "background 0.5s",
                                            }} />
                                        )}
                                    </div>

                                    {/* Card */}
                                    <div style={{
                                        flex: 1,
                                        marginBottom: isLast ? 0 : 8,
                                        marginTop: 20,
                                        background: cardBg,
                                        border: `1.5px solid ${isActive ? gold : cardBorder}`,
                                        borderRadius: 16,
                                        padding: "12px 16px",
                                        opacity: isPast ? 0.65 : 1,
                                        transform: isActive ? "scale(1.02)" : "scale(1)",
                                        transition: "all 0.4s ease",
                                        boxShadow: isActive
                                            ? "0 4px 24px rgba(212,175,55,0.18)"
                                            : isNext
                                                ? "0 2px 8px rgba(0,0,0,0.08)"
                                                : "none",
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                            <div>
                                                <p style={{
                                                    margin: 0, fontWeight: 700, fontSize: 15,
                                                    color: isActive ? gold : textColor,
                                                }}>
                                                    {event.label}
                                                </p>
                                                {isActive && (
                                                    <p style={{ margin: "3px 0 0", fontSize: 11, fontWeight: 600, color: gold }}>
                                                        Happening now
                                                    </p>
                                                )}
                                                {!isActive && isNext && (
                                                    <p style={{ margin: "3px 0 0", fontSize: 11, color: mutedColor }}>Up next</p>
                                                )}
                                                {isPast && (
                                                    <p style={{ margin: "3px 0 0", fontSize: 11, color: mutedColor }}>Completed</p>
                                                )}
                                            </div>
                                            <p style={{
                                                margin: 0, fontWeight: 700, fontSize: 13,
                                                color: isPast || isActive ? gold : mutedColor,
                                                whiteSpace: "nowrap",
                                                fontVariantNumeric: "tabular-nums",
                                            }}>
                                                {formatTime(event.time)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <p style={{ textAlign: "center", fontSize: 11, color: mutedColor, marginTop: 24 }}>
                * Schedule is tentative and subject to change
            </p>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}
