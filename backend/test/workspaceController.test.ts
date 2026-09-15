import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Workspace Controller Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Workspace Creation Validation", () => {
    it("should reject workspace creation without authentication", async () => {
      const mockReq: any = { user: undefined, body: { title: "Biology 101" } };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { createWorkspace } = await import("../controllers/workspaceController.js");
      await createWorkspace(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should reject workspace creation with empty title", async () => {
      const mockReq: any = {
        user: { _id: "user123" },
        body: { title: "   ", description: "Empty title test" },
      };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { createWorkspace } = await import("../controllers/workspaceController.js");
      await createWorkspace(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Workspace title is required.",
        })
      );
    });
  });

  describe("Workspace Retrieval", () => {
    it("should reject getWorkspaces when user is unauthenticated", async () => {
      const mockReq: any = { user: undefined };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { getWorkspaces } = await import("../controllers/workspaceController.js");
      await getWorkspaces(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should reject getWorkspaceById when user is unauthenticated", async () => {
      const mockReq: any = { user: undefined, params: { id: "ws123" } };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { getWorkspaceById } = await import("../controllers/workspaceController.js");
      await getWorkspaceById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});
