import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';

// Set worker src if window is defined to avoid SSR issues
if (typeof window !== 'undefined') {
    GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
}

export interface PageData {
    /** Plain text of the page */
    text: string;
    /** Data URLs of images extracted from the page */
    images: string[];
}

/**
 * Extracts text and images from a PDF file.
 * @param source File object or URL string to the PDF.
 * @returns Promise that resolves to an array of PageData, one per page.
 */
export async function extractPdf(source: File | string): Promise<PageData[]> {
    // Configuración robusta para decodificar caracteres especiales (CMaps)
    const params: any = {
        cMapUrl: `https://unpkg.com/pdfjs-dist@${version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${version}/standard_fonts/`,
    };

    if (typeof source === 'string') {
        params.url = source;
    } else {
        params.data = await source.arrayBuffer();
    }

    const loadingTask = getDocument(params);

    const pdf: PDFDocumentProxy = await loadingTask.promise;
    const numPages = pdf.numPages;
    const pages: PageData[] = [];

    for (let i = 1; i <= numPages; i++) {
        const page: PDFPageProxy = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const items = textContent.items as any[];

        let text = '';
        if (items.length > 0) {
            // Heurística: Determinar si el PDF está "roto" en letras individuales
            const totalLen = items.reduce((acc, item) => acc + item.str.length, 0);
            const avgLen = totalLen / items.length;

            // Si el promedio es bajo (ej. < 1.3), son letras sueltas -> unir sin separador 
            // Si es alto, son palabras normales -> unir con espacios
            const separator = avgLen < 1.3 ? '' : ' ';

            text = items.map(item => item.str).join(separator);

            // Limpieza: Asegurar que espacios múltiples sean uno solo
            text = text.replace(/\s+/g, ' ').trim();
        }

        const images: string[] = [];
        pages.push({ text, images });
    }
    return pages;
}
