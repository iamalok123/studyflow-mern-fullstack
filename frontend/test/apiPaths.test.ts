import { describe, it, expect } from "vitest";
import { API_PATHS, BASE_URL } from "../src/utils/apiPaths";

describe("Frontend API Paths Definition Tests", () => {
  it("should have a valid BASE_URL", () => {
    expect(BASE_URL).toBeDefined();
  });

  it("should define valid AUTH endpoints", () => {
    expect(API_PATHS.AUTH.LOGIN).toBe("/api/auth/login");
    expect(API_PATHS.AUTH.REGISTER).toBe("/api/auth/register");
    expect(API_PATHS.AUTH.GOOGLE_LOGIN).toBe("/api/auth/google");
    expect(API_PATHS.AUTH.GET_PROFILE).toBe("/api/auth/profile");
  });

  it("should generate parameterized DOCUMENT endpoints", () => {
    expect(API_PATHS.DOCUMENTS.GET_DOCUMENTS).toBe("/api/documents");
    expect(API_PATHS.DOCUMENTS.UPLOAD).toBe("/api/documents/upload");
    expect(API_PATHS.DOCUMENTS.GET_UPLOAD_SIGNATURE).toBe("/api/documents/upload-signature");
    expect(API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID("doc_123")).toBe("/api/documents/doc_123");
    expect(API_PATHS.DOCUMENTS.DELETE_DOCUMENT("doc_123")).toBe("/api/documents/doc_123");
  });

  it("should generate parameterized WORKSPACE endpoints", () => {
    expect(API_PATHS.WORKSPACES.GET_ALL).toBe("/api/workspaces");
    expect(API_PATHS.WORKSPACES.CREATE).toBe("/api/workspaces");
    expect(API_PATHS.WORKSPACES.GET_BY_ID("ws_456")).toBe("/api/workspaces/ws_456");
    expect(API_PATHS.WORKSPACES.ADD_DOCUMENTS("ws_456")).toBe("/api/workspaces/ws_456/documents");
    expect(API_PATHS.WORKSPACES.REMOVE_DOCUMENT("ws_456", "doc_1")).toBe("/api/workspaces/ws_456/documents/doc_1");
  });

  it("should generate AI Suite and Streaming Chat endpoints", () => {
    expect(API_PATHS.AI.STREAM_CHAT).toBe("/api/ai/stream-chat");
    expect(API_PATHS.AI.WORKSPACE_STREAM_CHAT).toBe("/api/ai/workspace-stream-chat");
    expect(API_PATHS.AI.GENERATE_FLASHCARDS).toBe("/api/ai/generate-flashcards");
    expect(API_PATHS.AI.GENERATE_QUIZ).toBe("/api/ai/generate-quiz");
    expect(API_PATHS.AI.GENERATE_MINDMAP).toBe("/api/ai/generate-mindmap");
    expect(API_PATHS.AI.GENERATE_SUMMARY).toBe("/api/ai/generate-summary");
    expect(API_PATHS.AI.EXPLAIN_CONCEPT).toBe("/api/ai/explain-concept");
  });

  it("should generate FLASHCARD & QUIZ endpoints", () => {
    expect(API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS).toBe("/api/flashcards");
    expect(API_PATHS.FLASHCARDS.GET_FLASHCARD_SET_BY_ID("set_1")).toBe("/api/flashcards/set/set_1");
    expect(API_PATHS.FLASHCARDS.REVIEW_FLASHCARD("card_1")).toBe("/api/flashcards/card_1/review");
    expect(API_PATHS.FLASHCARDS.TOGGLE_STAR("card_1")).toBe("/api/flashcards/card_1/star");
    expect(API_PATHS.QUIZZES.GET_ALL_QUIZZES).toBe("/api/quizzes");
    expect(API_PATHS.QUIZZES.SUBMIT_QUIZ("quiz_1")).toBe("/api/quizzes/quiz_1/submit");
  });
});
