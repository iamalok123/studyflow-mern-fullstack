const stores = new Map();

const getClientKey = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim();

  return ip || req.ip || req.socket?.remoteAddress || "unknown";
};

export const createRateLimiter = ({
  windowMs = 60 * 1000,
  max = 60,
  message = "Too many requests. Please try again shortly.",
  keyPrefix = "global",
} = {}) => {
  if (!stores.has(keyPrefix)) {
    stores.set(keyPrefix, new Map());
  }

  const store = stores.get(keyPrefix);

  return (req, res, next) => {
    const now = Date.now();
    const key = getClientKey(req);
    const record = store.get(key);

    if (!record || record.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(max - 1));
      return next();
    }

    record.count += 1;
    const remaining = Math.max(0, max - record.count);

    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("Retry-After", String(Math.ceil((record.resetAt - now) / 1000)));

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        error: message,
        statusCode: 429,
      });
    }

    return next();
  };
};

