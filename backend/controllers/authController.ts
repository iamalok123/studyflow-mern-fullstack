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

/**
 * Canonicalizes an email address for consistent indexing, lookup, and linking
 * across local password authentication and Google OAuth.
 * - Trims whitespace and converts to lowercase
 * - Strips Gmail/Googlemail dots (e.g. john.doe -> johndoe) and subaddresses (+tag)
 * - Normalizes googlemail.com to gmail.com
 * - Removes subaddresses for major providers (Outlook, Hotmail, Live, iCloud)
 */
export const canonicalizeEmail = (email: string): string => {
  if (!email || typeof email !== "string") return "";
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex === -1) return trimmed;

  const localPart = trimmed.slice(0, atIndex);
  let domainPart = trimmed.slice(atIndex + 1);

  if (domainPart === "googlemail.com") {
    domainPart = "gmail.com";
  }

  if (domainPart === "gmail.com") {
    const cleanLocal = localPart.replace(/\./g, "").split("+")[0];
    return `${cleanLocal}@${domainPart}`;
  }

  if (["outlook.com", "hotmail.com", "live.com", "icloud.com"].includes(domainPart)) {
    const cleanLocal = localPart.split("+")[0];
    return `${cleanLocal}@${domainPart}`;
  }

  return `${localPart}@${domainPart}`;
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

    const trimmedUsername = username.trim();
    const rawEmail = email.trim().toLowerCase();
    const canonicalEmail = canonicalizeEmail(email);

    // Check if user exists using canonical email, raw email, or username
    const userExists = await User.findOne({
      $or: [
        { email: canonicalEmail },
        { email: rawEmail },
        { username: trimmedUsername },
      ],
    });

    if (userExists) {
      const isEmailMatch = userExists.email === canonicalEmail || userExists.email === rawEmail;
      return res.status(400).json({
        success: false,
        error: isEmailMatch ? "Email already registered." : "Username already taken.",
        statusCode: 400,
      });
    }

    // Create a new user with canonicalEmail
    const user = await User.create({
      username: trimmedUsername,
      email: canonicalEmail,
      password,
    });

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
          authProvider: user.authProvider || "local",
          googleId: user.googleId,
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

    const rawEmail = email.trim().toLowerCase();
    const canonicalEmail = canonicalizeEmail(email);

    // Check if user exists matching either canonical or raw email format
    const user = await User.findOne({
      $or: [{ email: canonicalEmail }, { email: rawEmail }],
    }).select("+password");

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
          authProvider: user.authProvider || (user.googleId ? "google" : "local"),
          googleId: user.googleId,
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
        authProvider: user.authProvider || (user.googleId ? "google" : "local"),
        googleId: user.googleId,
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
        authProvider: user.authProvider || (user.googleId ? "google" : "local"),
        googleId: user.googleId,
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
    if (user.authProvider === "google" || user.googleId || !user.password) {
      return res.status(400).json({
        success: false,
        error: "Google account users cannot change password directly. Please manage your security in your Google Account.",
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

    const rawEmail = email.trim().toLowerCase();
    const canonicalEmail = canonicalizeEmail(email);

    // Check if user already exists by googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if an existing user exists with same email (canonical or raw format)
      user = await User.findOne({
        $or: [{ email: canonicalEmail }, { email: rawEmail }],
      });

      if (user) {
        // Link Google account to existing local user
        user.googleId = googleId;
        user.authProvider = "google";
        if (picture && (!user.profileImage || user.profileImage.includes("cdn-icons-png"))) {
          user.profileImage = picture;
        }
        // Harmonize stored email to canonical format for consistency
        user.email = canonicalEmail;
        await user.save();
      } else {
        // Create new Google user with canonical email
        // Generate a unique username from the Google name
        let username = (name || "user").replace(/\s+/g, "").toLowerCase();
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
          username = `${username}${Date.now().toString().slice(-4)}`;
        }

        user = await User.create({
          username,
          email: canonicalEmail,
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
          googleId: user.googleId,
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
