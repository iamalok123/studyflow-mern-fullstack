import { describe, it, expect } from "vitest";
import { chunkText } from "../src/utils/pdfExtractor";

describe("Frontend Utilities & PDF Extractor Unit Tests", () => {
  it("should return empty array for empty or whitespace string", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("    \n\t  ")).toEqual([]);
  });

  it("should produce valid chunk objects with chunkIndex and pageNumber", () => {
    const sampleText = "The mitochondria is the powerhouse of the cell. It produces ATP through cellular respiration.";
    const chunks = chunkText(sampleText, 50, 10);

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]).toHaveProperty("content");
    expect(chunks[0]).toHaveProperty("chunkIndex", 0);
    expect(chunks[0]).toHaveProperty("pageNumber");
  });

  it("should chunk long texts exceeding chunkSize", () => {
    const longText = Array(150).fill("biology").join(" ");
    const chunks = chunkText(longText, 40, 5);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[1].chunkIndex).toBe(1);
  });
});
