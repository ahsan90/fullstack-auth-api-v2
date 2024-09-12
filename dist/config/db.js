"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDb = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = global;
let prisma;
if (process.env.NODE_ENV === "production") {
    prisma = new client_1.PrismaClient();
}
else {
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new client_1.PrismaClient();
    }
    prisma = globalForPrisma.prisma;
}
const connectDb = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected");
    }
    catch (error) {
        console.log("Error connecting to database: ", error);
        process.exit(1);
    }
};
exports.connectDb = connectDb;
exports.default = prisma;
