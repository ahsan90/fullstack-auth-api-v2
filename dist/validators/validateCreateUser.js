"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateUser = void 0;
const joi_1 = __importDefault(require("joi"));
const client_1 = require("@prisma/client");
const validateCreateUser = (req, res, next) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required(),
        email: joi_1.default.string().email().required().messages({
            "string.empty": "Email is required",
            "string.email": "Invalid email address",
        }),
        password: joi_1.default.string()
            .min(6)
            .max(30)
            .required()
            .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 6 characters long!",
            "string.max": "Password must be at most 30 characters long!",
        }),
        role: joi_1.default.string().required().valid(client_1.Role.ADMIN, client_1.Role.USER),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateCreateUser = validateCreateUser;
