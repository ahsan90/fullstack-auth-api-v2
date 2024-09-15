import { Request, Response, NextFunction } from "express";

// Custom error class for application-specific errors
class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware for handling errors
const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default values for error response
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Something went wrong";

  // Log the error details (useful for debugging)
  console.error("Error:", err);

  // Handle specific error types or status codes as needed
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
  }

  // Send error response
  res.status(statusCode).json({
    status,
    message,
  });
};

// Helper function to create an operational error
const createError = (message: string, statusCode: number) =>
  new AppError(message, statusCode);

export { errorHandler, createError };
