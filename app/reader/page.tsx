"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ImmersiveBackground } from '@/app/components/layout/ImmersiveBackground';
import DictionaryPanel from '@/app/components/reader/DictionaryPanel';

const PDFViewer = dynamic(() => import('@/app/components/reader/PDFViewer'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen flex items-center justify-center text-white">
            <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-primary/50 rounded-full blur-xl absolute" />
                <div className="relative z-10 font-bold text-xl">Cargando experiencia...</div>
            </div>
        </div>
    ),
});

export default function ReaderPage() {
    const [selectedWord, setSelectedWord] = useState<string | null>(null);

    const handleWordSelect = (word: string) => {
        setSelectedWord(word);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            <ImmersiveBackground />
            <PDFViewer onWordSelect={handleWordSelect} />
            {selectedWord && (
                <DictionaryPanel word={selectedWord} onClose={() => setSelectedWord(null)} />
            )}
        </div>
    );
}
