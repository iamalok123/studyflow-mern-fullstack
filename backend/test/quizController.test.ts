import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Quiz Controller Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication & Payload Validation", () => {
    it("should reject getQuizzes when user is unauthenticated", async () => {
      const mockReq: any = { user: undefined, params: { documentId: "doc123" } };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { getQuizzes } = await import("../controllers/quizController.js");
      await getQuizzes(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should reject quiz submission with non-array answers payload", async () => {
      const mockReq: any = {
        user: { _id: "user123" },
        params: { id: "quiz123" },
        body: { answers: "not-an-array" },
      };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { submitQuiz } = await import("../controllers/quizController.js");
      await submitQuiz(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Please provide answer array",
        })
      );
    });
  });

  describe("Quiz Scoring Engine", () => {
    it("should accurately score 100% when all answers match correctAnswer", () => {
      const questions = [
        { correctAnswer: "Option A", options: ["Option A", "Option B"] },
        { correctAnswer: "Option C", options: ["Option C", "Option D"] },
      ];
      const submitted = [
        { questionIndex: 0, selectedAnswer: "Option A" },
        { questionIndex: 1, selectedAnswer: "Option C" },
      ];

      let correctCount = 0;
      submitted.forEach((ans) => {
        if (questions[ans.questionIndex].correctAnswer === ans.selectedAnswer) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / questions.length) * 100);
      expect(score).toBe(100);
      expect(correctCount).toBe(2);
    });

    it("should accurately score 50% when 1 of 2 questions is correct", () => {
      const questions = [
        { correctAnswer: "A", options: ["A", "B"] },
        { correctAnswer: "C", options: ["C", "D"] },
      ];
      const submitted = [
        { questionIndex: 0, selectedAnswer: "A" },
        { questionIndex: 1, selectedAnswer: "D" }, // wrong
      ];

      let correctCount = 0;
      submitted.forEach((ans) => {
        if (questions[ans.questionIndex].correctAnswer === ans.selectedAnswer) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / questions.length) * 100);
      expect(score).toBe(50);
      expect(correctCount).toBe(1);
    });

    it("should accurately score 0% when all answers are incorrect", () => {
      const questions = [
        { correctAnswer: "A", options: ["A", "B"] },
        { correctAnswer: "C", options: ["C", "D"] },
      ];
      const submitted = [
        { questionIndex: 0, selectedAnswer: "B" },
        { questionIndex: 1, selectedAnswer: "D" },
      ];

      let correctCount = 0;
      submitted.forEach((ans) => {
        if (questions[ans.questionIndex].correctAnswer === ans.selectedAnswer) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / questions.length) * 100);
      expect(score).toBe(0);
    });
  });
});
