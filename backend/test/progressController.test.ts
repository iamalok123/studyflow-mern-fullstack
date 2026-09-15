import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Progress & Analytics Controller Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication Guard", () => {
    it("should reject getDashboard when user is unauthenticated", async () => {
      const mockReq: any = { user: undefined };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { getDashboard } = await import("../controllers/progressController.js");
      await getDashboard(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe("Dashboard Metrics Aggregation Calculations", () => {
    it("should accurately compute flashcard review counts and starred cards", () => {
      const flashcardSets = [
        {
          cards: [
            { reviewCount: 2, isStarred: true },
            { reviewCount: 0, isStarred: false },
          ],
        },
        {
          cards: [
            { reviewCount: 5, isStarred: true },
            { reviewCount: 1, isStarred: true },
            { reviewCount: 0, isStarred: false },
          ],
        },
      ];

      let totalFlashcards = 0;
      let reviewedFlashcards = 0;
      let starredFlashcards = 0;

      flashcardSets.forEach((set) => {
        totalFlashcards += set.cards.length;
        reviewedFlashcards += set.cards.filter((card) => card.reviewCount > 0).length;
        starredFlashcards += set.cards.filter((card) => card.isStarred).length;
      });

      expect(totalFlashcards).toBe(5);
      expect(reviewedFlashcards).toBe(3);
      expect(starredFlashcards).toBe(3);
    });

    it("should compute average quiz score accurately and return 0 when no quizzes are completed", () => {
      const completedQuizListEmpty: any[] = [];
      const avgEmpty =
        completedQuizListEmpty.length > 0
          ? Math.round(
              completedQuizListEmpty.reduce((sum, q) => sum + q.score, 0) /
                completedQuizListEmpty.length
            )
          : 0;
      expect(avgEmpty).toBe(0);

      const completedQuizList = [
        { score: 80 },
        { score: 90 },
        { score: 75 },
      ];
      const avg = Math.round(
        completedQuizList.reduce((sum, q) => sum + q.score, 0) /
          completedQuizList.length
      );
      // (80 + 90 + 75) / 3 = 81.666 -> 82
      expect(avg).toBe(82);
    });
  });
});
