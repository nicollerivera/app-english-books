
import { set, get, del } from 'idb-keyval';
// 'entries' is what we might want, or just manual management.

// We will store two things:
// 1. "library_metadata": An array of book objects { id, title, addedAt, pageCount? }
// 2. "book_<id>": The actual File/Blob object.

export interface BookMetadata {
    id: string;
    title: string;
    addedAt: number;
    size: number;
}

const LIBRARY_KEY = 'library_metadata';

export async function getLibrary(): Promise<BookMetadata[]> {
    const lib = await get<BookMetadata[]>(LIBRARY_KEY);
    return lib || [];
}

export async function saveBook(file: File): Promise<BookMetadata> {
    const id = crypto.randomUUID();
    const metadata: BookMetadata = {
        id,
        title: file.name.replace('.pdf', ''),
        addedAt: Date.now(),
        size: file.size,
    };

    // Save the file content
    await set(`book_${id}`, file);

    // Update metadata list
    const currentLib = await getLibrary();
    const newLib = [metadata, ...currentLib];
    await set(LIBRARY_KEY, newLib);

    return metadata;
}

export async function loadBookData(id: string): Promise<File | undefined> {
    return await get<File>(`book_${id}`);
}

export async function deleteBook(id: string): Promise<void> {
    // Remove file
    await del(`book_${id}`);
    await del(`progress_${id}`); // Also delete progress

    // Update metadata
    const currentLib = await getLibrary();
    const newLib = currentLib.filter(b => b.id !== id);
    await set(LIBRARY_KEY, newLib);
}

export async function saveProgress(bookId: string, page: number): Promise<void> {
    await set(`progress_${bookId}`, page);
}

export async function loadProgress(bookId: string): Promise<number> {
    const page = await get<number>(`progress_${bookId}`);
    return page || 1; // Default to page 1
}
