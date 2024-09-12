"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResetPassword = void 0;
const joi_1 = __importDefault(require("joi"));
const validateResetPassword = (req, res, next) => {
    const resetPassSchema = joi_1.default.object({
        resetToken: joi_1.default.string().required(),
        id: joi_1.default.string().required(),
        newPassword: joi_1.default.string().min(6).required(),
    });
    const { error } = resetPassSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateResetPassword = validateResetPassword;
