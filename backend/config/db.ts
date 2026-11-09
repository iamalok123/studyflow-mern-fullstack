import mongoose from "mongoose";
import dns from "node:dns";

let connectionPromise: Promise<typeof mongoose> | null = null;
let dnsConfigured = false;
let lastErrorLogAt = 0;
let lastErrorMessage = "";
let lastFailedAt = 0;
let lastError: Error | null = null;

const DNS_TIMEOUT_MS = Number.parseInt(process.env.MONGODB_DNS_TIMEOUT_MS || "", 10) || 5000;
const CONNECT_TIMEOUT_MS = Number.parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS || "", 10) || 12000;
const CONNECT_COOLDOWN_MS = Number.parseInt(process.env.MONGODB_CONNECT_COOLDOWN_MS || "", 10) || 5000;

const MONGO_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 8000,
  maxPoolSize: 10,
  minPoolSize: 0,
  connectTimeoutMS: CONNECT_TIMEOUT_MS,
  socketTimeoutMS: 45000,
};

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> => {
  let timer: NodeJS.Timeout;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const configureMongoDns = (): void => {
  if (dnsConfigured) {
    return;
  }

  dnsConfigured = true;

  const servers = (process.env.MONGODB_DNS_SERVERS || "1.1.1.1,8.8.8.8")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length === 0) {
    return;
  }

  try {
    dns.setServers(servers);
  } catch {
    // Keep startup quiet; invalid DNS config will surface through Mongo connection status.
  }
};

const getSrvHostFromUri = (uri: string): string | null => {
  try {
    return new URL(uri).hostname;
  } catch {
    return null;
  }
};

const verifySrvRecord = async (uri: string): Promise<void> => {
  const host = getSrvHostFromUri(uri);

  if (!host) {
    throw new Error("Invalid MONGODB_URI.");
  }

  await withTimeout(
    dns.promises.resolveSrv(`_mongodb._tcp.${host}`),
    DNS_TIMEOUT_MS,
    `MongoDB SRV DNS lookup timed out after ${DNS_TIMEOUT_MS}ms for ${host}`
  );
};

const checkMongoUriWarning = (uri: string): void => {
  try {
    const url = new URL(uri);
    const dbName = (url.pathname || "").replace(/^\//, "");
    if (!dbName) {
      console.warn("MongoDB Notice: No database name found in MONGODB_URI path (e.g. mongodb.net/studyflow). Mongoose will default to 'test' database.");
    }
  } catch {
    // Non-fatal warning check
  }
};

export const getMongoErrorHint = (error: unknown): string => {
  const err = error as { message?: string; code?: string };
  const message = err?.message || "";

  if (message.includes("querySrv ENOTFOUND") || (err?.code === "ENOTFOUND" && message.includes("querySrv"))) {
    return "MongoDB Atlas cluster host not found in DNS. The cluster has likely been paused or terminated by Atlas due to inactivity, or the host in MONGODB_URI is mistyped. Verify your cluster status at https://cloud.mongodb.com and update MONGODB_URI.";
  }

  if (message.includes("ENOTFOUND") || message.includes("SRV DNS") || message.includes("ECONNREFUSED")) {
    return "Network error reaching MongoDB. Check your internet connection, DNS configuration, and MongoDB Atlas IP Access List (whitelist 0.0.0.0/0).";
  }

  if (message.includes("bad auth") || message.includes("Authentication failed") || message.includes("auth error")) {
    return "Authentication failed. Check the username and password in MONGODB_URI in backend/.env.";
  }

  return "Check MongoDB Atlas availability and connection settings in backend/.env.";
};

const getMongoUri = (): string => {
  return (process.env.MONGODB_URI || process.env.MONGO_URI || "").trim();
};

// Register connection lifecycle listeners idempotently for serverless container resilience
if (mongoose.connection.listenerCount("disconnected") === 0) {
  mongoose.connection.on("disconnected", () => {
    connectionPromise = null;
  });
}

if (mongoose.connection.listenerCount("close") === 0) {
  mongoose.connection.on("close", () => {
    connectionPromise = null;
  });
}

if (mongoose.connection.listenerCount("error") === 0) {
  mongoose.connection.on("error", (err) => {
    connectionPromise = null;
    const now = Date.now();
    const message = (err as Error)?.message || "Unknown MongoDB error event";
    if (message !== lastErrorMessage || now - lastErrorLogAt > 60_000) {
      lastErrorLogAt = now;
      lastErrorMessage = message;
      console.error(`MongoDB connection error event: ${message}`);
    }
  });
}

const connectDB = async (): Promise<typeof mongoose.connection> => {
  if ((mongoose.connection.readyState as number) === 1) {
    return mongoose.connection;
  }

  // Circuit breaker: Fail-fast if previous connection attempt failed recently
  const now = Date.now();
  if (lastFailedAt && now - lastFailedAt < CONNECT_COOLDOWN_MS && lastError) {
    throw lastError;
  }

  if (connectionPromise) {
    try {
      await connectionPromise;
      if ((mongoose.connection.readyState as number) === 1) {
        return mongoose.connection;
      }
      connectionPromise = null;
    } catch {
      connectionPromise = null;
    }
  }

  try {
    const mongoUri = getMongoUri();
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not configured.");
    }

    checkMongoUriWarning(mongoUri);

    if (mongoUri.startsWith("mongodb+srv://") && process.env.VERCEL !== "1") {
      try {
        configureMongoDns();
        await verifySrvRecord(mongoUri);
      } catch (dnsErr: any) {
        console.warn("DNS pre-check warning:", dnsErr?.message || dnsErr);
      }
    }

    const rawConnectionPromise = mongoose.connect(mongoUri, MONGO_OPTIONS);
    rawConnectionPromise.catch(() => {});
    connectionPromise = withTimeout(
      rawConnectionPromise,
      CONNECT_TIMEOUT_MS,
      `MongoDB connection timed out after ${CONNECT_TIMEOUT_MS}ms`
    );
    const conn = await connectionPromise;
    console.log(`MongoDB connected: ${conn.connection.host}`);
    lastFailedAt = 0;
    lastError = null;
    return conn.connection;
  } catch (error) {
    connectionPromise = null;
    const failNow = Date.now();
    lastFailedAt = failNow;
    const err = error as Error;
    lastError = err;
    const message = err.message || "Unknown MongoDB error";
    const shouldLog = message !== lastErrorMessage || failNow - lastErrorLogAt > 60_000;

    if (shouldLog) {
      lastErrorLogAt = failNow;
      lastErrorMessage = message;
      console.error(`MongoDB unavailable: ${message}. ${getMongoErrorHint(error)}`);
    }

    throw error;
  }
};

export const getDbStatus = (): string => {
  const states: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return states[mongoose.connection.readyState] || "unknown";
};

export const getDbDetailedStatus = (): {
  status: string;
  readyState: number;
  lastError: string | null;
  errorHint: string | null;
  host?: string;
} => {
  return {
    status: getDbStatus(),
    readyState: mongoose.connection.readyState,
    lastError: lastErrorMessage || null,
    errorHint: lastError ? getMongoErrorHint(lastError) : null,
    host: mongoose.connection.host || undefined,
  };
};

export default connectDB;
