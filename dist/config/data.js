"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = void 0;
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../config/db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const users = [
    {
        name: "Codehouse Lab",
        email: "codehouselab@gmail.com",
        password: "112233",
        role: client_1.Role.ADMIN,
    },
    {
        name: "Md",
        email: "ahrony90@gmail.com",
        password: "112233",
        role: client_1.Role.USER,
    },
    {
        name: "Datapoth",
        email: "datapoth@gmail.com",
        password: "112233",
        role: client_1.Role.USER,
    },
];
const seedUsers = async () => {
    for (const user of users) {
        const existingUser = await db_1.default.user.findUnique({
            where: { email: user?.email },
        });
        if (!existingUser) {
            await db_1.default.user.create({
                data: {
                    ...user,
                    password: await bcryptjs_1.default.hash(user.password, 10),
                },
            });
        }
    }
};
exports.seedUsers = seedUsers;
