import { describe, it, expect } from "vitest";
import { recursiveChunkText, chunkText, findRelevantChunks } from "../utils/textChunker.js";

describe("Text Chunker Unit Tests", () => {
  it("should handle empty or whitespace-only text gracefully", () => {
    expect(recursiveChunkText("")).toEqual([]);
    expect(recursiveChunkText("   \n\n   ")).toEqual([]);
  });

  it("should chunk text under maxChunkSize into a single chunk", () => {
    const text = "This is a short paragraph that easily fits in a single chunk.";
    const chunks = recursiveChunkText(text, 1500, 200);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[0].pageNumber).toBe(1);
    expect(chunks[0].content).toBe(text);
  });

  it("should split long text into multiple chunks while keeping paragraphs intact", () => {
    const p1 = "First paragraph discussing computer networks and architectures. ".repeat(15);
    const p2 = "Second paragraph discussing database management and ACID transactions. ".repeat(15);
    const fullText = `${p1}\n\n${p2}`;

    const chunks = recursiveChunkText(fullText, 600, 100);

    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk, index) => {
      expect(chunk.chunkIndex).toBe(index);
      expect(chunk.characterCount).toBeGreaterThan(0);
      expect(typeof chunk.content).toBe("string");
    });
  });

  it("should correctly detect and retain page markers in chunks", () => {
    const pagedText = `
[--- Page 1 ---]
Introduction to Algorithms. Sorting, searching, and graphs.

[--- Page 2 ---]
Dynamic programming and greedy approaches for optimization.

[--- Page 3 ---]
NP-Completeness and computational complexity theory.
    `.trim();

    const chunks = recursiveChunkText(pagedText, 500, 50);

    expect(chunks.length).toBeGreaterThanOrEqual(3);

    const page1Chunk = chunks.find((c) => c.content.includes("Algorithms"));
    const page2Chunk = chunks.find((c) => c.content.includes("Dynamic programming"));
    const page3Chunk = chunks.find((c) => c.content.includes("NP-Completeness"));

    expect(page1Chunk?.pageNumber).toBe(1);
    expect(page2Chunk?.pageNumber).toBe(2);
    expect(page3Chunk?.pageNumber).toBe(3);
  });

  it("should maintain backward-compatible chunkText wrapper", () => {
    const text = "Sample text for chunkText testing. ".repeat(30);
    const chunks = chunkText(text, 100, 20);

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]).toHaveProperty("chunkIndex");
    expect(chunks[0]).toHaveProperty("content");
  });

  it("should find relevant chunks using keyword matching fallback", () => {
    const chunks = [
      { chunkIndex: 0, pageNumber: 1, content: "Photosynthesis is the process used by plants to convert light into energy." },
      { chunkIndex: 1, pageNumber: 2, content: "Relational databases use SQL to query structured data." },
      { chunkIndex: 2, pageNumber: 3, content: "Chlorophyll absorbs sunlight and produces glucose in plant cells." },
    ];

    const results = findRelevantChunks(chunks, "photosynthesis plants", 2);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content).toContain("Photosynthesis");
    expect(results[0].score).toBeGreaterThan(0);
  });
});
