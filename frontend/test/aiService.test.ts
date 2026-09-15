import { describe, it, expect, vi, beforeEach } from "vitest";
import aiService from "../src/services/aiService";
import axiosInstance from "../src/utils/axiosInstance";

vi.mock("../src/utils/axiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("Frontend AIService Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Non-streaming AI Generation", () => {
    it("should call generateFlashcards with documentId and options", async () => {
      const mockResult = { success: true, count: 5, data: [] };
      (axiosInstance.post as any).mockResolvedValueOnce({ data: mockResult });

      const res = await aiService.generateFlashcards("doc1", { count: 10 });
      expect(axiosInstance.post).toHaveBeenCalledWith("/api/ai/generate-flashcards", {
        documentId: "doc1",
        count: 10,
      });
      expect(res).toEqual(mockResult);
    });

    it("should call generateQuiz with documentId and options", async () => {
      const mockQuiz = { success: true, data: { _id: "quiz1" } };
      (axiosInstance.post as any).mockResolvedValueOnce({ data: mockQuiz });

      const res = await aiService.generateQuiz("doc1", { numQuestions: 5 });
      expect(axiosInstance.post).toHaveBeenCalledWith("/api/ai/generate-quiz", {
        documentId: "doc1",
        numQuestions: 5,
      });
      expect(res).toEqual(mockQuiz);
    });

    it("should call generateMindmap and return data payload", async () => {
      const mockMindmap = { root: { id: "1", title: "Photosynthesis" } };
      (axiosInstance.post as any).mockResolvedValueOnce({ data: { data: mockMindmap } });

      const res = await aiService.generateMindmap("doc1");
      expect(axiosInstance.post).toHaveBeenCalledWith("/api/ai/generate-mindmap", { documentId: "doc1" });
      expect(res).toEqual(mockMindmap);
    });

    it("should call generateSummary and return data payload", async () => {
      const mockSummary = "This document discusses cellular respiration in detail.";
      (axiosInstance.post as any).mockResolvedValueOnce({ data: { data: mockSummary } });

      const res = await aiService.generateSummary("doc1");
      expect(axiosInstance.post).toHaveBeenCalledWith("/api/ai/generate-summary", { documentId: "doc1" });
      expect(res).toEqual(mockSummary);
    });

    it("should call explainConcept with documentId and concept query", async () => {
      const mockExplanation = { explanation: "Mitosis is cell division..." };
      (axiosInstance.post as any).mockResolvedValueOnce({ data: { data: mockExplanation } });

      const res = await aiService.explainConcept("doc1", "Mitosis");
      expect(axiosInstance.post).toHaveBeenCalledWith("/api/ai/explain-concept", {
        documentId: "doc1",
        concept: "Mitosis",
      });
      expect(res).toEqual(mockExplanation);
    });
  });

  describe("SSE Streaming & Citation Event Parser", () => {
    it("should process streamed text chunks and citation metadata via streamChat", async () => {
      const chunk1 = 'data: {"type":"citations","citations":[{"pageNumber":4,"documentTitle":"Biology"}]}\n\n';
      const chunk2 = 'data: {"text":"Photosynthesis occurs in "}\n\n';
      const chunk3 = 'data: {"text":"chloroplasts."}\n\n';
      const chunk4 = 'data: [DONE]\n\n';

      const streamChunks = [
        new TextEncoder().encode(chunk1),
        new TextEncoder().encode(chunk2),
        new TextEncoder().encode(chunk3),
        new TextEncoder().encode(chunk4),
      ];

      let streamIndex = 0;
      const mockReader = {
        read: vi.fn().mockImplementation(() => {
          if (streamIndex < streamChunks.length) {
            return Promise.resolve({ done: false, value: streamChunks[streamIndex++] });
          }
          return Promise.resolve({ done: true, value: undefined });
        }),
      };

      const mockResponse = {
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse as any);

      const receivedCitations: any[] = [];
      const receivedText: string[] = [];

      await aiService.streamChat(
        "doc1",
        "Where does photosynthesis occur?",
        (text) => receivedText.push(text),
        (citations) => receivedCitations.push(...citations)
      );

      expect(receivedCitations).toEqual([{ pageNumber: 4, documentTitle: "Biology" }]);
      expect(receivedText).toEqual(["Photosynthesis occurs in ", "chloroplasts."]);
    });
  });
});
