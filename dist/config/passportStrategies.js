"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const db_1 = __importDefault(require("./db"));
const env_1 = __importDefault(require("./env"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const extractTokens_1 = __importDefault(require("../utils/extractTokens"));
const cookieExtractor = (req) => {
    let token = null;
    let isAccessToken = false;
    if (!req.headers.cookie)
        return { token, isAccessToken };
    const tokens = (0, extractTokens_1.default)(req.headers.cookie);
    if (req && req.headers.cookie) {
        if (tokens.accessToken && req.path === "/logout") {
            token = tokens.accessToken;
            isAccessToken = true;
        }
        else if (tokens.refreshToken && req.path === "/logout") {
            token = tokens.refreshToken;
            isAccessToken = false;
        }
        else if (tokens.accessToken &&
            req.path !== "/refresh-access-token") {
            token = tokens.accessToken;
            isAccessToken = true;
        }
        else if (tokens.refreshToken &&
            req.path === "/refresh-access-token") {
            console.log('should trigger refreshing token');
            console.log(req.path);
            token = tokens.refreshToken;
            isAccessToken = false;
        }
    }
    return { token, isAccessToken };
};
const secretOrKeyProvider = (req, rawJwtToken, done) => {
    const { isAccessToken } = cookieExtractor(req);
    const secretKey = isAccessToken
        ? env_1.default.accessTokenSecret
        : env_1.default.refreshTokenSecret;
    done(null, secretKey);
};
const options = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
        (req) => cookieExtractor(req).token,
    ]),
    secretOrKeyProvider,
    passReqToCallback: true, // Ensure we can access the request object in the callback
};
passport_1.default.use(new passport_jwt_1.Strategy(options, async (req, jwtPayload, done) => {
    const { token, isAccessToken } = cookieExtractor(req);
    if (!token)
        return done(null, false);
    try {
        // Verify the token manually with the correct secret
        const secretKey = isAccessToken
            ? env_1.default.accessTokenSecret
            : env_1.default.refreshTokenSecret;
        const verifiedPayload = jsonwebtoken_1.default.verify(token, secretKey);
        // Find the user based on the verified payload
        const user = await db_1.default.user.findUnique({
            where: { id: verifiedPayload.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (user) {
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    }
    catch (error) {
        return done(error, false);
    }
}));
passport_1.default.serializeUser((user, done) => {
    console.log("serializeUser: ", user);
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => {
    console.log("deserializeUser: ", user);
    done(null, user);
});
