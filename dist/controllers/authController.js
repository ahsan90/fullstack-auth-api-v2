"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = exports.varifyResetToken = exports.resetPassword = exports.requestPasswordReset = exports.logout = exports.login = void 0;
const env_1 = __importDefault(require("../config/env"));
const decoder = __importStar(require("../utils/decoder"));
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
const authServices = __importStar(require("../services/authServices"));
const extractTokens_1 = __importDefault(require("../utils/extractTokens"));
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { accessToken, refreshToken, user } = await authServices.loginUser({
            email,
            password,
        });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: env_1.default.env === "production",
            sameSite: "none",
            maxAge: decoder.decodeToken(accessToken).exp * 1000 - Date.now(),
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: env_1.default.env === "production",
            sameSite: "none",
            maxAge: decoder.decodeToken(refreshToken).exp * 1000 - Date.now(),
        });
        res
            .status(200)
            .json({ message: "User logged in successfully", user });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        if (req.user instanceof Object && "id" in req.user) {
            const currentUserId = req.user.id;
            //await authServices.logoutUser(currentUserId);
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.status(200).json({ message: "User logged out successfully" });
        }
        else {
            next((0, errorMiddleware_1.createError)('Unauthorized!', 401));
        }
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const requestPasswordReset = async (req, res, next) => {
    try {
        const { message, resetToken, email } = await authServices.requestResetPassword(req.body.email);
        return res.status(200).json({ message, resetToken, email });
    }
    catch (error) {
        //console.log(error.statusCode);
        next((0, errorMiddleware_1.createError)(error.message, error.statusCode));
    }
};
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = async (req, res, next) => {
    try {
        const { message } = await authServices.resetPassword(req.body);
        return res.status(200).json({ message });
    }
    catch (error) {
        next((0, errorMiddleware_1.createError)(error.message, error.statusCode));
    }
};
exports.resetPassword = resetPassword;
const varifyResetToken = async (req, res, next) => {
    try {
        if (!req.body.resetToken && !req.body.userId)
            throw (0, errorMiddleware_1.createError)("Reset token is required", 400);
        const { resetToken, userId } = req.body;
        const { isValid } = await authServices.validateResetToken(resetToken, userId);
        return res.status(200).json({ isValid });
    }
    catch (error) {
        next((0, errorMiddleware_1.createError)(error.message, error.statusCode));
    }
};
exports.varifyResetToken = varifyResetToken;
const refreshAccessToken = async (req, res, next) => {
    try {
        const tokens = (0, extractTokens_1.default)(req.headers.cookie);
        if (!tokens.refreshToken)
            throw (0, errorMiddleware_1.createError)("Refresh token is required", 400);
        const { accessToken, refreshToken } = await authServices.refreshAccessToken(tokens.refreshToken);
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: env_1.default.env === "production",
            sameSite: "none",
            maxAge: decoder.decodeToken(accessToken).exp * 1000 - Date.now(),
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: env_1.default.env === "production",
            sameSite: "none",
            maxAge: decoder.decodeToken(refreshToken).exp * 1000 - Date.now(),
        });
        res
            .status(200)
            .json({
            message: "Access token refreshed successfully",
            // accessToken,
            // refreshToken,
        });
    }
    catch (error) {
        next((0, errorMiddleware_1.createError)(error.message || error.response || error, 400));
    }
};
exports.refreshAccessToken = refreshAccessToken;
