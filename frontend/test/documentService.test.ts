import { describe, it, expect, vi, beforeEach } from "vitest";
import documentService from "../src/services/documentService";
import axiosInstance from "../src/utils/axiosInstance";

vi.mock("../src/utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Frontend DocumentService Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch all user documents", async () => {
    const mockDocs = [{ _id: "doc1", title: "CS Notes", vectorStatus: "indexed" }];
    (axiosInstance.get as any).mockResolvedValueOnce({ data: { data: mockDocs } });

    const result = await documentService.getDocuments();
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/documents");
    expect(result).toEqual(mockDocs);
  });

  it("should get Cloudinary upload signature", async () => {
    const mockSig = { signature: "sig123", timestamp: 12345678, cloudName: "testcloud" };
    (axiosInstance.get as any).mockResolvedValueOnce({ data: mockSig });

    const result = await documentService.getUploadSignature();
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/documents/upload-signature");
    expect(result).toEqual(mockSig);
  });

  it("should upload document metadata", async () => {
    const payload = { title: "Biology", cloudinaryUrl: "https://url.pdf", cloudinaryPublicId: "id1" };
    const mockResponse = { success: true, data: { _id: "doc2", title: "Biology" } };
    (axiosInstance.post as any).mockResolvedValueOnce({ data: mockResponse });

    const result = await documentService.uploadDocument(payload);
    expect(axiosInstance.post).toHaveBeenCalledWith("/api/documents/upload", payload);
    expect(result).toEqual(mockResponse);
  });

  it("should delete document by id", async () => {
    const mockRes = { success: true, message: "Document deleted" };
    (axiosInstance.delete as any).mockResolvedValueOnce({ data: mockRes });

    const result = await documentService.deleteDocument("doc_delete_id");
    expect(axiosInstance.delete).toHaveBeenCalledWith("/api/documents/doc_delete_id");
    expect(result).toEqual(mockRes);
  });

  it("should fetch single document by id", async () => {
    const mockDoc = { success: true, data: { _id: "doc_single", title: "Physics" } };
    (axiosInstance.get as any).mockResolvedValueOnce({ data: mockDoc });

    const result = await documentService.getDocumentById("doc_single");
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/documents/doc_single");
    expect(result).toEqual(mockDoc);
  });
});
