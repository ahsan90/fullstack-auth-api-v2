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
exports.getUserRoles = exports.deleteUserById = exports.updateUserById = exports.getAllUsers = exports.createUser = void 0;
const adminServices = __importStar(require("../services/adminServices"));
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../config/db"));
const createUser = async (req, res, next) => {
    try {
        const user = await adminServices.createUser(req.body);
        res.status(201).json({ message: "User created successfully", user });
    }
    catch (error) {
        next((0, errorMiddleware_1.createError)(error.message || "Something went wrong!", 500));
    }
};
exports.createUser = createUser;
const getAllUsers = async (req, res, next) => {
    try {
        const users = await adminServices.getAllUsers();
        res.status(200).json({ users });
    }
    catch (error) {
        next((0, errorMiddleware_1.createError)(error.message || "Something went wrong!", 500));
    }
};
exports.getAllUsers = getAllUsers;
const updateUserById = async (req, res, next) => {
    try {
        const user = await adminServices.updateUserById(req.params.userId, req.user, req.body);
        res.status(200).json({ message: "User updated successfully", user });
    }
    catch (error) {
        next((0, errorMiddleware_1.createError)(error.message || "Something went wrong!", 500));
    }
};
exports.updateUserById = updateUserById;
const deleteUserById = async (req, res, next) => {
    try {
        if (req.user instanceof Object && "id" in req.user) {
            const userId = req.params.userId;
            const existingUser = await db_1.default.user.findUnique({ where: { id: userId } });
            if (!existingUser) {
                next((0, errorMiddleware_1.createError)("User not found", 404));
                return;
            }
            if (req.user.id === userId) {
                next((0, errorMiddleware_1.createError)("You cannot delete yourself as an admin user!", 401));
                return;
            }
            const deletedUser = await db_1.default.user.delete({
                where: { id: userId },
                select: {
                    id: true,
                },
            });
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
exports.deleteUserById = deleteUserById;
const getUserRoles = async (req, res, next) => {
    try {
        const roles = client_1.Role;
        res.status(200).json(roles);
    }
    catch (error) {
        next((0, errorMiddleware_1.createError)(error.message || "Something went wrong!", 500));
    }
};
exports.getUserRoles = getUserRoles;
