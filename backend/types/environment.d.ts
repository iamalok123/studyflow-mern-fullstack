declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: "development" | "production" | "test";
      PORT?: string;
      FRONTEND_URL?: string;
      MONGODB_URI?: string;
      MONGODB_DNS_SERVERS?: string;
      MONGODB_DNS_TIMEOUT_MS?: string;
      MONGODB_CONNECT_TIMEOUT_MS?: string;
      MAX_FILE_SIZE?: string;
      JWT_SECRET?: string;
      JWT_EXPIRE?: string;
      GOOGLE_CLIENT_ID?: string;
      GEMINI_API_KEY?: string;
      CLOUDINARY_CLOUD_NAME?: string;
      CLOUDINARY_API_KEY?: string;
      CLOUDINARY_API_SECRET?: string;
    }
  }
}

export {};
