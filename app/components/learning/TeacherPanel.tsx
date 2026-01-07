"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, MessageCircle, Volume2 } from 'lucide-react';

import { explainText } from '@/app/actions';

import { Mic, MicOff } from 'lucide-react';

interface TeacherPanelProps {
    selectedText: string | null;
}

// Extend window interface for SpeechRecognition
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export default function TeacherPanel({ selectedText }: TeacherPanelProps) {
    const [explanation, setExplanation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

    // Shadowing State
    const [isListening, setIsListening] = useState(false);
    const [userTranscript, setUserTranscript] = useState<string | null>(null);
    const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);

    // Reset shadowing state when text changes
    useEffect(() => {
        setUserTranscript(null);
        setPronunciationScore(null);
        setIsListening(false);
    }, [selectedText]);

    const toggleListening = () => {
        if (isListening) {
            // Stop logic is handled by the recognition 'end' event usually, but we can force stop if needed.
            // For simplicity, we mostly rely on the browser stopping, but here we can just toggle generic state
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Tu navegador no soporta reconocimiento de voz. Prueba Chrome o Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setUserTranscript(transcript);
            calculateScore(transcript, selectedText || "");
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    // Detailed Feedback State
    const [wordFeedback, setWordFeedback] = useState<{ word: string, status: 'ok' | 'missed' }[]>([]);

    const calculateScore = (spoken: string, original: string) => {
        // Normalize strings
        const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const spokenNormalized = normalize(spoken);
        const originalNormalized = normalize(original);

        const spokenWords = spokenNormalized.split(/\s+/);
        const originalWords = originalNormalized.split(/\s+/); // For matching logic
        const originalDisplayWords = original.split(/\s+/); // For display (keeps punctuation)

        let matches = 0;
        const feedback = originalDisplayWords.map((displayWord, index) => {
            const cleanWord = normalize(displayWord);
            // Check if this word exists ANYWHERE in the spoken text (simplified loose matching)
            // A clearer algorithm would be sequential matching, but loose is better for beginners.
            const isMatch = spokenWords.includes(cleanWord);

            if (isMatch) matches++;

            return {
                word: displayWord,
                status: isMatch ? 'ok' as const : 'missed' as const
            };
        });

        const score = Math.round((matches / Math.max(originalWords.length, 1)) * 100);

        setPronunciationScore(Math.min(100, score)); // Cap at 100
        setWordFeedback(feedback);
    };

    useEffect(() => {
        const loadVoices = () => {
            const available = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
            setVoices(available);

            // Intentar seleccionar la mejor voz automáticamente
            const bestVoice = available.find(v =>
                (v.name.includes("Google") && v.name.includes("US")) ||
                (v.name.includes("Natural") && v.lang.includes("en")) ||
                (v.name.includes("Premium"))
            ) || available[0];

            if (bestVoice) setSelectedVoice(bestVoice);
        };

        loadVoices();

        // Chrome carga voces asíncronamente
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

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

                                {/* Shadowing Section */}
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <div className="mb-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Voz</label>
                                        <select
                                            className="w-full text-xs p-2 rounded border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:border-purple-400 font-sans"
                                            onChange={(e) => {
                                                const v = voices.find(voice => voice.name === e.target.value);
                                                if (v) setSelectedVoice(v);
                                            }}
                                            value={selectedVoice?.name || ""}
                                        >
                                            {voices.map(v => (
                                                <option key={v.name} value={v.name}>
                                                    {v.name.replace("Microsoft", "").replace("Google", "").replace("English", "").trim()} ({v.lang})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => {
                                            const utterance = new SpeechSynthesisUtterance(selectedText);
                                            // Usar la voz seleccionada o fallback
                                            if (selectedVoice) {
                                                utterance.voice = selectedVoice;
                                                utterance.lang = selectedVoice.lang;
                                            } else {
                                                utterance.lang = 'en-US';
                                            }

                                            // Velocidad ligeramente reducida para estudiar, pero no tanto para evitar distorsión
                                            utterance.rate = 0.9;
                                            utterance.pitch = 1.0;

                                            window.speechSynthesis.cancel();
                                            window.speechSynthesis.speak(utterance);
                                        }}
                                        className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 mb-3"
                                    >
                                        <Volume2 className="w-4 h-4" />
                                        Escuchar (IA)
                                    </button>

                                    <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block text-center">Tu Turno</label>

                                        {/* Frase guía para leer mientras se graba */}
                                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 mb-1 text-center">
                                            <p className="text-lg font-serif italic text-purple-900 leading-tight">"{selectedText}"</p>
                                        </div>

                                        <button
                                            onClick={toggleListening}
                                            className={`w-full py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-sm border-2 ${isListening
                                                ? "bg-red-50 border-red-400 text-red-500 animate-pulse"
                                                : "bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50"
                                                }`}
                                        >
                                            {isListening ? (
                                                <>
                                                    <MicOff className="w-6 h-6" />
                                                    <span className="text-xs">Escuchando... (Habla ahora)</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Mic className="w-6 h-6 text-purple-500" />
                                                    <span className="text-xs">Presiona para Hablar</span>
                                                </>
                                            )}
                                        </button>

                                        {userTranscript && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                                            >
                                                <p className="text-xs text-gray-400 mb-1">Tu pronunciación:</p>
                                                <p className="text-gray-600 italic mb-2">"{userTranscript}"</p>

                                                <div className="mb-2 p-2 bg-white rounded border border-gray-100">
                                                    <p className="text-xs text-gray-400 mb-1 font-bold">Análisis (Faltas):</p>
                                                    <p className="leading-relaxed">
                                                        {wordFeedback.map((item, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`mr-1 inline-block px-1 rounded ${item.status === 'ok'
                                                                    ? 'text-green-600 bg-green-50'
                                                                    : 'text-red-400 decoration-red-400 line-through bg-red-50 opacity-70'
                                                                    }`}
                                                            >
                                                                {item.word}
                                                            </span>
                                                        ))}
                                                    </p>
                                                </div>

                                                {pronunciationScore !== null && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${pronunciationScore > 80 ? 'bg-green-500' : pronunciationScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                style={{ width: `${pronunciationScore}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-xs font-bold ${pronunciationScore > 80 ? 'text-green-600' : 'text-gray-600'}`}>
                                                            {pronunciationScore}%
                                                        </span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
