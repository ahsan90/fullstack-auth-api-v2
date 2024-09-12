"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserById = exports.getAllUsers = exports.createUser = void 0;
const db_1 = __importDefault(require("../config/db"));
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const createUser = async ({ email, name, password, role, }) => {
    const existingUser = await db_1.default.user.findFirst({
        where: {
            email: {
                equals: email,
                mode: "insensitive",
            },
        },
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
            role,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });
    return user;
};
exports.createUser = createUser;
const getAllUsers = async () => {
    return await db_1.default.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};
exports.getAllUsers = getAllUsers;
const updateUserById = async (userId, loggedInUser, data) => {
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
    if (loggedInUser instanceof Object && loggedInUser.id === userId && existingUser.role !== data.role) {
        throw (0, errorMiddleware_1.createError)("Admin is not allowed to change his/her own role!", 403);
    }
    let updatedData;
    if (!data.newPassword ||
        data.newPassword === "" ||
        data.newPassword === null ||
        data.newPassword === undefined) {
        updatedData = {
            email: data.email,
            name: data.name,
            role: data.role,
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
            role: data.role,
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
exports.updateUserById = updateUserById;
