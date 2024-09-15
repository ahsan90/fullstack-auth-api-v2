"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.errorHandler = void 0;
// Custom error class for application-specific errors
class AppError extends Error {
    statusCode;
    status;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
// Middleware for handling errors
const errorHandler = (err, req, res, next) => {
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
exports.errorHandler = errorHandler;
// Helper function to create an operational error
const createError = (message, statusCode) => new AppError(message, statusCode);
exports.createError = createError;
