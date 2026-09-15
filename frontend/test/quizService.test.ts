import { describe, it, expect, vi, beforeEach } from "vitest";
import quizService from "../src/services/quizService";
import axiosInstance from "../src/utils/axiosInstance";

vi.mock("../src/utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("Frontend QuizService Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get all quizzes for user", async () => {
    const mockQuizzes = { data: [{ _id: "quiz1", title: "Genetics Quiz", questions: [] }] };
    (axiosInstance.get as any).mockResolvedValueOnce({ data: mockQuizzes });

    const result = await quizService.getAllQuizzes();
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/quizzes");
    expect(result).toEqual(mockQuizzes);
  });

  it("should get quiz details by quiz ID", async () => {
    const mockQuiz = { data: { _id: "quiz1", title: "Genetics Quiz", totalQuestions: 5 } };
    (axiosInstance.get as any).mockResolvedValueOnce({ data: mockQuiz });

    const result = await quizService.getQuizById("quiz1");
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/quizzes/quiz/quiz1");
    expect(result).toEqual(mockQuiz);
  });

  it("should submit quiz answers and return scored result", async () => {
    const answers = [
      { questionIndex: 0, selectedAnswer: "Option A" },
      { questionIndex: 1, selectedAnswer: "Option B" },
    ];
    const mockResult = {
      success: true,
      data: { score: 100, completedAt: new Date().toISOString() },
    };
    (axiosInstance.post as any).mockResolvedValueOnce({ data: mockResult });

    const result = await quizService.submitQuiz("quiz1", answers);
    expect(axiosInstance.post).toHaveBeenCalledWith("/api/quizzes/quiz1/submit", { answers });
    expect(result).toEqual(mockResult);
  });
});
