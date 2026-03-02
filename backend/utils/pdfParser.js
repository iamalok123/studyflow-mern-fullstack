import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * Extract text from PDF file using pdf-parse v2
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<{ text: string, numPages: number }>}
 */
export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);

        // pdf-parse v2: PDFParse is a CLASS — pass buffer via `data` option in constructor
        const parser = new PDFParse({
            data: new Uint8Array(dataBuffer),
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