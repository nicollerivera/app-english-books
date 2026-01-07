"use client";

import { useState, useCallback } from 'react';
import { usePDFStore } from '@/app/stores/usePDFStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';
import CustomReader from './CustomReader';
import '@/app/styles/inspector.css';

export default function PDFViewer({ onWordSelect }: { onWordSelect: (word: string) => void }) {
    const { file, setNumPages, loadPdf, isProcessing } = usePDFStore();
    // Siempre modo lectura inmersiva (CustomReader)

    async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { files } = event.target;
        if (files && files[0]) {
            await loadPdf(files[0]);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen z-10 relative w-full font-serif transition-colors">
            {/* Loading Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white"
                    >
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6" />
                        <h3 className="text-2xl font-bold">Preparando tu libro...</h3>
                        <p className="text-gray-300 mt-2">Extrayendo texto y formateando páginas.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {!file ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-8 p-12 max-w-lg text-center"
                >
                    <div className="relative group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                        <label className="relative block bg-white hover:bg-gray-50 text-gray-800 p-8 rounded-full shadow-2xl transition-transform transform group-hover:scale-105 cursor-pointer border border-gray-100">
                            <Upload className="w-10 h-10 text-gray-600 mb-2 mx-auto" />
                            <span className="font-bold text-lg">Abrir Libro</span>
                            <input type="file" accept=".pdf" onChange={onFileChange} className="hidden" />
                        </label>
                    </div>
                    <div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Tu Biblioteca Inmersiva</h2>
                        <p className="text-gray-600 text-lg">Suelta las cargas del día y sumérgete en una interactiva historia.</p>
                    </div>
                </motion.div>
            ) : (
                <div className="w-full h-full relative">
                    {/* El CustomReader maneja toda la experiencia de lectura ahora */}
                    <CustomReader />

                    {/* Botón flotante discreto para cambiar de libro si se desea */}
                    <div className="fixed bottom-4 left-4 z-50 opacity-20 hover:opacity-100 transition-opacity">
                        <label className="cursor-pointer bg-black/50 text-white p-2 rounded-full hover:bg-black/80 flex items-center gap-2 text-xs backdrop-blur-md">
                            <Upload className="w-4 h-4" />
                            <span className="hidden md:inline">Cambiar Libro</span>
                            <input type="file" accept=".pdf" onChange={onFileChange} className="hidden" />
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}
