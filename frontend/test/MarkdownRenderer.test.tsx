import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import MarkdownRenderer from "../src/components/common/MarkdownRenderer";

describe("Frontend MarkdownRenderer Security & XSS Defense Tests", () => {
  it("should render standard markdown text and headings safely", () => {
    const markdown = "### Important Note\nThis is a normal paragraph with **bold** text.";
    render(<MarkdownRenderer content={markdown} />);

    expect(screen.getByText(/Important Note/i)).toBeDefined();
    expect(screen.getByText(/bold/i)).toBeDefined();
  });

  it("should neutralize javascript: URI scheme in markdown links to prevent DOM XSS", () => {
    const maliciousMarkdown = "[Click for free prize](javascript:alert(document.cookie))";
    render(<MarkdownRenderer content={maliciousMarkdown} />);

    const link = screen.getByRole("link", { name: /Click for free prize/i });
    expect(link.getAttribute("href")).toBe("#");
    expect(link.getAttribute("href")).not.toContain("javascript:");
  });

  it("should neutralize data: URI scheme in markdown links", () => {
    const maliciousDataMarkdown = "[Malicious data link](data:text/html,<script>alert(1)</script>)";
    render(<MarkdownRenderer content={maliciousDataMarkdown} />);

    const link = screen.getByRole("link", { name: /Malicious data link/i });
    expect(link.getAttribute("href")).toBe("#");
    expect(link.getAttribute("href")).not.toContain("data:");
  });

  it("should preserve legitimate external HTTPS links and internal anchors", () => {
    const safeMarkdown = "[Official Docs](https://studyflow.edu/docs) and [Section](#overview)";
    render(<MarkdownRenderer content={safeMarkdown} />);

    const extLink = screen.getByRole("link", { name: /Official Docs/i });
    expect(extLink.getAttribute("href")).toBe("https://studyflow.edu/docs");
    expect(extLink.getAttribute("target")).toBe("_blank");
    expect(extLink.getAttribute("rel")).toContain("noopener noreferrer");

    const anchorLink = screen.getByRole("link", { name: /Section/i });
    expect(anchorLink.getAttribute("href")).toBe("#overview");
  });
});
