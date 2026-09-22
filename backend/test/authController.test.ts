import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

// Set mock environment variables
process.env.JWT_SECRET = "test_super_secret_jwt_key_12345";
process.env.JWT_EXPIRE = "7d";

describe("Auth Controller Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Registration Logic", () => {
    it("should reject registration when required fields are missing", async () => {
      const mockReq: any = {
        body: { username: "alok", email: "" }, // missing password & email
      };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { register } = await import("../controllers/authController.js");
      await register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "All fields are required",
        })
      );
    });

    it("should generate a valid signed JWT containing user ID", () => {
      const userId = "64f1a2b3c4d5e6f7a8b9c0d1";
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
        expiresIn: "7d",
      });

      expect(token).toBeDefined();
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      expect(decoded.id).toBe(userId);
    });
  });

  describe("Login Logic", () => {
    it("should reject login when email or password is omitted", async () => {
      const mockReq: any = {
        body: { email: "user@example.com" }, // missing password
      };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { login } = await import("../controllers/authController.js");
      await login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "All fields are required",
        })
      );
    });
  });

  describe("Profile Verification", () => {
    it("should return 401 when requesting profile without user in request", async () => {
      const mockReq: any = { user: undefined };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { getProfile } = await import("../controllers/authController.js");
      await getProfile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Unauthorized",
        })
      );
    });

    it("should return user profile data when user is present in request", async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId("64f1a2b3c4d5e6f7a8b9c0d1"),
        username: "testlearner",
        email: "learner@test.com",
        profileImage: "https://avatar.png",
        createdAt: new Date(),
      };

      vi.spyOn(User, "findById").mockResolvedValue(mockUser as any);

      const mockReq: any = {
        user: mockUser,
      };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const { getProfile } = await import("../controllers/authController.js");
      await getProfile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            username: "testlearner",
            email: "learner@test.com",
          }),
        })
      );
    });
  });

  describe("Email Canonicalization & Normalization", () => {
    it("should strip dots and plus tags for Gmail and Googlemail", async () => {
      const { canonicalizeEmail } = await import("../controllers/authController.js");
      expect(canonicalizeEmail("John.Doe@gmail.com")).toBe("johndoe@gmail.com");
      expect(canonicalizeEmail("first.last+study@gmail.com")).toBe("firstlast@gmail.com");
      expect(canonicalizeEmail("user@googlemail.com")).toBe("user@gmail.com");
    });

    it("should preserve dots for non-Gmail domains and normalize subaddresses where applicable", async () => {
      const { canonicalizeEmail } = await import("../controllers/authController.js");
      expect(canonicalizeEmail("Jane.Doe@outlook.com")).toBe("jane.doe@outlook.com");
      expect(canonicalizeEmail("user.name+tag@outlook.com")).toBe("user.name@outlook.com");
      expect(canonicalizeEmail("Student.Name@yahoo.com")).toBe("student.name@yahoo.com");
    });

    it("should handle empty or malformed strings gracefully", async () => {
      const { canonicalizeEmail } = await import("../controllers/authController.js");
      expect(canonicalizeEmail("")).toBe("");
      expect(canonicalizeEmail("invalid-email")).toBe("invalid-email");
    });
  });
});
