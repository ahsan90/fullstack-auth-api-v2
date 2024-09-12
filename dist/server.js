"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const data_1 = require("./config/data");
const db_1 = require("./config/db");
const env_1 = __importDefault(require("./config/env"));
const startServer = async () => {
    try {
        await (0, db_1.connectDb)();
        app_1.default.listen(env_1.default.port, () => {
            console.log(`Server started on port ${env_1.default.port}`);
        });
        (0, data_1.seedUsers)();
    }
    catch (error) {
        console.log("Error starting server: ", error);
        process.exit(1);
    }
};
startServer();
