import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ChatInterface from "../src/components/chat/ChatInterface";
import aiService from "../src/services/aiService";

vi.mock("../src/services/aiService", () => ({
  default: {
    getChatHistory: vi.fn(),
    streamChat: vi.fn(),
  },
}));

vi.mock("../src/context/useAuth", () => ({
  useAuth: () => ({
    user: { _id: "u1", username: "Alok" },
    isAuthenticated: true,
  }),
}));

describe("Frontend ChatInterface Component Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render chat history messages and citation chips", async () => {
    const mockMessages = [
      {
        role: "user",
        content: "What is cellular respiration?",
        timestamp: new Date().toISOString(),
      },
      {
        role: "assistant",
        content: "Cellular respiration converts biochemical energy into ATP.",
        timestamp: new Date().toISOString(),
        citations: [
          { pageNumber: 4, documentTitle: "Biology Book" },
          { pageNumber: 9, documentTitle: "Biology Book" },
        ],
      },
    ];

    (aiService.getChatHistory as any).mockResolvedValueOnce(mockMessages);

    render(
      <MemoryRouter initialEntries={["/documents/doc_123"]}>
        <Routes>
          <Route path="/documents/:id" element={<ChatInterface />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/What is cellular respiration\?/i)).toBeDefined();
    });

    expect(screen.getByText(/Cellular respiration converts/i)).toBeDefined();
    expect(screen.getByText(/Sources:/i)).toBeDefined();
    expect(screen.getByText(/Page 4/i)).toBeDefined();
    expect(screen.getByText(/Page 9/i)).toBeDefined();
  });

  it("should display empty state with prompt suggestions when history is empty", async () => {
    (aiService.getChatHistory as any).mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={["/documents/doc_empty"]}>
        <Routes>
          <Route path="/documents/:id" element={<ChatInterface />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Start a Conversation/i)).toBeDefined();
    });

    expect(screen.getByText(/Ask me anything about your document/i)).toBeDefined();
  });
});
