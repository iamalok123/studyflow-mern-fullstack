import { Request, Response, NextFunction, RequestHandler } from "express";

const securityHeaders: RequestHandler = (_req: Request, res: Response, next: NextFunction): void => {
  // Prevent MIME-sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent framing / clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Referrer Policy: Don't leak path details cross-origin
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Cross-Origin Isolations
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  // Restrict browser features and sensors
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

  // Restrict Flash / PDF cross-domain access
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");

  // HTTP Strict Transport Security (1 year + includeSubDomains + preload)
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  // API Content-Security-Policy (Restricts API framing and script execution if JSON is viewed directly)
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none';");

  next();
};

export default securityHeaders;
