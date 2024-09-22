import { Request, Response, NextFunction } from "express";
import envConfig from "../config/env";
import passport from "passport";
import "../config/passportStrategies";
import { createError } from "../middlewares/errorMiddleware";
import { Role, User } from "@prisma/client";

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "jwt",
      { session: false },
      (err: Error, user: Partial<User>) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: "Unauthorized..!" });
        }
        req.user = user;
        next();
      }
    )(req, res, next);
}

export const authenticateAdminUser = (req: Request, res: Response, next: NextFunction) => {
    if (req.user instanceof Object && "role" in req.user && req.user.role === Role.ADMIN) {
        next();
    } else {
        next(createError('Unauthorized!', 401));
    }
}

export default authenticateJWT