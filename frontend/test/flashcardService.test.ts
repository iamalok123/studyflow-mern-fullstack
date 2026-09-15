import { describe, it, expect, vi, beforeEach } from "vitest";
import flashcardService from "../src/services/flashcardService";
import axiosInstance from "../src/utils/axiosInstance";

vi.mock("../src/utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Frontend FlashcardService Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get all flashcard sets for the user", async () => {
    const mockSets = { data: [{ _id: "set1", title: "Biology Terms", cards: [] }] };
    (axiosInstance.get as any).mockResolvedValueOnce({ data: mockSets });

    const result = await flashcardService.getAllFlashcardSets();
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/flashcards");
    expect(result).toEqual(mockSets);
  });

  it("should get a flashcard set by set ID", async () => {
    const mockSet = { data: { _id: "set1", cards: [{ question: "Q1", answer: "A1" }] } };
    (axiosInstance.get as any).mockResolvedValueOnce({ data: mockSet });

    const result = await flashcardService.getFlashcardSetById("set1");
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/flashcards/set/set1");
    expect(result).toEqual(mockSet);
  });

  it("should submit a flashcard review rating", async () => {
    const mockRes = { success: true, message: "Reviewed" };
    (axiosInstance.post as any).mockResolvedValueOnce({ data: mockRes });

    const result = await flashcardService.reviewFlashcard("card1", 3);
    expect(axiosInstance.post).toHaveBeenCalledWith("/api/flashcards/card1/review", { cardIndex: 3 });
    expect(result).toEqual(mockRes);
  });

  it("should toggle star on a flashcard", async () => {
    const mockRes = { success: true, isStarred: true };
    (axiosInstance.put as any).mockResolvedValueOnce({ data: mockRes });

    const result = await flashcardService.toggleStar("card1");
    expect(axiosInstance.put).toHaveBeenCalledWith("/api/flashcards/card1/star");
    expect(result).toEqual(mockRes);
  });

  it("should delete a flashcard set", async () => {
    const mockRes = { success: true, message: "Deleted" };
    (axiosInstance.delete as any).mockResolvedValueOnce({ data: mockRes });

    const result = await flashcardService.deleteFlashcardSet("set1");
    expect(axiosInstance.delete).toHaveBeenCalledWith("/api/flashcards/set1");
    expect(result).toEqual(mockRes);
  });
});
