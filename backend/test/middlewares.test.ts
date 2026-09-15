import { describe, it, expect, vi, beforeEach } from "vitest";
import securityHeaders from "../middlewares/securityHeaders.js";

describe("Security & Auth Middlewares Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Security Headers Middleware", () => {
    it("should set essential HTTP security headers on all responses", () => {
      const headersSet: Record<string, string> = {};
      const mockReq: any = {};
      const mockRes: any = {
        setHeader: vi.fn((key: string, val: string) => {
          headersSet[key] = val;
        }),
      };
      const mockNext = vi.fn();

      securityHeaders(mockReq, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith("X-Content-Type-Options", "nosniff");
      expect(mockRes.setHeader).toHaveBeenCalledWith("X-Frame-Options", "SAMEORIGIN");
      expect(mockRes.setHeader).toHaveBeenCalledWith("Referrer-Policy", "no-referrer-when-downgrade");
      expect(mockRes.setHeader).toHaveBeenCalledWith("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("Authentication Guard Middleware", () => {
    it("should reject requests without authorization header with 401", async () => {
      const mockReq: any = { headers: {} };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const protect = (await import("../middlewares/auth.js")).default;
      await protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining("Unauthorized"),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject requests where token does not begin with Bearer", async () => {
      const mockReq: any = { headers: { authorization: "Basic abc123" } };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const mockNext = vi.fn();

      const protect = (await import("../middlewares/auth.js")).default;
      await protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
