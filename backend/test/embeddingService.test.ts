import { describe, it, expect } from "vitest";
import { cosineSimilarity } from "../utils/embeddingService.js";

describe("Embedding Service & Vector Math Tests", () => {
  it("should calculate exact cosine similarity for identical vectors", () => {
    const vecA = [0.2, 0.5, 0.8, -0.3];
    const vecB = [0.2, 0.5, 0.8, -0.3];

    const similarity = cosineSimilarity(vecA, vecB);
    expect(similarity).toBeCloseTo(1.0, 5);
  });

  it("should return 0 for orthogonal (perpendicular) vectors", () => {
    const vecA = [1, 0, 0];
    const vecB = [0, 1, 0];

    const similarity = cosineSimilarity(vecA, vecB);
    expect(similarity).toBeCloseTo(0.0, 5);
  });

  it("should return -1 for completely opposite vectors", () => {
    const vecA = [0.5, -0.5, 1.0];
    const vecB = [-0.5, 0.5, -1.0];

    const similarity = cosineSimilarity(vecA, vecB);
    expect(similarity).toBeCloseTo(-1.0, 5);
  });

  it("should gracefully handle empty or mismatched length vectors without throwing", () => {
    expect(cosineSimilarity([], [])).toBe(0);
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
    expect(cosineSimilarity(null as any, [1, 2])).toBe(0);
    expect(cosineSimilarity([0, 0, 0], [0, 0, 0])).toBe(0);
  });

  it("should correctly rank more similar vectors higher", () => {
    const queryVec = [0.9, 0.1, 0.1];
    const highSimilarityVec = [0.85, 0.12, 0.08];
    const lowSimilarityVec = [0.1, 0.8, 0.7];

    const scoreHigh = cosineSimilarity(queryVec, highSimilarityVec);
    const scoreLow = cosineSimilarity(queryVec, lowSimilarityVec);

    expect(scoreHigh).toBeGreaterThan(scoreLow);
    expect(scoreHigh).toBeGreaterThan(0.9);
  });
});
