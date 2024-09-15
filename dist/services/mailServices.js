"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetConfirmationEmail = exports.sendPasswordResetLinkEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = __importDefault(require("../config/env"));
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
const transporter = nodemailer_1.default.createTransport({
    host: env_1.default.mailHost,
    port: env_1.default.mailPort,
    auth: {
        user: env_1.default.mailUser,
        pass: env_1.default.mailPassword,
    },
});
const sendPasswordResetLinkEmail = async (email, resetUrl) => {
    const message = {
        from: env_1.default.mailFrom,
        to: email,
        subject: "Password Reset Request",
        text: `You have requested for a password reset. If you did not make this request, please ignore this email. Otherwise, please click on the link below to reset your password: ${resetUrl}. Note that this link will expire in 1 hour!`,
        html: `<p>You have requested for a password reset. If you did not make this request, please ignore this email. Otherwise, please click on the link below to reset your password: </p><p><a href="${resetUrl}">Reset Password</a></p> <p>Note that this link will expire in 1 hour!</p>`,
    };
    try {
        await transporter.sendMail(message);
    }
    catch (error) {
        console.log("Password reset email error: ", error.message || error);
        throw (0, errorMiddleware_1.createError)("Something went wrong while sending password reset email!", 500);
    }
};
exports.sendPasswordResetLinkEmail = sendPasswordResetLinkEmail;
const sendResetConfirmationEmail = async (email) => {
    const message = {
        from: env_1.default.mailFrom,
        to: email,
        subject: "Password Reset Successful",
        text: `Your password has been reset successfully!`,
        html: `<p>Your password has been reset successfully!</p>`,
    };
    try {
        await transporter.sendMail(message);
    }
    catch (error) {
        console.log("Password reset confirmation email error: ", error.message || error);
        throw (0, errorMiddleware_1.createError)("Something went wrong while sending password reset confirmation email!", 500);
    }
};
exports.sendResetConfirmationEmail = sendResetConfirmationEmail;
