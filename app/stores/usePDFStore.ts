import { create } from 'zustand';
import { extractPdf, PageData } from '../lib/pdfProcessor';

interface PDFState {
    file: File | string | null;
    pages: PageData[]; // extracted pages with text and images
    numPages: number | null;
    pageNumber: number;
    scale: number;
    isProcessing: boolean;
    currentBookId: string | null;
    setFile: (file: File | string | null) => void;
    setPages: (pages: PageData[]) => void;
    setNumPages: (num: number) => void;
    setPageNumber: (page: number) => void;
    setScale: (scale: number) => void;
    setBookId: (id: string | null) => void;
    loadPdf: (file: File | string) => Promise<void>;
}

export const usePDFStore = create<PDFState>((set) => ({
    file: null,
    pages: [],
    numPages: null,
    pageNumber: 1,
    scale: 1.2,
    isProcessing: false,
    currentBookId: null,
    setFile: (file) => set({ file, pageNumber: 1 }),
    setPages: (pages) => set({ pages, numPages: pages.length, pageNumber: 1 }),
    setNumPages: (num) => set({ numPages: num }),
    setPageNumber: (page) => set({ pageNumber: page }),
    setScale: (scale) => set({ scale }),
    setBookId: (id) => set({ currentBookId: id }),
    loadPdf: async (file) => {
        set({ isProcessing: true });
        try {
            const pages = await extractPdf(file);
            // Default to page 1, component will override if progress exists
            set({ file, pages, numPages: pages.length });
        } catch (error) {
            console.error("Error loading PDF", error);
        } finally {
            set({ isProcessing: false });
        }
    },
}));
