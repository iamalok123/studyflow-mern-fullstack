import { describe, it, expect } from "vitest";
import {
  estimateTokenCount,
  packChunksWithinBudget,
  packHistoryWithinBudget,
  DEFAULT_BUDGETS,
} from "../utils/tokenBudget.js";
import { IChatMessage } from "../types/models.js";

describe("Token Budgeting & Context Packing Tests", () => {
  describe("estimateTokenCount", () => {
    it("should return 0 for null, undefined, or empty string", () => {
      expect(estimateTokenCount("")).toBe(0);
      expect(estimateTokenCount(null as any)).toBe(0);
      expect(estimateTokenCount(undefined as any)).toBe(0);
    });

    it("should estimate tokens based on ~3.8 chars per token", () => {
      const sample = "This is a simple sentence containing about forty characters.";
      const estimated = estimateTokenCount(sample);
      expect(estimated).toBeGreaterThan(10);
      expect(estimated).toBeLessThan(30);
    });
  });

  describe("packChunksWithinBudget", () => {
    it("should return empty result for empty chunks list", () => {
      const result = packChunksWithinBudget([]);
      expect(result.items).toHaveLength(0);
      expect(result.totalTokens).toBe(0);
      expect(result.isTruncated).toBe(false);
    });

    it("should keep all chunks when they comfortably fit in the budget", () => {
      const chunks = [
        { content: "Introduction to Docker containers.", pageNumber: 1, documentTitle: "Doc A" },
        { content: "Docker images are built using Dockerfiles.", pageNumber: 2, documentTitle: "Doc A" },
      ];

      const result = packChunksWithinBudget(chunks, 2000);
      expect(result.items).toHaveLength(2);
      expect(result.itemsDropped).toBe(0);
      expect(result.isTruncated).toBe(false);
      expect(result.items[0].content).toBe("Introduction to Docker containers.");
      expect(result.items[1].pageNumber).toBe(2);
    });

    it("should truncate or drop chunks when the budget is exceeded", () => {
      const longText = "A".repeat(1000); // ~263 tokens
      const chunks = [
        { content: "First chunk: " + longText, pageNumber: 1 },
        { content: "Second chunk: " + longText, pageNumber: 2 },
        { content: "Third chunk: " + longText, pageNumber: 3 },
      ];

      // Budget only enough for ~1 chunk (~300 tokens)
      const result = packChunksWithinBudget(chunks, 300);
      expect(result.items.length).toBeLessThan(3);
      expect(result.isTruncated).toBe(true);
      expect(result.totalTokens).toBeLessThanOrEqual(300);
    });
  });

  describe("packHistoryWithinBudget", () => {
    it("should return empty array for empty history", () => {
      const result = packHistoryWithinBudget([]);
      expect(result.items).toHaveLength(0);
      expect(result.totalTokens).toBe(0);
      expect(result.isTruncated).toBe(false);
    });

    it("should preserve recent messages and drop older ones when history exceeds token budget", () => {
      const now = new Date();
      const history: IChatMessage[] = [
        { role: "user", content: "Ancient message 1: " + "X".repeat(1200), timestamp: now, relevantChunks: [] },
        { role: "assistant", content: "Ancient reply 1: " + "Y".repeat(1200), timestamp: now, relevantChunks: [] },
        { role: "user", content: "Recent question 2", timestamp: now, relevantChunks: [] },
        { role: "assistant", content: "Recent answer 2", timestamp: now, relevantChunks: [] },
      ];

      // Limit to ~200 tokens (only enough for the recent question & answer)
      const result = packHistoryWithinBudget(history, 200);

      expect(result.items.length).toBe(2);
      expect(result.items[0].content).toBe("Recent question 2");
      expect(result.items[1].content).toBe("Recent answer 2");
      expect(result.itemsDropped).toBe(2);
      expect(result.isTruncated).toBe(true);
    });

    it("should maintain chronological order (oldest to newest)", () => {
      const now = new Date();
      const history: IChatMessage[] = [
        { role: "user", content: "Step 1: define scope", timestamp: now, relevantChunks: [] },
        { role: "assistant", content: "Scope defined.", timestamp: now, relevantChunks: [] },
        { role: "user", content: "Step 2: build pipeline", timestamp: now, relevantChunks: [] },
        { role: "assistant", content: "Pipeline built.", timestamp: now, relevantChunks: [] },
      ];

      const result = packHistoryWithinBudget(history, DEFAULT_BUDGETS.MAX_HISTORY_TOKENS);
      expect(result.items).toHaveLength(4);
      expect(result.items[0].content).toBe("Step 1: define scope");
      expect(result.items[3].content).toBe("Pipeline built.");
      expect(result.isTruncated).toBe(false);
    });

    it("should clamp single excessively large historical messages", () => {
      const hugeMessage = "Z".repeat(5000);
      const history: IChatMessage[] = [
        { role: "user", content: hugeMessage, timestamp: new Date(), relevantChunks: [] },
      ];

      const result = packHistoryWithinBudget(history, 2000);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].content.length).toBeLessThanOrEqual(3204);
      expect(result.items[0].content.endsWith("...")).toBe(true);
    });
  });
});
