import nodemailer from "nodemailer";
import envConfig from "../config/env";
import { createError } from "../middlewares/errorMiddleware";

const transporter = nodemailer.createTransport({
    host: envConfig.mailHost,
    port: envConfig.mailPort,
    auth: {
        user: envConfig.mailUser,
        pass: envConfig.mailPassword,
    },
});

export const sendPasswordResetLinkEmail = async (email: string, resetUrl: string) => {
    const message = {
      from: envConfig.mailFrom,
      to: email,
      subject: "Password Reset Request",
      text: `You have requested for a password reset. If you did not make this request, please ignore this email. Otherwise, please click on the link below to reset your password: ${resetUrl}. Note that this link will expire in 1 hour!`,
      html: `<p>You have requested for a password reset. If you did not make this request, please ignore this email. Otherwise, please click on the link below to reset your password: </p><p><a href="${resetUrl}">Reset Password</a></p> <p>Note that this link will expire in 1 hour!</p>`,
    };
    try {
        await transporter.sendMail(message);
    } catch (error: any) {
        console.log("Password reset email error: ", error.message! || error);
        throw createError("Something went wrong while sending password reset email!", 500);
    }
}

export const sendResetConfirmationEmail = async (email: string) => {
    const message = {
        from: envConfig.mailFrom,
        to: email,
        subject: "Password Reset Successful",
        text: `Your password has been reset successfully!`,
        html: `<p>Your password has been reset successfully!</p>`,
    }
    try {
        await transporter.sendMail(message);
    } catch (error: any) {
        console.log("Password reset confirmation email error: ", error.message! || error);
        throw createError("Something went wrong while sending password reset confirmation email!", 500);
    }
}