import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "../src/pages/Dashboard/DashboardPage";
import progressService from "../src/services/progressService";

vi.mock("../src/services/progressService", () => ({
  default: {
    getDashboardData: vi.fn(),
  },
}));

describe("Frontend DashboardPage Component Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render overview statistics metrics correctly", async () => {
    const mockData = {
      overview: {
        totalDocuments: 3,
        totalFlashcards: 42,
        totalQuizzes: 5,
      },
      recentActivity: {
        documents: [],
        quizzes: [],
      },
    };

    (progressService.getDashboardData as any).mockResolvedValueOnce({ data: mockData });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Total Documents")).toBeDefined();
    });

    expect(screen.getByText("Total Flashcards")).toBeDefined();
    expect(screen.getByText("Total Quizzes")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("42")).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
  });

  it("should render the enhanced empty activity launchpad with quick-action cards when activity is empty", async () => {
    const mockEmptyData = {
      overview: {
        totalDocuments: 0,
        totalFlashcards: 0,
        totalQuizzes: 0,
      },
      recentActivity: {
        documents: [],
        quizzes: [],
      },
    };

    (progressService.getDashboardData as any).mockResolvedValueOnce({ data: mockEmptyData });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Your Learning Journey Starts Here/i)).toBeDefined();
    });

    expect(screen.getByText(/Upload Study Notes/i)).toBeDefined();
    expect(screen.getByText(/Create a Workspace/i)).toBeDefined();
    expect(screen.getByText(/Review Flashcards/i)).toBeDefined();
    expect(screen.getByText(/Upload Document/i)).toBeDefined();
    expect(screen.getByText(/New Workspace/i)).toBeDefined();
    expect(screen.getByText(/Explore Decks/i)).toBeDefined();
  });

  it("should render populated activity list items when recent activities exist", async () => {
    const mockActivityData = {
      overview: {
        totalDocuments: 2,
        totalFlashcards: 10,
        totalQuizzes: 1,
      },
      recentActivity: {
        documents: [
          {
            _id: "doc_rec_1",
            title: "Physics Mechanics",
            lastAccessed: new Date().toISOString(),
          },
        ],
        quizzes: [],
      },
    };

    (progressService.getDashboardData as any).mockResolvedValueOnce({ data: mockActivityData });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Physics Mechanics/i)).toBeDefined();
    });

    expect(screen.getByText(/Accessed Document :/i)).toBeDefined();
  });
});
