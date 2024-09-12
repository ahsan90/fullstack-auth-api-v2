"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const index_1 = require("../validators/index");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
router.post("/login", index_1.validateLogin, authController_1.login);
router.post('/logout', authMiddleware_1.default, authController_1.logout);
router.post('/request-password-reset', authController_1.requestPasswordReset);
router.post('/varify-reset-token', authController_1.varifyResetToken);
router.post('/reset-password', index_1.validateResetPassword, authController_1.resetPassword);
router.post('/refresh-access-token', authMiddleware_1.default, authController_1.refreshAccessToken);
exports.default = router;
