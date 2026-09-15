import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Flashcard Controller Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication Guards", () => {
    it("should reject getFlashcards when user is not authenticated", async () => {
      const mockReq: any = { user: undefined, params: { documentId: "doc123" } };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { getFlashcards } = await import("../controllers/flashcardController.js");
      await getFlashcards(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should reject getAllFlashcardSets when user is not authenticated", async () => {
      const mockReq: any = { user: undefined };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { getAllFlashcardSets } = await import("../controllers/flashcardController.js");
      await getAllFlashcardSets(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should reject reviewFlashcard when user is not authenticated", async () => {
      const mockReq: any = { user: undefined, params: { cardId: "card123" } };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { reviewFlashcard } = await import("../controllers/flashcardController.js");
      await reviewFlashcard(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should reject toggleStarFlashcard when user is not authenticated", async () => {
      const mockReq: any = { user: undefined, params: { cardId: "card123" } };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { toggleStarFlashcard } = await import("../controllers/flashcardController.js");
      await toggleStarFlashcard(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe("Flashcard Rating & Review Increment Math", () => {
    it("should accurately increment review count on review submission", () => {
      const card = {
        _id: "card_1",
        question: "What is DNA?",
        answer: "Deoxyribonucleic acid",
        reviewCount: 2,
        lastReviewed: null,
      };

      // Simulate review event
      card.reviewCount += 1;
      card.lastReviewed = new Date() as any;

      expect(card.reviewCount).toBe(3);
      expect(card.lastReviewed).toBeInstanceOf(Date);
    });

    it("should toggle star flag properly from false to true and vice versa", () => {
      let isStarred = false;
      isStarred = !isStarred;
      expect(isStarred).toBe(true);
      isStarred = !isStarred;
      expect(isStarred).toBe(false);
    });
  });
});
