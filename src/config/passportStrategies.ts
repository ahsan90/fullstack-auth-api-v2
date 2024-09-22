import passport from "passport";
import { Request } from "express";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
  VerifiedCallback,
} from "passport-jwt";
import db from "./db";
import envConfig from "./env";
import jwt from "jsonwebtoken";
import extractTokens from "../utils/extractTokens";

interface ExtractedJwtToken {
  token: string | null;
  isAccessToken: boolean | false;
}

const cookieExtractor = (req: Request): ExtractedJwtToken => {
  let token: string | null = null;
  let isAccessToken: boolean | false = false;

  if (!req.headers.cookie) return { token, isAccessToken };
  const tokens = extractTokens(req.headers.cookie!);

  if (req && req.headers.cookie) {
    // if (tokens.accessToken && req.path === "/logout") {
    //   token = tokens.accessToken;
    //   isAccessToken = true;
    // } else if (tokens.refreshToken && req.path === "/logout") {
    //   token = tokens.refreshToken;
    //   isAccessToken = false;
    // } else if (
    //   tokens.accessToken &&
    //   req.path !== "/refresh-access-token"
    // )
    if (tokens.accessToken && req.path !== "/refresh-access-token") {
      token = tokens.accessToken;
      isAccessToken = true;
    } else if (tokens.refreshToken && req.path === "/refresh-access-token") {
      console.log("should trigger refreshing token");
      console.log(req.path);
      token = tokens.refreshToken;
      isAccessToken = false;
    }
  }
  return { token, isAccessToken };
};

const secretOrKeyProvider = (
  req: Request,
  rawJwtToken: any,
  done: (err: any, secretOrKey?: string) => void
) => {
  const { isAccessToken } = cookieExtractor(req);
  const secretKey = isAccessToken
    ? envConfig.accessTokenSecret
    : envConfig.refreshTokenSecret;
  done(null, secretKey);
};

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req: Request) => cookieExtractor(req).token,
  ]),
  secretOrKeyProvider,
  passReqToCallback: true, // Ensure we can access the request object in the callback
};

passport.use(
  new JwtStrategy(options, async (req, jwtPayload, done: VerifiedCallback) => {
    const { token, isAccessToken } = cookieExtractor(req);
    if (!token) return done(null, false);
    try {
      // Verify the token manually with the correct secret
      const secretKey = isAccessToken
        ? envConfig.accessTokenSecret
        : envConfig.refreshTokenSecret;
      const verifiedPayload = jwt.verify(token, secretKey) as typeof jwtPayload;

      // Find the user based on the verified payload
      const user = await db.user.findUnique({
        where: { id: verifiedPayload.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

passport.serializeUser((user, done) => {
  console.log("serializeUser: ", user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log("deserializeUser: ", user);
  done(null, user as any);
});
