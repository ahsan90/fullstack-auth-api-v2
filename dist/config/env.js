"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const joi_1 = __importDefault(require("joi"));
dotenv_1.default.config();
const envVarsSchema = joi_1.default.object({
    NODE_ENV: joi_1.default.string().valid("production", "development", "test").required(),
    PORT: joi_1.default.number().required().default(8000),
    ACCESS_TOKEN_SECRET: joi_1.default.string().required(),
    ACCESS_TOKEN_EXPIRATION: joi_1.default.string().required(),
    REFRESH_TOKEN_SECRET: joi_1.default.string().required(),
    REFRESH_TOKEN_EXPIRATION: joi_1.default.string().required(),
    MAIL_PORT: joi_1.default.number().required(),
    MAIL_HOST: joi_1.default.string().required(),
    MAIL_USER: joi_1.default.string().required(),
    MAIL_PASSWORD: joi_1.default.string().required(),
    MAIL_FROM: joi_1.default.string().required(),
    FRONTEND_URL: joi_1.default.string().required(),
}).unknown();
const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message || "- Something went wrong!"}`);
}
const envConfig = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    accessTokenSecret: envVars.ACCESS_TOKEN_SECRET,
    accessTokenExpiration: envVars.ACCESS_TOKEN_EXPIRATION,
    refreshTokenSecret: envVars.REFRESH_TOKEN_SECRET,
    refreshTokenExpiration: envVars.REFRESH_TOKEN_EXPIRATION,
    mailPort: envVars.MAIL_PORT,
    mailHost: envVars.MAIL_HOST,
    mailUser: envVars.MAIL_USER,
    mailPassword: envVars.MAIL_PASSWORD,
    mailFrom: envVars.MAIL_FROM,
    frontendUrl: envVars.FRONTEND_URL,
};
exports.default = envConfig;
