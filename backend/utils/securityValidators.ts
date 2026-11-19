/**
 * Security validation utilities for StudyFlow.
 * Enforces strict SSRF protection, URL scheme allowlisting,
 * and safe Cloudinary asset identifier boundaries.
 */

/**
 * Validates that a URL is a legitimate, HTTPS-only Cloudinary asset URL
 * belonging strictly to the application's configured Cloudinary cloud account.
 * Defends against Server-Side Request Forgery (SSRF) and metadata IP probing.
 */
export const isValidCloudinaryUrl = (
  url: string | null | undefined,
  expectedCloudName: string = process.env.CLOUDINARY_CLOUD_NAME || ""
): boolean => {
  if (!url || typeof url !== "string") return false;

  try {
    const parsed = new URL(url);

    // 1. Strict protocol check: HTTPS only
    if (parsed.protocol !== "https:") return false;

    // 2. Strict hostname check: official Cloudinary CDN only
    if (parsed.hostname !== "res.cloudinary.com") return false;

    // 3. No userinfo, custom ports, or credentials allowed
    if (parsed.username || parsed.password) return false;
    if (parsed.port && parsed.port !== "443") return false;

    // 4. Path verification: must begin with /<cloudName>/ and contain /studyflow/documents/
    const normalizedPath = parsed.pathname.toLowerCase();
    if (expectedCloudName) {
      const expectedPrefix = `/${expectedCloudName.toLowerCase()}/`;
      if (!normalizedPath.startsWith(expectedPrefix)) return false;
    }

    if (!normalizedPath.includes("/studyflow/documents/")) return false;

    return true;
  } catch {
    return false;
  }
};

/**
 * Validates that a Cloudinary public ID is strictly scoped to the studyflow/documents folder
 * and contains only safe alphanumeric/hyphen characters.
 * Defends against arbitrary asset deletion and path traversal attacks.
 */
export const isValidCloudinaryPublicId = (publicId: string | null | undefined): boolean => {
  if (!publicId || typeof publicId !== "string") return false;
  const trimmed = publicId.trim();

  // Must begin with studyflow/documents/
  if (!trimmed.startsWith("studyflow/documents/")) return false;

  // Must not contain directory traversal sequences
  if (trimmed.includes("..") || trimmed.includes("\\") || trimmed.includes("\0")) return false;

  // Strict character set validation
  const safePublicIdRegex = /^studyflow\/documents\/[a-zA-Z0-9_\-\/\.]+$/;
  return safePublicIdRegex.test(trimmed);
};

/**
 * Validates that an HTTP link scheme is safe for client-side rendering.
 * Blocks dangerous executable schemes like javascript:, data:, and vbscript:.
 */
export const isSafeLinkScheme = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();

  // Relative paths, anchor links, and mailto are safe
  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("mailto:")) {
    return true;
  }

  // Only allow http: and https: protocols
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
};
