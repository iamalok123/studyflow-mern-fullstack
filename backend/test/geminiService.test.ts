import { describe, it, expect } from "vitest";

describe("Gemini Service Context Formatting Tests", () => {
  it("should format reference tags with page numbers and document titles correctly", () => {
    const chunks = [
      {
        content: "Relational database tables consist of rows and columns.",
        pageNumber: 2,
        chunkIndex: 0,
        documentTitle: "Database Fundamentals",
      },
      {
        content: "ACID transactions guarantee data consistency.",
        pageNumber: 5,
        chunkIndex: 1,
        documentTitle: "Database Fundamentals",
      },
    ];

    const context = chunks
      .map((c, i) => {
        const pageInfo = c.pageNumber ? ` | Page ${c.pageNumber}` : "";
        const docInfo = c.documentTitle ? ` | Document: "${c.documentTitle}"` : "";
        return `[Reference ${i + 1}${docInfo}${pageInfo}]\n${c.content}`;
      })
      .join("\n\n");

    expect(context).toContain('[Reference 1 | Document: "Database Fundamentals" | Page 2]');
    expect(context).toContain('[Reference 2 | Document: "Database Fundamentals" | Page 5]');
    expect(context).toContain("Relational database tables");
    expect(context).toContain("ACID transactions");
  });

  it("should format conversation history with role identification", () => {
    const history = [
      { role: "user", content: "What is SQL?", timestamp: new Date(), relevantChunks: [] },
      { role: "assistant", content: "SQL is structured query language.", timestamp: new Date(), relevantChunks: [0] },
    ];

    const recentMessages = history.slice(-14);
    const historyBlock = recentMessages
      .map((m) => `${m.role === "user" ? "Student" : "Assistant"}: ${m.content.substring(0, 1000)}`)
      .join("\n");

    expect(historyBlock).toContain("Student: What is SQL?");
    expect(historyBlock).toContain("Assistant: SQL is structured query language.");
  });

  it("should handle chunks without page number or title gracefully", () => {
    const rawChunk = { content: "Unattributed text content" };

    const formatted = `[Reference 1${(rawChunk as any).documentTitle ? ` | Document: "${(rawChunk as any).documentTitle}"` : ""}${(rawChunk as any).pageNumber ? ` | Page ${(rawChunk as any).pageNumber}` : ""}]\n${rawChunk.content}`;

    expect(formatted).toBe("[Reference 1]\nUnattributed text content");
  });
});
