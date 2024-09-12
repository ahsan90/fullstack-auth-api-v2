"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = exports.validateResetToken = exports.resetPassword = exports.requestResetPassword = exports.loginUser = void 0;
const db_1 = __importDefault(require("../config/db"));
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
const crypto_1 = __importDefault(require("crypto"));
const mailServices_1 = require("./mailServices");
const loginUser = async ({ email, password, }) => {
    const existingUser = await db_1.default.user.findUnique({
        where: { email },
    });
    // if (
    //   existingUser?.accountInitiatedWith === AccountInitiatedWith.GOOGLE &&
    //   existingUser?.password === null
    // ) {
    //   throw createError(
    //     "The Email is used to login with Google. Please login with Google or reset/update password to continue!",
    //     400
    //   );
    // }
    if (existingUser &&
        (await bcryptjs_1.default.compare(password, existingUser?.password))) {
        const jwtPayload = {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
        };
        const accessToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.default.accessTokenSecret, {
            expiresIn: env_1.default.accessTokenExpiration,
        });
        const refreshToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.default.refreshTokenSecret, {
            expiresIn: env_1.default.refreshTokenExpiration,
        });
        // await db.user.update({
        //   where: { id: existingUser.id },
        //   data: { refreshToken },
        // });
        return {
            accessToken,
            refreshToken,
            user: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
            },
        };
    }
    else {
        console.log("Invalid Login credentials!");
        throw (0, errorMiddleware_1.createError)("Invalid Login credentials!", 400);
    }
};
exports.loginUser = loginUser;
/*
export const logoutUser = async (userId: string) => {
  return await db.user.update({
    where: { id: userId },
    data: {
      refreshToken: null,
    },
  });
};
*/
const requestResetPassword = async (email) => {
    const user = await db_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw (0, errorMiddleware_1.createError)("User does not exist!", 404);
    }
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    const hashedResetToken = await bcryptjs_1.default.hash(resetToken, 10);
    const resetTokenExpirsAt = new Date(Date.now() + 60 * 60 * 1000);
    await db_1.default.user.update({
        where: { email },
        data: {
            passwordResetToken: hashedResetToken,
            passwordResetTokenExpires: resetTokenExpirsAt,
        },
    });
    const resetUrl = `${env_1.default.frontendUrl}/reset-password/${resetToken}/${user.id}`;
    try {
        await (0, mailServices_1.sendPasswordResetLinkEmail)(user.email, resetUrl);
        return {
            message: "Password reset link sent to your email!",
            resetToken: resetToken,
            email: user.email,
        };
    }
    catch (error) {
        throw (0, errorMiddleware_1.createError)("Something went wrong while password reset request email!", 500);
    }
};
exports.requestResetPassword = requestResetPassword;
const resetPassword = async (data) => {
    const { resetToken, id, newPassword } = data;
    const user = await db_1.default.user.findFirst({
        where: { id, passwordResetTokenExpires: { gte: new Date() } },
    });
    if (!user) {
        throw (0, errorMiddleware_1.createError)("Invalid reset token!", 400);
    }
    const isValidResetToken = await bcryptjs_1.default.compare(resetToken, user.passwordResetToken);
    if (!isValidResetToken) {
        throw (0, errorMiddleware_1.createError)("Invalid reset token!", 400);
    }
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    await db_1.default.user.update({
        where: { id },
        data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetTokenExpires: null,
        },
    });
    try {
        await (0, mailServices_1.sendResetConfirmationEmail)(user.email);
        return {
            message: "Password reset successful. Please login to continue!",
        };
    }
    catch (error) {
        throw (0, errorMiddleware_1.createError)(error.message || error, 500);
    }
};
exports.resetPassword = resetPassword;
const validateResetToken = async (resetToken, userId) => {
    const user = await db_1.default.user.findFirst({
        where: {
            id: userId,
            passwordResetTokenExpires: { gte: new Date() },
            passwordResetToken: { not: null },
        },
    });
    if (user) {
        const isValidResetToken = await bcryptjs_1.default.compare(resetToken, user.passwordResetToken);
        if (isValidResetToken)
            return { isValid: true };
    }
    const userWithResetToken = await db_1.default.user.findFirst({
        where: { id: userId, passwordResetToken: { not: null } },
    });
    if (userWithResetToken)
        nullyfyResetTokenInfo(userWithResetToken.id);
    return { isValid: false };
};
exports.validateResetToken = validateResetToken;
const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken ||
        typeof refreshToken !== "string" ||
        refreshToken === "" ||
        refreshToken == null ||
        refreshToken === undefined) {
        throw new Error("Refresh token is required!");
    }
    const varifiedPayload = jsonwebtoken_1.default.verify(refreshToken, env_1.default.refreshTokenSecret);
    if (varifiedPayload instanceof Object && "id" in varifiedPayload) {
        const user = await db_1.default.user.findUnique({
            where: { id: varifiedPayload.id },
        });
        if (!user) {
            throw (0, errorMiddleware_1.createError)("Invalid refresh token!", 401);
        }
        // if (user?.refreshToken !== refreshToken) {
        //   throw createError("Invalid refresh token..!", 401);
        // }
        const newAccessToken = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name,
        }, env_1.default.accessTokenSecret, {
            expiresIn: env_1.default.accessTokenExpiration,
        });
        const newRefreshToken = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name,
        }, env_1.default.refreshTokenSecret, {
            expiresIn: env_1.default.refreshTokenExpiration,
        });
        // await db.user.update({
        //   where: { id: user.id },
        //   data: { refreshToken: newRefreshToken },
        // });
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
    else {
        throw (0, errorMiddleware_1.createError)("Invalid refresh token!", 401);
    }
};
exports.refreshAccessToken = refreshAccessToken;
const nullyfyResetTokenInfo = async (userId) => {
    await db_1.default.user.update({
        where: { id: userId },
        data: {
            passwordResetToken: null,
            passwordResetTokenExpires: null,
        },
    });
};
