import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

interface JwtPayloadWithId extends jwt.JwtPayload {
  id: string;
}

const protect = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  let token: string | undefined;

  // Check if token is present in authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // If token is not found
      if (!token) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized [Bearer token not found]",
          statusCode: 401,
        });
      }

      // Verify token
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayloadWithId;
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized [User not found]",
          statusCode: 401,
        });
      }

      req.user = user;
      return next();
    } catch (error: any) {
      console.error("Auth MiddlewareError: ", error.message);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "Unauthorized [Token Expired]",
          statusCode: 401,
        });
      }
      return res.status(401).json({
        success: false,
        error: "Unauthorized [Token failed]",
        statusCode: 401,
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized [Token not found]",
      statusCode: 401,
    });
  }
};

export default protect;
