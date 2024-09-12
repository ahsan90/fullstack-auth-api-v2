"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.registerUser = void 0;
const db_1 = __importDefault(require("../config/db"));
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const registerUser = async ({ name, email, password, }) => {
    const existingUser = await db_1.default.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw (0, errorMiddleware_1.createError)("User with this Email already exists", 400);
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = await db_1.default.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            accountInitiatedWith: true,
        },
    });
    return user;
};
exports.registerUser = registerUser;
const updateUser = async (userId, data) => {
    const existingUser = await db_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!existingUser)
        throw (0, errorMiddleware_1.createError)("User not found", 404);
    //check if email already used by another user
    const isEmailUsedByAnotherUser = await db_1.default.user.findUnique({
        where: { email: data.email, NOT: { id: userId } },
    });
    if (isEmailUsedByAnotherUser)
        throw (0, errorMiddleware_1.createError)("Email already used by another user!", 400);
    let updatedData;
    if (!data.newPassword ||
        data.newPassword === "" ||
        data.newPassword === null ||
        data.newPassword === undefined) {
        updatedData = {
            email: data.email,
            name: data.name,
        };
    }
    else {
        if (existingUser &&
            !(await bcryptjs_1.default.compare(data.currentPassword, existingUser.password)))
            throw (0, errorMiddleware_1.createError)("Your current password is incorrect", 400);
        updatedData = {
            email: data.email,
            name: data.name,
            password: await bcryptjs_1.default.hash(data.newPassword, 10),
        };
    }
    return await db_1.default.user.update({
        where: { id: userId },
        data: updatedData,
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};
exports.updateUser = updateUser;
const deleteUser = async (userId) => {
    const user = await db_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user)
        throw (0, errorMiddleware_1.createError)("User not found", 404);
    return await db_1.default.user.delete({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};
exports.deleteUser = deleteUser;
