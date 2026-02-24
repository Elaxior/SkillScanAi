'use client';

/**
 * ProcessingLayout — full-screen analysis processing view.
 * Matches the "Performance Grid" reference design:
 *   • Left sidebar   (Scout Mode navigation)
 *   • Centre panel   (animated progress + biomechanics stats)
 *   • Right panel    (live data stream log)
 *   • Bottom bar     (stage + elapsed time + progress bar)
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogEntry {
    time: string;
    message: string;
}

export interface ProcessingLayoutProps {
    progress: number; // 0–100
    stage: string;
    startTime: number | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    { icon: '⚗️', label: 'Analyze', active: true },
    { icon: '🕑', label: 'History', active: false },
    { icon: '🎯', label: 'Scouting', active: false },
    { icon: '⚙️', label: 'Settings', active: false },
];

const STAGE_LOGS: Record<string, string[]> = {
    'Loading Pose Model': [
        'INIT_MEDIAPIPE_MODEL_V2... OK',
        'LOADING_POSE_WEIGHTS... OK',
        'WASM_BACKEND: INITIALIZED',
        'POSE_DETECTOR: READY',
    ],
    'Detecting Pose': [
        'SYNC_POSE_RECOGNITION: DETECTING_33_JOINTS',
        'CALCULATING_TORQUE_VECTOR: [X: 0.12, Y: 0.90, Z: -0.44]',
        'WRITING_FRAME_BUFFER_0x229AF...',
        'KINEMATIC_RECONSTRUCTION: IN_PROGRESS',
    ],
    'Detecting Keyframes': [
        'KEYFRAME_DETECTION: SCANNING',
        'PEAK_FRAME: IDENTIFIED',
        'RELEASE_POINT: LOCKED',
        'SEQUENCE_MAPPED',
    ],
    'Extracting Metrics': [
        'METRIC_PIPELINE: ACTIVE',
        'ANGULAR_VELOCITY_CALC: 142.4_DEG/S',
        'JOINT_FLEXION: MEASURED',
        'BIOMECH_INDEX: COMPUTED',
    ],
    'Calculating Score': [
        'SCORING_ENGINE: RUNNING',
        'WEIGHTED_METRICS: 8_DIMENSIONS',
        'FORM_SCORE: CALCULATED',
        'BALANCE_INDEX: EVALUATED',
    ],
    'Analyzing Form': [
        'FLAW_DETECTION: ACTIVE',
        'INJURY_RISK_SCAN: IN_PROGRESS',
        'PATTERN_MATCH: 94%_CONFIDENCE',
        'AI_COACH_CONTEXT: BUILDING',
        'KINEMATIC_RECONSTRUCTION: 88% COMPLETE',
    ],
    'Initializing': [
        'BOOT_SEQUENCE: STARTING',
        'CHECKING_VIDEO_BUFFER...',
        'PIPELINE_INIT: OK',
        'AWAITING_INPUT...',
    ],
};

const PERIODIC_MSGS = [
    'REFRESHING_SENSOR_MESH...',
    '>> UPLOADING_TELEMETRY_BATCH_B7...',
    'BUFFER_SYNC: OK',
    'CHECKPOINT: SAVED',
    '>> OPTIMIZING_MESH_GRID_TOPOLOGY...',
    'FETCHING_BIO_HISTORICAL_DATA: MATCH_FOUND_94',
    'ERROR_RECOVERY: RETRYING_SOCKET_5... SUCCESS',
    '>> PIPELINE: ACTIVE',
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ProcessingLayout({ progress, stage, startTime }: ProcessingLayoutProps) {
    const [elapsed, setElapsed] = useState(0);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const logRef = useRef<HTMLDivElement>(null);
    const periodicCounterRef = useRef(0);
    const prevStageRef = useRef('');

    // ── Elapsed timer ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!startTime) return;
        const iv = setInterval(() => setElapsed((Date.now() - startTime) / 1000), 100);
        return () => clearInterval(iv);
    }, [startTime]);

    // ── Stage → log entries ────────────────────────────────────────────────────
    useEffect(() => {
        if (stage === prevStageRef.current) return;
        prevStageRef.current = stage;

        const messages = STAGE_LOGS[stage] ?? ['PROCESSING: IN_PROGRESS'];
        const timeStr = nowTime();
        setLogs((prev) =>
            [...prev, ...messages.map((m) => ({ time: timeStr, message: m }))].slice(-30),
        );
    }, [stage]);

    // ── Periodic "activity" logs ───────────────────────────────────────────────
    useEffect(() => {
        if (!startTime) return;
        const iv = setInterval(() => {
            const msg = PERIODIC_MSGS[periodicCounterRef.current % PERIODIC_MSGS.length];
            periodicCounterRef.current++;
            setLogs((prev) => [...prev, { time: nowTime(), message: msg }].slice(-30));
        }, 1_400);
        return () => clearInterval(iv);
    }, [startTime]);

    // ── Auto-scroll log ────────────────────────────────────────────────────────
    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [logs]);

    // ── Derived stats (vary slightly with progress to look "live") ─────────────
    const latency = 12;
    const syncDepth = Math.min(99.9, 95 + progress * 0.049).toFixed(1);
    const sensors = (1200 + Math.round(progress * 4)).toLocaleString();

    return (
        <div className="fixed inset-0 bg-[#080b10] flex flex-col z-40 overflow-hidden">
            {/* ── Three-panel row ─────────────────────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden min-h-0">

                {/* ─ Left Sidebar ─────────────────────────────────────────────────── */}
                <aside className="w-44 shrink-0 bg-[#0d1219] border-r border-white/[0.06] flex flex-col">
                    {/* Mode header */}
                    <div className="px-4 py-5 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2.5 mb-0.5">
                            <div className="w-7 h-7 rounded bg-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] text-sm leading-none">⚗</div>
                            <span className="text-white text-sm font-bold tracking-widest uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                                Scout Mode
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-600 ml-9 tracking-wider uppercase">Elite Tracking</p>
                    </div>

                    {/* Nav items */}
                    <nav className="flex-1 px-3 py-4 space-y-0.5">
                        {NAV_ITEMS.map((item) => (
                            <div
                                key={item.label}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm select-none transition-colors ${item.active
                                        ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                                        : 'text-gray-600 hover:text-gray-400 cursor-default'
                                    }`}
                            >
                                <span className="text-base leading-none">{item.icon}</span>
                                <span className="tracking-wide font-medium">{item.label}</span>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* ─ Main Content ──────────────────────────────────────────────────── */}
                <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-8">
                    {/* Dot grid background */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.025]"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, #F59E0B 1px, transparent 0)',
                            backgroundSize: '36px 36px',
                        }}
                    />

                    {/* Tracking ID badge */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                        <span className="text-[10px] tracking-widest text-gray-400 font-mono">
                            TRACKING_ID: #X-{Math.floor(800 + progress * 3)}
                        </span>
                    </div>

                    {/* Hexagon ring + icon */}
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative flex items-center justify-center mb-6">
                            {/* Outer slow-spin ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                                className="absolute rounded-full border border-dashed border-[#F59E0B]/15"
                                style={{ width: 156, height: 156 }}
                            />
                            {/* Inner counter-spin ring */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                                className="absolute rounded-full border border-[#F59E0B]/10"
                                style={{ width: 128, height: 128 }}
                            />
                            {/* Icon container */}
                            <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-[#F59E0B]/10 via-transparent to-transparent border border-[#F59E0B]/25 flex items-center justify-center">
                                <motion.span
                                    animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
                                    transition={{ duration: 2.4, repeat: Infinity }}
                                    className="text-[#F59E0B] text-4xl leading-none select-none"
                                >
                                    🔬
                                </motion.span>
                            </div>
                        </div>

                        {/* PROCESSING label + % */}
                        <p
                            className="text-[9px] tracking-[0.4em] text-gray-600 mb-1.5 uppercase"
                            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                        >
                            PROCESSING
                        </p>
                        <motion.p
                            key={Math.round(progress / 2)}
                            initial={{ opacity: 0.6, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[56px] font-black text-white leading-none tabular-nums mb-3"
                            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                        >
                            {Math.round(progress)}%
                        </motion.p>

                        {/* Heading */}
                        <h2 className="text-xl text-white font-semibold tracking-wide mb-4">
                            Analyzing Biomechanics...
                        </h2>

                        {/* Status pill badges */}
                        <div className="flex gap-2.5 mb-3 flex-wrap justify-center">
                            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                                <span className="text-[11px] text-gray-300">{stage}...</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1">
                                <span className="text-[#F59E0B] text-[11px] leading-none">⚡</span>
                                <span className="text-[11px] text-gray-300">Calculating Joint Angles...</span>
                            </div>
                        </div>

                        <p
                            className="text-[9px] tracking-[0.3em] text-gray-700 mb-8 uppercase"
                            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                        >
                            Powered by On-Device Biomechanical AI
                        </p>

                        {/* Stats row */}
                        <div className="flex gap-5">
                            {[
                                { label: 'LATENCY', value: `${latency}ms` },
                                { label: 'SYNC DEPTH', value: `${syncDepth}%` },
                                { label: 'SENSORS', value: sensors },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    className="text-center bg-white/[0.03] border border-white/[0.07] rounded-lg px-5 py-3 min-w-[92px]"
                                >
                                    <p
                                        className="text-[8px] tracking-[0.25em] text-gray-600 mb-1 uppercase"
                                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                                    >
                                        {s.label}
                                    </p>
                                    <p
                                        className="text-lg font-bold text-white tabular-nums"
                                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                                    >
                                        {s.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* ─ Right Panel – Live Data Stream ───────────────────────────────── */}
                <aside className="w-64 shrink-0 bg-[#0d1219] border-l border-white/[0.06] flex flex-col">
                    {/* Header */}
                    <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span
                                className="text-[9px] tracking-[0.25em] text-gray-300 uppercase"
                                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                            >
                                Live Data Stream
                            </span>
                        </div>
                        <span className="text-[9px] text-gray-600 bg-white/[0.05] px-1.5 py-0.5 rounded font-mono">
                            v4.2.0-stable
                        </span>
                    </div>

                    {/* Log scroll area */}
                    <div
                        ref={logRef}
                        className="flex-1 overflow-y-auto px-3 py-3 space-y-1 font-mono text-[10px] scrollbar-none"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {logs.map((entry, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="leading-relaxed break-all"
                            >
                                <span className="text-gray-700">[{entry.time}]&nbsp;</span>
                                <span
                                    className={
                                        entry.message.startsWith('>>')
                                            ? 'text-gray-600'
                                            : entry.message.match(/OK|READY|SAVED|COMPLETE|SUCCESS/)
                                                ? 'text-green-400'
                                                : entry.message.match(/ERROR/)
                                                    ? 'text-red-400'
                                                    : entry.message.match(/%|SCORE|FORM|VELOCITY/)
                                                        ? 'text-[#F59E0B]'
                                                        : 'text-gray-400'
                                    }
                                >
                                    {entry.message}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </aside>
            </div>

            {/* ── Bottom progress bar ────────────────────────────────────────────── */}
            <div className="h-10 shrink-0 bg-[#0d1219] border-t border-white/[0.06] flex items-center px-5 gap-3">
                <span className="text-[11px] text-gray-400">{stage}...</span>
                <span className="text-[11px] text-gray-600">{elapsed.toFixed(1)}s elapsed</span>
                <div className="flex-1 h-[3px] bg-white/[0.06] rounded-full overflow-hidden mx-2">
                    <motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(to right, #F59E0B, #D97706)' }}
                    />
                </div>
                <span
                    className="text-sm font-bold text-[#F59E0B] tabular-nums min-w-[38px] text-right"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                    {Math.round(progress)}%
                </span>
            </div>
        </div>
    );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function nowTime() {
    return new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}
