import { v2 as cloudinary } from "cloudinary";

let configured = false;

/**
 * Returns a configured Cloudinary instance.
 * Config is deferred so that dotenv has time to load env vars
 * (ES-module imports are hoisted above dotenv.config()).
 */
const getCloudinary = () => {
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    configured = true;
  }
  return cloudinary;
};

export default getCloudinary;
