import { useState } from 'react';

export interface Meaning {
    partOfSpeech: string;
    definitions: { definition: string; example?: string }[];
}

export interface WordData {
    word: string;
    phonetic?: string;
    meanings: Meaning[];
}

export function useDictionary() {
    const [data, setData] = useState<WordData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWord = async (word: string) => {
        if (!word) return;
        setLoading(true);
        setError(null);
        setData(null);

        // Limpiar la palabra de signos de puntuación
        const cleanWord = word.trim().replace(/[.,!?;:"()]/g, '');

        // Simulación de respuesta "Inteligente" en Español
        setTimeout(() => {
            const mockResponse: WordData = {
                word: cleanWord,
                phonetic: `/${cleanWord.toLowerCase().slice(0, 3)}.../`,
                meanings: [
                    {
                        partOfSpeech: "Sustantivo / Verbo",
                        definitions: [
                            {
                                definition: `Aquí iría la definición detallada de "${cleanWord}" traducida al español.`,
                                example: `Ejemplo: The ${cleanWord} was amazing. -> El/La ${cleanWord} fue increíble.`
                            }
                        ]
                    }
                ]
            };
            setData(mockResponse);
            setLoading(false);
        }, 600); // 600ms fake delay
    };

    return { data, loading, error, fetchWord, clear: () => setData(null) };
}
