"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, MessageCircle } from 'lucide-react';

import { explainText } from '@/app/actions';

interface TeacherPanelProps {
    selectedText: string | null;
}

export default function TeacherPanel({ selectedText }: TeacherPanelProps) {
    const [explanation, setExplanation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedText) {
            setExplanation(null);
            return;
        }

        const fetchExplanation = async () => {
            setLoading(true);
            setExplanation(null);

            try {
                const result = await explainText(selectedText);
                setExplanation(result.data); // data contiene el markdown o el mensaje de error
            } catch (err) {
                setExplanation("Error inesperado al consultar al maestro.");
            } finally {
                setLoading(false);
            }
        };

        fetchExplanation();
    }, [selectedText]);

    if (!selectedText) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center border-l border-gray-100 bg-[#fffdf9]">
                <BookOpen className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm font-medium">Selecciona una frase del libro para que tu Mini Maestro te la explique.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white border-l border-gray-200 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center gap-2 shadow-md">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-lg">Mini Maestro</h3>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#f8f9fa]">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-40 space-y-3"
                        >
                            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-purple-600 font-medium animate-pulse">Analizando contexto...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="prose prose-sm max-w-none"
                        >
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Frase seleccionada</p>
                                <p className="text-lg text-gray-800 font-serif italic border-l-4 border-purple-400 pl-3">
                                    "{selectedText}"
                                </p>
                            </div>

                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h4 className="flex items-center gap-2 text-purple-700 font-bold mb-3">
                                    <MessageCircle className="w-4 h-4" /> Explicación
                                </h4>
                                <div className="text-gray-700 leading-relaxed space-y-2 whitespace-pre-line">
                                    {explanation}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
