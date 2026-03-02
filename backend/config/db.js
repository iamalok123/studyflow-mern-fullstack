import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        // In serverless (Vercel), do NOT call process.exit — just throw so the
        // request gets a proper 500 and the function can retry on next invocation.
        throw error;
    }
};

export default connectDB;