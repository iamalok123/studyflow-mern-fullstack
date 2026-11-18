import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import dns from "node:dns";

const maskUri = (uri: string): string => {
  return uri.replace(/\/\/(.*?):(.*?)@/, "//$1:******@");
};

const runDbCheck = async (): Promise<void> => {
  const dnsServers = (process.env.MONGODB_DNS_SERVERS || "8.8.8.8,1.1.1.1")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (dnsServers.length > 0) {
    try {
      dns.setServers(dnsServers);
    } catch {
      // Ignore
    }
  }

  const uri = (
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    process.env.MONGODB_URL ||
    ""
  ).trim();

  console.log("=================================================");
  console.log("🔍 StudyFlow MongoDB Diagnostics Tool");
  console.log("=================================================");

  if (!uri) {
    console.error("❌ MongoDB connection URI is not set in backend/.env (checked MONGODB_URI, MONGO_URI, MONGO_URL, MONGODB_URL)");
    process.exit(1);
  }

  console.log(`📌 Target URI: ${maskUri(uri)}`);

  // Check database name in URI
  try {
    const parsed = new URL(uri);
    const dbName = (parsed.pathname || "").replace(/^\//, "");
    if (!dbName) {
      console.warn("⚠️ Warning: No database name specified (e.g. /studyflow). Mongoose will default to 'test'.");
    } else {
      console.log(`✅ Database name specified: "${dbName}"`);
    }

    if (uri.startsWith("mongodb+srv://")) {
      const host = parsed.hostname;
      console.log(`🌐 Checking DNS SRV record for host: ${host}...`);
      try {
        const srvRecords = await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
        console.log(`✅ SRV DNS lookup succeeded (${srvRecords.length} node(s) found):`);
        srvRecords.forEach((r, i) => console.log(`   Node ${i + 1}: ${r.name}:${r.port}`));
      } catch (dnsErr: any) {
        console.error(`❌ SRV DNS lookup FAILED: ${dnsErr.message}`);
        console.log("\n💡 Troubleshooting Hint:");
        console.log("   - If using MongoDB Atlas free-tier (M0), the cluster may have been paused or deleted after 60 days of inactivity.");
        console.log("   - Log into https://cloud.mongodb.com to resume your cluster or create a new one.");
        console.log("   - Make sure IP 0.0.0.0/0 is whitelisted under Network Access.\n");
      }
    }
  } catch (err: any) {
    console.warn("Could not parse URI structure:", err.message);
  }

  console.log("🔌 Attempting Mongoose connection (timeout: 10s)...");
  const startTime = Date.now();

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });

    const elapsed = Date.now() - startTime;
    console.log(`✅ Successfully connected to MongoDB in ${elapsed}ms!`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   State: Connected (readyState: ${mongoose.connection.readyState})`);

    const collections = await mongoose.connection.db?.listCollections().toArray();
    console.log(`📂 Collections found (${collections?.length || 0}):`);
    collections?.forEach((c) => console.log(`   - ${c.name}`));

    await mongoose.disconnect();
    console.log("\n🎉 All database checks passed! Connection is ready.");
    process.exit(0);
  } catch (connErr: any) {
    const elapsed = Date.now() - startTime;
    console.error(`\n❌ MongoDB Connection Failed after ${elapsed}ms:`);
    console.error(`   Error: ${connErr.message}`);

    if (connErr.message.includes("bad auth") || connErr.message.includes("Authentication failed")) {
      console.log("🔑 Authentication Failure: Check your MongoDB username and password in backend/.env.");
    } else if (connErr.message.includes("ENOTFOUND")) {
      console.log("🌐 Host Not Found: The cluster hostname does not exist in DNS. Check your Atlas dashboard.");
    }

    console.log("\n💡 Next Steps to Restore Connection:");
    console.log("   1. Open https://cloud.mongodb.com and ensure your cluster is ACTIVE.");
    console.log("   2. Whitelist 0.0.0.0/0 under Network Access.");
    console.log("   3. Click Connect -> Drivers -> copy connection string with /studyflow.");
    console.log("   4. Update MONGODB_URI in backend/.env\n");

    process.exit(1);
  }
};

runDbCheck();
