import { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import { Types } from "mongoose";

// Generate JWT Token
const generateToken = (id: Types.ObjectId | string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET as Secret, {
    expiresIn: (process.env.JWT_EXPIRE || "7d") as jwt.SignOptions["expiresIn"],
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
        statusCode: 400,
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error:
          userExists.email === email
            ? "Email already registered."
            : "Username already taken.",
        statusCode: 400,
      });
    }

    // Create a new user
    const user = await User.create({ username, email, password });

    // generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Error: ", error);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
        statusCode: 400,
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        statusCode: 401,
      });
    }

    // Check if password is correct
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        statusCode: 401,
      });
    }

    // generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Error: ", error);
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        statusCode: 404,
      });
    }
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error: ", error);
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { username } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        statusCode: 404,
      });
    }

    if (username) user.username = username;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error: ", error);
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
        statusCode: 400,
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found", statusCode: 404 });
    }

    // Google OAuth users cannot change password
    if (user.authProvider === "google") {
      return res.status(400).json({
        success: false,
        error: "Google account users cannot change password",
        statusCode: 400,
      });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid current password",
        statusCode: 401,
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error: ", error);
    next(error);
  }
};

// @desc    Login/Register with Google OAuth
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        error: "Google credential is required",
        statusCode: 400,
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID is not set in environment variables.");
      return res.status(500).json({
        success: false,
        error: "Google OAuth is not configured on the server.",
        statusCode: 500,
      });
    }

    // Create a fresh client so it always uses the current env value
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({
        success: false,
        error: "Invalid Google token payload",
        statusCode: 401,
      });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Google account does not have an email.",
        statusCode: 400,
      });
    }

    // Check if user already exists by googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if a local user exists with same email
      user = await User.findOne({ email });

      if (user) {
        // Link Google account to existing local user
        user.googleId = googleId;
        user.authProvider = "google";
        if (picture) user.profileImage = picture;
        await user.save();
      } else {
        // Create new Google user
        // Generate a unique username from the Google name
        let username = (name || "user").replace(/\s+/g, "").toLowerCase();
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
          username = `${username}${Date.now().toString().slice(-4)}`;
        }

        user = await User.create({
          username,
          email,
          googleId,
          authProvider: "google",
          profileImage: picture || undefined,
        });
      }
    }

    // Generate JWT token (same as regular login)
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Google login successful",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          authProvider: user.authProvider,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error("Google Auth Error: ", error.message);
    // Surface common Google token verification errors as 401 instead of 500
    const knownErrors = [
      "Token used too late",
      "Invalid token",
      "Wrong number of segments",
      "audience mismatch",
      "Invalid value at",
    ];
    if (knownErrors.some((msg) => error.message?.includes(msg))) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired Google token. Please try again.",
        statusCode: 401,
      });
    }
    next(error);
  }
};
