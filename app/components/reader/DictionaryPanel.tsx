"use client";
import React, { useEffect, useMemo } from 'react';
import { WordInspector } from '@/app/components/learning/WordInspector';
import { useDictionary } from '@/app/hooks/useDictionary';

interface DictionaryPanelProps {
    word: string;
    onClose: () => void;
}

const DictionaryPanel: React.FC<DictionaryPanelProps> = ({ word, onClose }) => {
    const { data: wordData, loading: wordLoading, fetchWord, clear } = useDictionary();

    // Fetch definition when the word changes
    useEffect(() => {
        fetchWord(word);
        return () => {
            clear();
        };
    }, [word]);

    // Fixed position on the right side of the screen
    const [panelPosition, setPanelPosition] = React.useState({ x: 0, y: 80 });

    useEffect(() => {
        setPanelPosition({ x: window.innerWidth - 340, y: 80 });

        const handleResize = () => {
            setPanelPosition({ x: window.innerWidth - 340, y: 80 });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <WordInspector
            data={wordData}
            loading={wordLoading}
            position={panelPosition}
            onClose={onClose}
        />
    );
};

export default DictionaryPanel;
