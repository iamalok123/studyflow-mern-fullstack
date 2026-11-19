import { describe, it, expect } from "vitest";
import {
  isValidCloudinaryUrl,
  isValidCloudinaryPublicId,
  isSafeLinkScheme,
} from "../utils/securityValidators.js";

describe("Security Validation & SSRF Defense Unit Tests", () => {
  describe("isValidCloudinaryUrl", () => {
    const cloudName = "demo-cloud";

    it("should accept legitimate HTTPS Cloudinary URLs within the configured cloud account", () => {
      const validUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/v123456789/studyflow/documents/sample.pdf`;
      expect(isValidCloudinaryUrl(validUrl, cloudName)).toBe(true);
    });

    it("should reject non-HTTPS URLs (SSRF / plain HTTP downgrade)", () => {
      const httpUrl = `http://res.cloudinary.com/${cloudName}/raw/upload/v123456789/studyflow/documents/sample.pdf`;
      expect(isValidCloudinaryUrl(httpUrl, cloudName)).toBe(false);
    });

    it("should reject internal / cloud metadata IPs (SSRF attack vectors)", () => {
      expect(isValidCloudinaryUrl("http://169.254.169.254/latest/meta-data/", cloudName)).toBe(false);
      expect(isValidCloudinaryUrl("http://127.0.0.1:27017/", cloudName)).toBe(false);
      expect(isValidCloudinaryUrl("http://localhost:5000/api/health", cloudName)).toBe(false);
    });

    it("should reject URLs from arbitrary domains spoofing path components", () => {
      const maliciousUrl = `https://attacker-controlled.site/res.cloudinary.com/${cloudName}/studyflow/documents/sample.pdf`;
      expect(isValidCloudinaryUrl(maliciousUrl, cloudName)).toBe(false);
    });

    it("should reject URLs for a different Cloudinary tenant / cloud name", () => {
      const otherTenantUrl = `https://res.cloudinary.com/victim-cloud/raw/upload/v1/studyflow/documents/sample.pdf`;
      expect(isValidCloudinaryUrl(otherTenantUrl, cloudName)).toBe(false);
    });

    it("should reject URLs containing embedded credentials or non-standard ports", () => {
      const credentialsUrl = `https://admin:secret@res.cloudinary.com/${cloudName}/raw/upload/studyflow/documents/sample.pdf`;
      expect(isValidCloudinaryUrl(credentialsUrl, cloudName)).toBe(false);

      const customPortUrl = `https://res.cloudinary.com:8443/${cloudName}/raw/upload/studyflow/documents/sample.pdf`;
      expect(isValidCloudinaryUrl(customPortUrl, cloudName)).toBe(false);
    });

    it("should reject null, empty, or malformed URL inputs", () => {
      expect(isValidCloudinaryUrl("")).toBe(false);
      expect(isValidCloudinaryUrl(null as any)).toBe(false);
      expect(isValidCloudinaryUrl(undefined as any)).toBe(false);
      expect(isValidCloudinaryUrl("not a valid url", cloudName)).toBe(false);
    });
  });

  describe("isValidCloudinaryPublicId", () => {
    it("should accept valid public IDs inside studyflow/documents folder", () => {
      expect(isValidCloudinaryPublicId("studyflow/documents/doc_1700000000_abc")).toBe(true);
      expect(isValidCloudinaryPublicId("studyflow/documents/subfolder/file-123.pdf")).toBe(true);
    });

    it("should reject public IDs attempting path traversal", () => {
      expect(isValidCloudinaryPublicId("studyflow/documents/../../system_asset")).toBe(false);
      expect(isValidCloudinaryPublicId("studyflow/documents/..\\..\\secret")).toBe(false);
    });

    it("should reject public IDs targeting arbitrary unowned Cloudinary assets", () => {
      expect(isValidCloudinaryPublicId("avatar/user_123_photo")).toBe(false);
      expect(isValidCloudinaryPublicId("production/logos/brand")).toBe(false);
      expect(isValidCloudinaryPublicId("root_file")).toBe(false);
    });

    it("should reject null or empty public ID inputs", () => {
      expect(isValidCloudinaryPublicId("")).toBe(false);
      expect(isValidCloudinaryPublicId(null as any)).toBe(false);
      expect(isValidCloudinaryPublicId(undefined as any)).toBe(false);
    });
  });

  describe("isSafeLinkScheme", () => {
    it("should accept legitimate HTTPS and relative navigation links", () => {
      expect(isSafeLinkScheme("https://studyflow-ai.vercel.app")).toBe(true);
      expect(isSafeLinkScheme("http://localhost:5173")).toBe(true);
      expect(isSafeLinkScheme("/dashboard")).toBe(true);
      expect(isSafeLinkScheme("#section-1")).toBe(true);
      expect(isSafeLinkScheme("mailto:support@studyflow.edu")).toBe(true);
    });

    it("should reject dangerous executable browser schemes (DOM XSS vectors)", () => {
      expect(isSafeLinkScheme("javascript:alert(document.cookie)")).toBe(false);
      expect(isSafeLinkScheme("JAVASCRIPT:alert(1)")).toBe(false);
      expect(isSafeLinkScheme("data:text/html,<script>alert(1)</script>")).toBe(false);
      expect(isSafeLinkScheme("vbscript:MsgBox(1)")).toBe(false);
    });

    it("should reject empty or null inputs", () => {
      expect(isSafeLinkScheme("")).toBe(false);
      expect(isSafeLinkScheme(null as any)).toBe(false);
    });
  });
});
