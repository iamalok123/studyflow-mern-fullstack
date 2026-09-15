import { describe, it, expect, vi, beforeEach } from "vitest";
import progressService from "../src/services/progressService";
import axiosInstance from "../src/utils/axiosInstance";

vi.mock("../src/utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("Frontend ProgressService Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch dashboard statistics data", async () => {
    const mockDashboard = {
      success: true,
      data: {
        overview: { totalDocuments: 5, totalFlashcards: 25, totalQuizzes: 3 },
        recentActivity: { documents: [], quizzes: [] },
      },
    };
    (axiosInstance.get as any).mockResolvedValueOnce({ data: mockDashboard });

    const result = await progressService.getDashboardData();
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/progress/dashboard");
    expect(result).toEqual(mockDashboard);
  });
});
