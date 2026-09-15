import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.CLOUDINARY_API_SECRET = "mock_secret_12345";
process.env.CLOUDINARY_API_KEY = "mock_key_12345";
process.env.CLOUDINARY_CLOUD_NAME = "mock_cloud";

vi.mock("../config/cloudinary.js", () => ({
  default: () => ({
    utils: {
      api_sign_request: vi.fn().mockReturnValue("mocked_signature_xyz"),
    },
    uploader: {
      destroy: vi.fn().mockResolvedValue({ result: "ok" }),
    },
  }),
}));

describe("Document Controller Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Cloudinary Upload Signature", () => {
    it("should generate a valid upload signature with timestamp and folder", async () => {
      const mockReq: any = {};
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { getUploadSignature } = await import("../controllers/documentController.js");
      getUploadSignature(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          folder: "studyflow/documents",
          cloudName: "mock_cloud",
          apiKey: "mock_key_12345",
          signature: "mocked_signature_xyz",
        })
      );
    });
  });

  describe("Document Upload Validation", () => {
    it("should return 400 when essential upload metadata is missing", async () => {
      const mockReq: any = {
        user: { _id: "user_test_1" },
        body: { title: "My Notes" }, // missing cloudinaryUrl, cloudinaryPublicId, fileName
      };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { uploadDocument } = await import("../controllers/documentController.js");
      await uploadDocument(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Missing required document data",
        })
      );
    });

    it("should return 401 when unauthenticated user attempts to upload", async () => {
      const mockReq: any = {
        user: undefined,
        body: { title: "Notes", cloudinaryUrl: "https://cloud/doc.pdf", cloudinaryPublicId: "doc_1", fileName: "doc.pdf" },
      };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { uploadDocument } = await import("../controllers/documentController.js");
      await uploadDocument(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Unauthorized",
        })
      );
    });
  });

  describe("Document Retrieval & Access", () => {
    it("should reject getDocument without authenticated user", async () => {
      const mockReq: any = { user: undefined, params: { id: "doc123" } };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { getDocument } = await import("../controllers/documentController.js");
      await getDocument(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should reject getDocuments list without authenticated user", async () => {
      const mockReq: any = { user: undefined };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { getDocuments } = await import("../controllers/documentController.js");
      await getDocuments(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});
