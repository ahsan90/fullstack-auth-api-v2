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
    //console.log(req.headers.cookie?.split("; "));
    //console.log('header token: ',req.headers.cookie);
    if (!req.headers.cookie)
        return { token, isAccessToken };
    const tokens = (0, extractTokens_1.default)(req.headers.cookie);
    //console.log("tokens: ", tokens.accessToken, tokens.refreshToken);
    console.log(req.path);
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
            //console.log("Validating with access token: ", req.cookies["accessToken"]);
            token = tokens.accessToken;
            isAccessToken = true;
            //console.log("isAccessToken from access: ", isAccessToken);
        }
        else if (tokens.refreshToken &&
            req.path === "/refresh-access-token") {
            console.log('should trigger refreshing token');
            console.log(req.path);
            // console.log(
            //   "Validating with refresh token: ",
            //   req.cookies["refreshToken"]
            // );
            token = tokens.refreshToken;
            isAccessToken = false;
            //console.log("isAccessToken from refresh: ", isAccessToken);
        }
    }
    // console.log(
    //   "Token from cookie extractor: ",
    //   token,
    //   " | isAccessToken: ",
    //   isAccessToken
    // );
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
    //console.log("token: ", token, "isAccessToken: ", isAccessToken);
    // const secretKey = isAccessToken
    //   ? config.jwtSecret
    //   : config.refreshTokenSecret;
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
