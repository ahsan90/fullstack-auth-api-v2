"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdminUser = void 0;
const passport_1 = __importDefault(require("passport"));
require("../config/passportStrategies");
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
const client_1 = require("@prisma/client");
const authenticateJWT = (req, res, next) => {
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: "Unauthorized..!" });
        }
        req.user = user;
        next();
    })(req, res, next);
};
const authenticateAdminUser = (req, res, next) => {
    if (req.user instanceof Object && "role" in req.user && req.user.role === client_1.Role.ADMIN) {
        next();
    }
    else {
        next((0, errorMiddleware_1.createError)('Unauthorized!', 401));
    }
};
exports.authenticateAdminUser = authenticateAdminUser;
exports.default = authenticateJWT;
