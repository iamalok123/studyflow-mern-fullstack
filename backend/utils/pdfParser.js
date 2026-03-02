import pdf from "pdf-parse/lib/pdf-parse.js";

/**
 * Extract text from a PDF buffer
 * @param {Buffer} pdfBuffer - The PDF file as a Buffer (from multer memoryStorage)
 * @returns {Promise<{ text: string, numPages: number }>}
 */
export const extractTextFromPDF = async (pdfBuffer) => {
    try {
        // pdf-parse v1: accepts a Buffer directly, returns { text, numpages, ... }
        const data = await pdf(pdfBuffer);

        return {
            text: data.text,
            numPages: data.numpages,
        };
    } catch (error) {
        console.error("PDF parsing error:", error);
        throw new Error("Failed to extract text from PDF");
    }
};