// app/components/reader/ProgressBar.tsx
"use client";

import { motion } from "framer-motion";

/**
 * Simple top progress bar that fills based on percentage.
 * Uses framer-motion for a smooth gradient fill animation.
 */
export default function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className="fixed top-0 left-0 right-0 h-2 bg-gray-800/50 z-20">
            <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            />
        </div>
    );
}
