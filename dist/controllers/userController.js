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
exports.deleteUser = exports.updateUser = exports.getCurrentUser = exports.register = void 0;
const userServices = __importStar(require("../services/userServices"));
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
const db_1 = __importDefault(require("../config/db"));
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const user = await userServices.registerUser({ name, email, password });
        return res
            .status(201)
            .json({ message: "User registered successfully", user });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const getCurrentUser = async (req, res, next) => {
    try {
        const user = req.user;
        if (user instanceof Object && "id" in user) {
            const existingUser = await db_1.default.user.findUnique({ where: { id: user.id }, select: {
                    email: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                } });
            if (existingUser) {
                return res.status(200).json({ user: existingUser });
            }
            next((0, errorMiddleware_1.createError)("Unauthorized!", 404));
        }
        else {
            next((0, errorMiddleware_1.createError)("Unauthorized!", 401));
        }
    }
    catch (error) {
        next((0, errorMiddleware_1.createError)(error.message, error.statusCode));
    }
};
exports.getCurrentUser = getCurrentUser;
const updateUser = async (req, res, next) => {
    try {
        if (req.user instanceof Object && "id" in req.user) {
            const currentUserId = req.user.id;
            const user = await userServices.updateUser(currentUserId, req.body);
            res.status(200).json({ message: "User updated successfully", user });
        }
        else {
            next((0, errorMiddleware_1.createError)("Unauthorized!", 401));
        }
    }
    catch (error) {
        next((0, errorMiddleware_1.createError)(error.message || "Something went wrong!", 500));
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res, next) => {
    try {
        if (req.user instanceof Object && "id" in req.user) {
            const currentUserId = req.user.id;
            const deletedUser = await userServices.deleteUser(currentUserId);
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res
                .status(200)
                .json({ message: "User deleted successfully", deletedUser });
        }
        else {
            next((0, errorMiddleware_1.createError)("Unauthorized!", 401));
        }
    }
    catch (error) {
        next((0, errorMiddleware_1.createError)(error.message || "Something went wrong!", 500));
    }
};
exports.deleteUser = deleteUser;
