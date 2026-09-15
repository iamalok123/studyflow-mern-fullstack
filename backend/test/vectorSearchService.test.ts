import { describe, it, expect } from "vitest";
import { cosineSimilarity } from "../utils/embeddingService.js";

describe("Vector Search & RAG Retrieval Unit Tests", () => {
  it("should rank chunks accurately in descending order of similarity score", () => {
    const queryVector = [1, 0, 0];
    const candidateChunks = [
      { id: "chunk_low", embedding: [0.1, 0.9, 0.0], content: "Irrelevant text" },
      { id: "chunk_high", embedding: [0.95, 0.05, 0.0], content: "Highly relevant topic" },
      { id: "chunk_med", embedding: [0.6, 0.4, 0.0], content: "Partially relevant topic" },
    ];

    const scored = candidateChunks
      .map((c) => ({
        ...c,
        score: cosineSimilarity(queryVector, c.embedding),
      }))
      .sort((a, b) => b.score - a.score);

    expect(scored[0].id).toBe("chunk_high");
    expect(scored[1].id).toBe("chunk_med");
    expect(scored[2].id).toBe("chunk_low");
    expect(scored[0].score).toBeGreaterThan(0.9);
  });

  it("should filter out chunks falling below minScore threshold", () => {
    const queryVector = [1, 0, 0];
    const minScore = 0.5;
    const candidateChunks = [
      { id: "pass_1", embedding: [0.9, 0.1, 0.0] },
      { id: "fail_1", embedding: [0.1, 0.9, 0.0] },
      { id: "pass_2", embedding: [0.8, 0.2, 0.0] },
      { id: "fail_2", embedding: [0.2, 0.8, 0.0] },
    ];

    const results = candidateChunks
      .map((c) => ({ ...c, score: cosineSimilarity(queryVector, c.embedding) }))
      .filter((c) => c.score >= minScore)
      .sort((a, b) => b.score - a.score);

    expect(results).toHaveLength(2);
    expect(results.every((r) => r.score >= minScore)).toBe(true);
  });

  it("should respect the limit parameter and return at most top-k chunks", () => {
    const queryVector = [1, 0, 0];
    const limit = 2;
    const candidateChunks = [
      { id: "c1", embedding: [0.95, 0, 0] },
      { id: "c2", embedding: [0.90, 0, 0] },
      { id: "c3", embedding: [0.85, 0, 0] },
      { id: "c4", embedding: [0.80, 0, 0] },
    ];

    const topK = candidateChunks
      .map((c) => ({ ...c, score: cosineSimilarity(queryVector, c.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    expect(topK).toHaveLength(limit);
    expect(topK[0].id).toBe("c1");
    expect(topK[1].id).toBe("c2");
  });

  it("should return empty array for blank or whitespace query", async () => {
    const { searchSimilarChunks } = await import("../utils/vectorSearchService.js");
    const res = await searchSimilarChunks({
      userId: "user1",
      query: "   ",
    });
    expect(res).toEqual([]);
  });
});
