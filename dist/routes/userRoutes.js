"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const validateRegisterUser_1 = require("../validators/validateRegisterUser");
const validateUpdateUser_1 = require("../validators/validateUpdateUser");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
router.post("/register", validateRegisterUser_1.validateRegisterUser, userController_1.register);
router.get('/me', authMiddleware_1.default, userController_1.getCurrentUser);
router.put('/update', authMiddleware_1.default, validateUpdateUser_1.validateUdpateUser, userController_1.updateUser);
router.delete('/delete', authMiddleware_1.default, userController_1.deleteUser);
exports.default = router;
