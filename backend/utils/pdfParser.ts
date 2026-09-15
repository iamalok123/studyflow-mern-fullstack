import pdf from "pdf-parse/lib/pdf-parse.js";

/**
 * Extract text from a PDF buffer
 * @param pdfBuffer - The PDF file as a Buffer (from multer memoryStorage)
 * @returns Promise<{ text: string, numPages: number }>
 */
export const extractTextFromPDF = async (pdfBuffer: Buffer): Promise<{ text: string; numPages: number }> => {
  try {
    const renderPage = (pageData: any) => {
      return pageData.getTextContent().then((textContent: any) => {
        let lastY: number | null = null;
        let text = `[--- Page ${pageData.pageIndex + 1} ---]\n`;
        for (const item of textContent.items) {
          if (item.str === undefined) continue;
          const currentY = item.transform ? item.transform[5] : null;
          if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
            if (!text.endsWith("\n")) text += "\n";
          } else if (text.length > 0 && !text.endsWith("\n") && !text.endsWith(" ")) {
            text += " ";
          }
          text += item.str;
          if (item.hasEOL && !text.endsWith("\n")) text += "\n";
          if (currentY !== null) lastY = currentY;
        }
        return text.trim() + "\n\n";
      });
    };

    const data = await (pdf as any)(pdfBuffer, { pagerender: renderPage });

    return {
      text: data.text,
      numPages: data.numpages,
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};
