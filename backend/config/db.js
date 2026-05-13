import mongoose from "mongoose";

let connectionPromise = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    try {
        connectionPromise = mongoose.connect(process.env.MONGODB_URI);
        const conn = await connectionPromise;
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn.connection;
    } catch (error) {
        connectionPromise = null;
        console.error("MongoDB connection error:", error.message);
        throw error;
    }
};

export default connectDB;
