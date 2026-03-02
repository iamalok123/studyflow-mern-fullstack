import { PDFParse } from "pdf-parse";

/**
 * Extract text from a PDF buffer
 * @param {Buffer} pdfBuffer - The PDF file as a Buffer (from multer memoryStorage)
 * @returns {Promise<{ text: string, numPages: number }>}
 */
export const extractTextFromPDF = async (pdfBuffer) => {
    try {
        // pdf-parse v2: PDFParse is a CLASS — pass buffer via `data` option in constructor
        const parser = new PDFParse({
            data: new Uint8Array(pdfBuffer),
        });

        const result = await parser.getText();

        // result.text = concatenated text, result.total = number of pages
        return {
            text: result.text,
            numPages: result.total,
        };
    } catch (error) {
        console.error("PDF parsing error:", error);
        throw new Error("Failed to extract text from PDF");
    }
};