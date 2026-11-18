import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FlashcardPage from "../src/pages/Flashcards/FlashcardPage";
import flashcardService from "../src/services/flashcardService";

vi.mock("../src/services/flashcardService", () => ({
  default: {
    getFlashcardSetById: vi.fn(),
    getFlashcardsForDocument: vi.fn(),
    reviewFlashcard: vi.fn(),
    toggleStar: vi.fn(),
    deleteFlashcardSet: vi.fn(),
  },
}));

vi.mock("../src/services/aiService", () => ({
  default: {
    generateFlashcards: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Frontend FlashcardPage Component Tests", () => {
  const mockSet = {
    _id: "set_123",
    title: "Neuroscience Concepts",
    cards: [
      {
        _id: "card_1",
        question: "What is an action potential?",
        answer: "A rapid sequence of changes in the voltage across a membrane.",
        difficulty: "Medium",
        isStarred: false,
        reviewCount: 1,
        repetition: 1,
        interval: 1,
        easeFactor: 2.5,
        nextReviewDate: new Date(Date.now() - 3600 * 1000).toISOString(), // due
      },
      {
        _id: "card_2",
        question: "What is myelin sheath?",
        answer: "An insulating layer around nerves.",
        difficulty: "Easy",
        isStarred: true,
        reviewCount: 3,
        repetition: 3,
        interval: 15,
        easeFactor: 2.5,
        nextReviewDate: new Date(Date.now() + 86400 * 1000 * 5).toISOString(), // not due
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render flashcard question, SM-2 rating buttons, and filter tabs", async () => {
    (flashcardService.getFlashcardSetById as any).mockResolvedValueOnce({
      data: mockSet,
    });

    render(
      <MemoryRouter initialEntries={["/flashcards/set/set_123"]}>
        <Routes>
          <Route path="/flashcards/set/:setId" element={<FlashcardPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("What is an action potential?")).toBeDefined();
    });

    // Verify SM-2 rating buttons
    expect(screen.getByText("Again")).toBeDefined();
    expect(screen.getByText("Hard")).toBeDefined();
    expect(screen.getByText("Good")).toBeDefined();
    expect(screen.getByText("Easy")).toBeDefined();

    // Verify filter tabs
    expect(screen.getByText(/All Cards \(2\)/)).toBeDefined();
    expect(screen.getByText(/Due for Review \(1\)/)).toBeDefined();
    expect(screen.getByText(/Starred \(1\)/)).toBeDefined();
  });

  it("should submit an SM-2 rating when user clicks 'Good'", async () => {
    (flashcardService.getFlashcardSetById as any).mockResolvedValueOnce({
      data: mockSet,
    });
    (flashcardService.reviewFlashcard as any).mockResolvedValueOnce({
      success: true,
      card: {
        ...mockSet.cards[0],
        repetition: 2,
        interval: 6,
        reviewCount: 2,
      },
    });

    render(
      <MemoryRouter initialEntries={["/flashcards/set/set_123"]}>
        <Routes>
          <Route path="/flashcards/set/:setId" element={<FlashcardPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("What is an action potential?")).toBeDefined();
    });

    const goodBtn = screen.getByText("Good");
    fireEvent.click(goodBtn);

    await waitFor(() => {
      expect(flashcardService.reviewFlashcard).toHaveBeenCalledWith("card_1", {
        rating: "good",
        cardIndex: 0,
      });
    });
  });

  it("should flip card when Spacebar is pressed and rate with numeric keys", async () => {
    (flashcardService.getFlashcardSetById as any).mockResolvedValueOnce({
      data: mockSet,
    });
    (flashcardService.reviewFlashcard as any).mockResolvedValueOnce({
      success: true,
      card: { ...mockSet.cards[0], repetition: 1, interval: 1 },
    });

    render(
      <MemoryRouter initialEntries={["/flashcards/set/set_123"]}>
        <Routes>
          <Route path="/flashcards/set/:setId" element={<FlashcardPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("What is an action potential?")).toBeDefined();
    });

    // Press Space to flip
    fireEvent.keyDown(window, { code: "Space" });

    // Press '3' for Good rating
    fireEvent.keyDown(window, { key: "3" });

    await waitFor(() => {
      expect(flashcardService.reviewFlashcard).toHaveBeenCalledWith("card_1", {
        rating: "good",
        cardIndex: 0,
      });
    });
  });

  it("should toggle shortcuts modal when '?' is pressed", async () => {
    (flashcardService.getFlashcardSetById as any).mockResolvedValueOnce({
      data: mockSet,
    });

    render(
      <MemoryRouter initialEntries={["/flashcards/set/set_123"]}>
        <Routes>
          <Route path="/flashcards/set/:setId" element={<FlashcardPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("What is an action potential?")).toBeDefined();
    });

    // Press '?'
    fireEvent.keyDown(window, { key: "?" });

    await waitFor(() => {
      expect(screen.getByText("⚡ Keyboard Shortcuts")).toBeDefined();
    });
  });
});
