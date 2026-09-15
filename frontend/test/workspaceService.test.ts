import { describe, it, expect, vi, beforeEach } from "vitest";
import workspaceService from "../src/services/workspaceService";
import axiosInstance from "../src/utils/axiosInstance";

vi.mock("../src/utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Frontend WorkspaceService Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch all workspaces for user", async () => {
    const mockWorkspaces = [{ _id: "ws1", title: "Chemistry" }];
    (axiosInstance.get as any).mockResolvedValueOnce({ data: { data: mockWorkspaces } });

    const result = await workspaceService.getWorkspaces();
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/workspaces");
    expect(result).toEqual(mockWorkspaces);
  });

  it("should create a new workspace", async () => {
    const payload = { title: "Math", color: "#10B981" };
    const mockResponse = { success: true, data: { _id: "ws2", title: "Math" } };
    (axiosInstance.post as any).mockResolvedValueOnce({ data: mockResponse });

    const result = await workspaceService.createWorkspace(payload);
    expect(axiosInstance.post).toHaveBeenCalledWith("/api/workspaces", payload);
    expect(result).toEqual(mockResponse);
  });

  it("should fetch workspace by id", async () => {
    const mockWs = { _id: "ws1", title: "Chemistry", documents: [] };
    (axiosInstance.get as any).mockResolvedValueOnce({ data: { data: mockWs } });

    const result = await workspaceService.getWorkspaceById("ws1");
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/workspaces/ws1");
    expect(result).toEqual(mockWs);
  });

  it("should add documents to a workspace", async () => {
    const mockRes = { success: true, message: "Added" };
    (axiosInstance.post as any).mockResolvedValueOnce({ data: mockRes });

    const result = await workspaceService.addDocumentsToWorkspace("ws1", ["doc1", "doc2"]);
    expect(axiosInstance.post).toHaveBeenCalledWith("/api/workspaces/ws1/documents", {
      documentIds: ["doc1", "doc2"],
    });
    expect(result).toEqual(mockRes);
  });

  it("should remove document from workspace", async () => {
    const mockRes = { success: true, message: "Removed" };
    (axiosInstance.delete as any).mockResolvedValueOnce({ data: mockRes });

    const result = await workspaceService.removeDocumentFromWorkspace("ws1", "doc1");
    expect(axiosInstance.delete).toHaveBeenCalledWith("/api/workspaces/ws1/documents/doc1");
    expect(result).toEqual(mockRes);
  });

  it("should delete workspace by id", async () => {
    const mockRes = { success: true, message: "Deleted" };
    (axiosInstance.delete as any).mockResolvedValueOnce({ data: mockRes });

    const result = await workspaceService.deleteWorkspace("ws1");
    expect(axiosInstance.delete).toHaveBeenCalledWith("/api/workspaces/ws1");
    expect(result).toEqual(mockRes);
  });
});
