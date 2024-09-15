"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function extractTokens(tokenString) {
    // Split the string by semicolon and space
    const tokensArray = tokenString.split("; ");
    // Extract accessToken and refreshToken from the array
    const accessToken = tokensArray
        .find((token) => token.startsWith("accessToken="))
        ?.split("=")[1];
    const refreshToken = tokensArray
        .find((token) => token.startsWith("refreshToken="))
        ?.split("=")[1];
    // Return the tokens as an object
    return { accessToken, refreshToken };
}
const extractAccessToken = (tokenString) => {
    return tokenString.split("=")[1];
};
exports.default = extractTokens;
