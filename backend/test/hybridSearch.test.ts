import { describe, it, expect } from "vitest";
import {
  calculateBM25Score,
  combineHybridScores,
  tokenizeQuery,
  extractExactKeywords,
} from "../utils/bm25.js";

describe("BM25 & Hybrid Search Scoring Unit Tests", () => {
  describe("tokenizeQuery", () => {
    it("should filter out stopwords and preserve meaningful terms", () => {
      const tokens = tokenizeQuery("what is the function of the mitochondria in a cell?");
      expect(tokens).toContain("function");
      expect(tokens).toContain("mitochondria");
      expect(tokens).toContain("cell");
      expect(tokens).not.toContain("the");
      expect(tokens).not.toContain("is");
      expect(tokens).not.toContain("in");
    });

    it("should preserve hyphens and acronyms", () => {
      const tokens = tokenizeQuery("Explain OAuth-2 and JWT tokens");
      expect(tokens).toContain("oauth-2");
      expect(tokens).toContain("jwt");
      expect(tokens).toContain("tokens");
    });
  });

  describe("extractExactKeywords", () => {
    it("should extract uppercase acronyms and versioned identifiers", () => {
      const keywords = extractExactKeywords("How does SM-2 compare to Anki and OAuth2.0?");
      expect(keywords).toContain("SM-2");
      expect(keywords).toContain("OAuth2");
    });
  });

  describe("calculateBM25Score", () => {
    it("should return higher score for chunks matching exact query phrase", () => {
      const query = "active recall and spaced repetition";
      const relevantChunk =
        "The most effective learning strategies involve active recall and spaced repetition over scheduled intervals.";
      const irrelevantChunk =
        "Photosynthesis is the process by which green plants transform light energy into chemical energy.";

      const score1 = calculateBM25Score(query, relevantChunk);
      const score2 = calculateBM25Score(query, irrelevantChunk);

      expect(score1).toBeGreaterThan(0.6);
      expect(score2).toBe(0);
    });

    it("should grant bonus for exact acronym matches", () => {
      const query = "JWT authentication flow";
      const chunkWithAcronym = "In this architecture, JWT is used to sign claims and authenticate user sessions.";
      const chunkWithout = "A JSON web token format allows secure transmission of identity data between client and server.";

      const scoreWith = calculateBM25Score(query, chunkWithAcronym);
      const scoreWithout = calculateBM25Score(query, chunkWithout);

      expect(scoreWith).toBeGreaterThan(scoreWithout);
    });
  });

  describe("combineHybridScores", () => {
    it("should compute weighted combination correctly", () => {
      const vectorScore = 0.8;
      const lexicalScore = 0.6;
      // 0.8 * 0.65 + 0.6 * 0.35 = 0.52 + 0.21 = 0.73
      const hybrid = combineHybridScores(vectorScore, lexicalScore, 0.65);
      expect(hybrid).toBe(0.73);
    });

    it("should clamp output between 0 and 1", () => {
      expect(combineHybridScores(1.5, 2.0)).toBe(1);
      expect(combineHybridScores(-0.5, -0.2)).toBe(0);
    });
  });
});
