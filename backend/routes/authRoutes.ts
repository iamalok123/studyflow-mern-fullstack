import express, { Request, Response, NextFunction } from "express";
import { body, validationResult, ValidationChain } from "express-validator";
import { register, login, getProfile, updateProfile, changePassword, googleLogin } from "../controllers/authController.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

// Middleware to check validation results
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void | Response => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array().map((e) => e.msg).join(", "),
      statusCode: 400,
    });
  }
  next();
};

// Validation Middleware
const registerValidation: ValidationChain[] = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

const loginValidation: ValidationChain[] = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

const profileUpdateValidation: ValidationChain[] = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters"),
];

const changePasswordValidation: ValidationChain[] = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters"),
];

const googleLoginValidation: ValidationChain[] = [
  body("credential")
    .isString()
    .isLength({ min: 20 })
    .withMessage("Google credential is required"),
];

// Public Routes
router.post("/register", registerValidation, handleValidationErrors, register);
router.post("/login", loginValidation, handleValidationErrors, login);
router.post("/google", googleLoginValidation, handleValidationErrors, googleLogin);

// Protected Routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, profileUpdateValidation, handleValidationErrors, updateProfile);
router.put("/change-password", protect, changePasswordValidation, handleValidationErrors, changePassword);

export default router;
