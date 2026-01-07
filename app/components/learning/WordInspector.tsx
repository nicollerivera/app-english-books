"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Book, Sparkles } from 'lucide-react';
import { WordData } from '@/app/hooks/useDictionary';

interface WordInspectorProps {
    data: WordData | null;
    loading: boolean;
    position: { x: number; y: number } | null;
    onClose: () => void;
}

export function WordInspector({ data, loading, position, onClose }: WordInspectorProps) {
    if (!position) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed z-[100] w-80 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden text-white"
                style={{
                    left: Math.min(position.x, window.innerWidth - 340), // Evitar desborde derecho
                    top: position.y + 20
                }}
            >
                {/* Header con gradiente */}
                <div className="relative p-4 bg-gradient-to-r from-primary/30 to-purple-600/30 border-b border-white/10">
                    <div className="flex justify-between items-start">
                        <div>
                            {loading ? (
                                <div className="h-6 w-24 bg-white/20 animate-pulse rounded" />
                            ) : (
                                <h3 className="text-2xl font-bold font-serif capitalize flex items-center gap-2">
                                    {data?.word}
                                    <Volume2 className="w-4 h-4 text-purple-300 cursor-pointer hover:text-white" />
                                </h3>
                            )}
                            <span className="text-sm text-purple-200 italic">{data?.phonetic}</span>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col gap-3">
                            <div className="h-4 w-full bg-white/10 animate-pulse rounded" />
                            <div className="h-4 w-2/3 bg-white/10 animate-pulse rounded" />
                        </div>
                    ) : (
                        data?.meanings.map((meaning, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                                    <Book className="w-3 h-3" />
                                    {meaning.partOfSpeech}
                                </div>
                                <ul className="space-y-3">
                                    {meaning.definitions.slice(0, 3).map((def, i) => (
                                        <li key={i} className="text-sm text-gray-200 leading-relaxed">
                                            <span className="block mb-1">{def.definition}</span>
                                            {def.example && (
                                                <span className="block text-xs text-purple-300/80 pl-2 border-l-2 border-purple-500/30 italic">
                                                    "{def.example}"
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}

                    <div className="pt-2 border-t border-white/10">
                        <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-purple-300 flex items-center justify-center gap-2 transition-colors">
                            <Sparkles className="w-3 h-3" />
                            Ver más ejemplos (IA)
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
