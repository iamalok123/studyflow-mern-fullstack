/**
 * Splits text file chunks for better ai processing (Mirror of backend logic)
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
    overlap = Math.min(overlap, chunkSize - 1);
    if (!text || text.trim().length === 0) {
        return [];
    }
    const cleanedText = text.replace(/\r\n/g, '\n').replace(/[^\S\n]+/g, ' ').replace(/\n /g, '\n').replace(/ \n/g, '\n').trim();
    const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim().length > 0);
    const chunks = [];
    let currentChunk = [];
    let currentWordCount = 0;
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphWords = paragraph.trim().split(/\s+/);
        const paragraphWordCount = paragraphWords.length;

        if (paragraphWordCount > chunkSize) {
            if (currentChunk.length > 0) {
                chunks.push({ content: currentChunk.join('\n\n'), chunkIndex: chunkIndex++, pageNumber: 0 });
                currentChunk = [];
                currentWordCount = 0;
            }
            const step = Math.max(1, chunkSize - overlap);
            for (let i = 0; i < paragraphWords.length; i += step) {
                const chunkWords = paragraphWords.slice(i, i + chunkSize);
                chunks.push({ content: chunkWords.join(' '), chunkIndex: chunkIndex++, pageNumber: 0 });
                if (i + chunkSize >= paragraphWords.length) break;
            }
            continue;
        }

        if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
            chunks.push({ content: currentChunk.join('\n\n'), chunkIndex: chunkIndex++, pageNumber: 0 });
            const prevChunkText = currentChunk.join(' ');
            const prevWords = prevChunkText.split(/\s+/);
            const overlapText = prevWords.slice(-Math.min(overlap, prevWords.length)).join(' ');
            currentChunk = [overlapText, paragraph.trim()];
            currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
        } else {
            currentChunk.push(paragraph.trim());
            currentWordCount += paragraphWordCount;
        }
    }
    if (currentChunk.length > 0) {
        chunks.push({ content: currentChunk.join('\n\n'), chunkIndex: chunkIndex, pageNumber: 0 });
    }
    if (chunks.length === 0 && cleanedText.length > 0) {
        const allWords = cleanedText.split(/\s+/);
        const step = Math.max(1, chunkSize - overlap);
        for (let i = 0; i < allWords.length; i += step) {
            const chunkWords = allWords.slice(i, i + chunkSize);
            chunks.push({ content: chunkWords.join(' '), chunkIndex: chunkIndex++, pageNumber: 0 });
            if (i + chunkSize >= allWords.length) break;
        }
    }
    return chunks;
};

/**
 * Extracts text from PDF File object
 * @param {File} file 
 * @param {Function} onProgress callback for progress (currentPage, totalPages)
 * @returns {Promise<{text: string, numPages: number, isLikelyScanned: boolean, chunks: Array}>}
 */
export const extractPdfText = async (file, onProgress) => {
    try {
        // Dynamically import pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist');
        
        // Use CDN worker to avoid bundler issues
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        
        const numPages = pdf.numPages;
        let fullText = "";

        for (let i = 1; i <= numPages; i++) {
            if (onProgress) onProgress(i, numPages);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(" ");
            fullText += pageText + "\n\n";
        }

        const isLikelyScanned = fullText.trim().length < 100;
        const chunks = isLikelyScanned ? [] : chunkText(fullText, 500, 50);

        return {
            text: fullText,
            numPages,
            isLikelyScanned,
            chunks
        };
    } catch (error) {
        console.error("PDF Extraction Error:", error);
        throw new Error("Failed to read PDF file.");
    }
};
