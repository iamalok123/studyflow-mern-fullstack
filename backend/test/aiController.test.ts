import { describe, it, expect } from "vitest";

describe("AI Controller & Citation Processing Unit Tests", () => {
  it("should extract distinct page citations from retrieved vector chunks", () => {
    const relevantChunks = [
      { chunkIndex: 0, pageNumber: 3, documentTitle: "Biology Book", documentId: "doc1" },
      { chunkIndex: 1, pageNumber: 3, documentTitle: "Biology Book", documentId: "doc1" }, // Duplicate page
      { chunkIndex: 2, pageNumber: 7, documentTitle: "Biology Book", documentId: "doc1" },
      { chunkIndex: 3, pageNumber: 1, documentTitle: "Biology Book", documentId: "doc1" },
    ];

    const citationMap = new Map<number, { pageNumber: number; documentTitle?: string; chunkIndex?: number; documentId?: any }>();
    for (const chunk of relevantChunks) {
      if (!citationMap.has(chunk.pageNumber)) {
        citationMap.set(chunk.pageNumber, {
          pageNumber: chunk.pageNumber,
          documentTitle: chunk.documentTitle,
          chunkIndex: chunk.chunkIndex,
          documentId: chunk.documentId,
        });
      }
    }

    const citations = Array.from(citationMap.values()).sort((a, b) => a.pageNumber - b.pageNumber);

    // Duplicate Page 3 should be merged
    expect(citations).toHaveLength(3);
    expect(citations[0].pageNumber).toBe(1);
    expect(citations[1].pageNumber).toBe(3);
    expect(citations[2].pageNumber).toBe(7);
  });

  it("should handle multi-document workspace citations distinguishing documents", () => {
    const relevantChunks = [
      { chunkIndex: 0, pageNumber: 2, documentTitle: "Physics Part 1", documentId: "doc_a" },
      { chunkIndex: 0, pageNumber: 2, documentTitle: "Chemistry Part 1", documentId: "doc_b" }, // Same page number, different document
      { chunkIndex: 1, pageNumber: 5, documentTitle: "Physics Part 1", documentId: "doc_a" },
    ];

    const citationKey = (c: any) => `${c.documentId?.toString() || ""}_${c.pageNumber}`;
    const citationMap = new Map<string, { pageNumber: number; documentTitle?: string; chunkIndex?: number; documentId?: any }>();
    for (const chunk of relevantChunks) {
      const key = citationKey(chunk);
      if (!citationMap.has(key)) {
        citationMap.set(key, {
          pageNumber: chunk.pageNumber,
          documentTitle: chunk.documentTitle || "Document",
          chunkIndex: chunk.chunkIndex,
          documentId: chunk.documentId,
        });
      }
    }

    const citations = Array.from(citationMap.values());

    expect(citations).toHaveLength(3);
    expect(citations.some((c) => c.documentTitle === "Physics Part 1" && c.pageNumber === 2)).toBe(true);
    expect(citations.some((c) => c.documentTitle === "Chemistry Part 1" && c.pageNumber === 2)).toBe(true);
  });
});
