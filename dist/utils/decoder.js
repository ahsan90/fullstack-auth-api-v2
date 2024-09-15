"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenExpiration = exports.decodeToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const decodeToken = (token) => {
    return jsonwebtoken_1.default.decode(token);
};
exports.decodeToken = decodeToken;
const tokenExpiration = (token) => {
    const decoded = jsonwebtoken_1.default.decode(token);
    if (decoded && decoded.exp) {
        // Convert `exp` from seconds to milliseconds
        const expMilliseconds = decoded.exp * 1000;
        // Create a new Date object
        const expirationDate = new Date(expMilliseconds);
        return expirationDate;
    }
    else {
        console.log("Failed to decode token or `exp` property not found.");
    }
};
exports.tokenExpiration = tokenExpiration;
