"use client";

import { useState, useEffect } from 'react';
import { usePDFStore } from '@/app/stores/usePDFStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Book, Trash2, Plus } from 'lucide-react';
import CustomReader from './CustomReader';
import '@/app/styles/inspector.css';
import { getLibrary, saveBook, loadBookData, deleteBook, BookMetadata } from '@/app/lib/storage';

export default function PDFViewer({ onWordSelect }: { onWordSelect: (word: string) => void }) {
    const { file, loadPdf, isProcessing } = usePDFStore();
    const [books, setBooks] = useState<BookMetadata[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);

    useEffect(() => {
        loadLibrary();
    }, []);

    const loadLibrary = async () => {
        try {
            const library = await getLibrary();
            setBooks(library);
        } catch (error) {
            console.error("Failed to load library", error);
        } finally {
            setIsLoadingLibrary(false);
        }
    };

    async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { files } = event.target;
        if (files && files[0]) {
            const newMetadata = await saveBook(files[0]);
            setBooks(prev => [newMetadata, ...prev]);
            usePDFStore.getState().setBookId(newMetadata.id); // Set ID
            await loadPdf(files[0]);
        }
    }

    async function onSelectBook(id: string) {
        // Show processing state immediately if possible, although loadPdf does it too
        try {
            const bookFile = await loadBookData(id);
            if (bookFile) {
                usePDFStore.getState().setBookId(id); // Set ID for progress tracking
                await loadPdf(bookFile);
            } else {
                alert("Error: No se encontró el archivo del libro.");
            }
        } catch (error) {
            console.error("Error opening book", error);
        }
    }

    async function onDeleteBook(e: React.MouseEvent, id: string) {
        e.stopPropagation();
        if (confirm("¿Estás seguro de querer eliminar este libro?")) {
            await deleteBook(id);
            setBooks(prev => prev.filter(b => b.id !== id));
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
                <div className="w-full max-w-5xl p-8 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Tu Biblioteca</h2>
                        <p className="text-gray-600 text-lg">Tus historias guardadas, listas para continuar.</p>
                    </motion.div>

                    {isLoadingLibrary ? (
                        <div className="text-center text-gray-500">Cargando biblioteca...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {/* Upload New Book Card */}
                            <motion.label
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="aspect-[3/4] flex flex-col items-center justify-center bg-white/50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-white/80 transition-all group"
                            >
                                <div className="p-4 bg-purple-50 rounded-full mb-4 group-hover:bg-purple-100 transition-colors">
                                    <Plus className="w-8 h-8 text-purple-600" />
                                </div>
                                <span className="font-semibold text-gray-700">Agregar Libro</span>
                                <span className="text-xs text-gray-500 mt-1">PDF</span>
                                <input type="file" accept=".pdf" onChange={onFileChange} className="hidden" />
                            </motion.label>

                            {/* Book Cards */}
                            {books.map((book) => (
                                <motion.div
                                    key={book.id}
                                    layoutId={book.id}
                                    whileHover={{ y: -5 }}
                                    onClick={() => onSelectBook(book.id)}
                                    className="aspect-[3/4] bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden relative group cursor-pointer border border-gray-100 flex flex-col"
                                >
                                    <div className="flex-1 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 flex items-center justify-center relative overflow-hidden">
                                        <div className="w-24 h-32 bg-white shadow-md rounded border border-gray-200 flex items-center justify-center">
                                            <Book className="w-8 h-8 text-indigo-300" />
                                        </div>
                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => onDeleteBook(e, book.id)}
                                            className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                            title="Eliminar libro"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <h3 className="font-bold text-gray-800 line-clamp-2 text-sm leading-tight h-10" title={book.title}>
                                            {book.title}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(book.addedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-full h-full relative">
                    <CustomReader />

                    {/* Botón flotante para volver a la biblioteca (recargar página o limpiar file) */}
                    <div className="fixed bottom-4 left-4 z-50 opacity-20 hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-black/50 text-white p-2 rounded-full hover:bg-black/80 flex items-center gap-2 text-xs backdrop-blur-md"
                        >
                            <Book className="w-4 h-4" />
                            <span className="hidden md:inline">Biblioteca</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
