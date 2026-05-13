const REQUIRED_ENV_VARS = [
  "MONGODB_URI",
  "JWT_SECRET",
  "FRONTEND_URL",
  "GEMINI_API_KEY",
  "GOOGLE_CLIENT_ID",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

export const validateEnv = () => {
  const production = process.env.NODE_ENV === "production";
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(", ")}`;

    if (production) {
      throw new Error(message);
    }

    console.warn(message);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    const message = "JWT_SECRET should be at least 32 characters long.";

    if (production) {
      throw new Error(message);
    }

    console.warn(message);
  }
};
