import mongoose from "mongoose";
import dns from "node:dns";

let connectionPromise = null;
let dnsConfigured = false;
let lastErrorLogAt = 0;
let lastErrorMessage = "";

const MONGO_OPTIONS = {
    serverSelectionTimeoutMS: 8000,
};

const DNS_TIMEOUT_MS = Number.parseInt(process.env.MONGODB_DNS_TIMEOUT_MS, 10) || 5000;
const CONNECT_TIMEOUT_MS = Number.parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS, 10) || 12000;

const withTimeout = (promise, timeoutMs, message) => {
    let timer;

    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    });

    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const configureMongoDns = () => {
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

const getSrvHostFromUri = (uri) => {
    try {
        return new URL(uri).hostname;
    } catch {
        return null;
    }
};

const verifySrvRecord = async (uri) => {
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

const getMongoErrorHint = (error) => {
    const message = error?.message || "";

    if (message.includes("querySrv") || message.includes("SRV DNS") || message.includes("ENOTFOUND") || message.includes("ECONNREFUSED")) {
        return "Using DNS fallback if configured. Check internet/DNS, VPN/firewall, and MongoDB Atlas network access.";
    }

    if (message.includes("bad auth") || message.includes("Authentication failed")) {
        return "Check the username and password in MONGODB_URI.";
    }

    return "Check MongoDB availability and connection settings.";
};

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not configured.");
        }

        if (process.env.MONGODB_URI.startsWith("mongodb+srv://")) {
            configureMongoDns();
            await verifySrvRecord(process.env.MONGODB_URI);
        }

        const rawConnectionPromise = mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
        rawConnectionPromise.catch(() => {});
        connectionPromise = withTimeout(
            rawConnectionPromise,
            CONNECT_TIMEOUT_MS,
            `MongoDB connection timed out after ${CONNECT_TIMEOUT_MS}ms`
        );
        const conn = await connectionPromise;
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn.connection;
    } catch (error) {
        connectionPromise = null;
        const now = Date.now();
        const message = error.message;
        const shouldLog = message !== lastErrorMessage || now - lastErrorLogAt > 60_000;

        if (shouldLog) {
            lastErrorLogAt = now;
            lastErrorMessage = message;
            console.error(`MongoDB unavailable: ${message}. ${getMongoErrorHint(error)}`);
        }

        throw error;
    }
};

export const getDbStatus = () => {
    const states = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
    };

    return states[mongoose.connection.readyState] || "unknown";
};

export default connectDB;
