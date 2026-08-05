import { Request, Response, NextFunction, RequestHandler } from "express";
import { validationResult } from "express-validator";

export const validateRequest: RequestHandler = (req: Request, res: Response, next: NextFunction): void | Response => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array().map((error) => error.msg).join(", "),
      statusCode: 400,
    });
  }

  return next();
};
