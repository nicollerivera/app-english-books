"use client";

import { useEffect, useState, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePDFStore } from "../../stores/usePDFStore";
import TeacherPanel from "../learning/TeacherPanel";
import { Flag } from 'lucide-react';
import { saveProgress, loadProgress } from '@/app/lib/storage';

export default function CustomReader() {
    const { pages, pageNumber, setPageNumber, numPages, currentBookId } = usePDFStore();
    const [selectedText, setSelectedText] = useState<string | null>(null);

    const [isInitialized, setIsInitialized] = useState(false);

    // Cargar progreso al iniciar
    useEffect(() => {
        if (currentBookId) {
            loadProgress(currentBookId).then(savedPage => {
                if (savedPage > 1) {
                    setPageNumber(savedPage);
                }
                setIsInitialized(true);
            });
        }
    }, [currentBookId]); // Se ejecuta al montar o cambiar de libro

    // Guardar progreso automáticamente
    useEffect(() => {
        if (currentBookId && isInitialized) {
            saveProgress(currentBookId, pageNumber);
        }
    }, [pageNumber, currentBookId, isInitialized]);

    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            const text = selection.toString().trim();
            // Solo activar si es una selección "intencional" (más de 2 letras)
            if (text.length > 2) {
                setSelectedText(text);
            }
        }
    };

    const currentPage = pages[pageNumber - 1];

    const goPrev = () => {
        if (pageNumber > 1) setPageNumber(pageNumber - 1);
    };
    const goNext = () => {
        if (pageNumber < (numPages ?? 0)) setPageNumber(pageNumber + 1);
    };

    return (
        <div className="relative min-h-screen bg-[#f3e5d0] text-gray-900 font-serif flex overflow-hidden flex-col md:flex-row">

            {/* Área Principal del Libro (Dinámica) */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 transition-all duration-500">

                {/* Visual Progress Bar (Constraint to book width) */}
                <div className="w-full max-w-4xl mb-4 flex items-center justify-between px-2 gap-3">
                    <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-green-400 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${numPages ? (pageNumber / numPages) * 100 : 0}%` }}
                        />
                    </div>

                    <div className="flex items-center gap-1 min-w-[3.5rem] justify-end">
                        <span className="text-xs font-bold text-gray-500 font-sans">
                            {numPages ? Math.round((pageNumber / numPages) * 100) : 0}%
                        </span>
                        <Flag
                            className={`w-4 h-4 transition-colors duration-500 ${(numPages && pageNumber === numPages) ? 'text-green-500 fill-green-500 animate-bounce' : 'text-gray-300'
                                }`}
                        />
                    </div>
                </div>

                <div className="relative w-full max-w-4xl h-[85vh] flex shadow-2xl rounded-lg overflow-hidden bg-[#fffdf9]">

                    {/* Botón Anterior */}
                    <button
                        onClick={goPrev}
                        disabled={pageNumber <= 1}
                        className="hidden md:flex flex-col justify-center items-center w-12 bg-[#eaddcf] hover:bg-[#e0d0bd] transition-colors border-r border-[#d4c5b3] z-10 disabled:opacity-50"
                    >
                        <span className="text-xl text-gray-600">←</span>
                    </button>

                    {/* Contenido de Página */}
                    <div
                        className="flex-1 relative p-8 md:p-16 overflow-y-auto custom-scrollbar"
                        onMouseUp={handleTextSelection} // Detectar selección aquí
                        onTouchEnd={handleTextSelection} // Soporte móvil básico
                    >
                        {/* Header Decoration */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-50" />

                        {currentPage && isInitialized ? (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={pageNumber}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="prose prose-xl max-w-none text-gray-800 leading-relaxed text-justify tracking-wide selection:bg-purple-200 selection:text-purple-900"
                                >
                                    <div className="mb-6 text-center text-gray-400 text-xs uppercase tracking-widest font-sans select-none">
                                        Página {pageNumber}
                                    </div>

                                    {/* Renderizado de Texto Natural para permitir selección de frases */}
                                    <div className="whitespace-pre-line">
                                        {currentPage.text}
                                    </div>

                                </motion.div>
                            </AnimatePresence>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <p className="text-xl animate-pulse font-sans">Cargando...</p>
                            </div>
                        )}
                    </div>

                    {/* Botón Siguiente */}
                    <button
                        onClick={goNext}
                        disabled={pageNumber >= (numPages ?? 0) || !isInitialized}
                        className="hidden md:flex flex-col justify-center items-center w-12 bg-[#eaddcf] hover:bg-[#e0d0bd] transition-colors border-l border-[#d4c5b3] z-10 disabled:opacity-50"
                    >
                        <span className="text-xl text-gray-600">→</span>
                    </button>
                </div>

                {/* Controles Móviles */}
                <div className="md:hidden flex gap-4 mt-4">
                    <button onClick={goPrev} disabled={pageNumber <= 1 || !isInitialized} className="px-4 py-2 bg-white rounded shadow text-sm">Prev</button>
                    <span className="text-sm font-bold flex items-center">{pageNumber} / {numPages}</span>
                    <button onClick={goNext} disabled={pageNumber >= (numPages ?? 0) || !isInitialized} className="px-4 py-2 bg-white rounded shadow text-sm">Next</button>
                </div>
            </div>

            {/* Panel Lateral "Mini Maestro" */}
            <div className="w-80 hidden lg:block h-screen sticky top-0 z-20 border-l border-[#eaddcf]">
                <TeacherPanel selectedText={selectedText} />
            </div>

            {/* Overlay para Móvil del Maestro (cuando se selecciona texto) */}
            {selectedText && (
                <div className="lg:hidden fixed inset-x-0 bottom-0 h-[50vh] z-50 rounded-t-2xl overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
                    <div className="absolute top-2 right-2 z-50">
                        <button onClick={() => setSelectedText(null)} className="bg-gray-200 rounded-full p-1 text-gray-600">✕</button>
                    </div>
                    <TeacherPanel selectedText={selectedText} />
                </div>
            )}

        </div>
    );
}
