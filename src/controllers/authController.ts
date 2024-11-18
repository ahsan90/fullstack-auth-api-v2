import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";
import envConfig from "../config/env";
import * as decoder from "../utils/decoder";
import { createError } from "../middlewares/errorMiddleware";
import * as authServices from "../services/authServices";
import extractTokens from "../utils/extractTokens";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authServices.loginUser({
      email,
      password,
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: envConfig.env === "production",
      sameSite: "none",
      maxAge: (jwt.decode(accessToken) as JwtPayload).exp! * 1000 - Date.now(),
      //maxAge: decoder.decodeToken(accessToken).exp! * 1000 - Date.now(),
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: envConfig.env === "production",
      sameSite: "none",
      maxAge: decoder.decodeToken(refreshToken).exp! * 1000 - Date.now(),
    });
    res.status(200).json({ message: "User logged in successfully", user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "User logged out successfully" });
    // if(req.user instanceof Object && "id" in req.user){
    //     const currentUserId = req.user.id as string;
    //     //await authServices.logoutUser(currentUserId);
    //     res.clearCookie("accessToken");
    //     res.clearCookie("refreshToken");
    //     res.status(200).json({ message: "User logged out successfully" });
    // } else {
    //     next(createError('Unauthorized!', 401));
    // }
  } catch (error: any) {
    next(error);
  }
};

export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message, resetToken, email } =
      await authServices.requestResetPassword(req.body.email);
    return res.status(200).json({ message, resetToken, email });
  } catch (error: any) {
    //console.log(error.statusCode);
    next(createError(error.message, error.statusCode));
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message } = await authServices.resetPassword(req.body);
    return res.status(200).json({ message });
  } catch (error: any) {
    next(createError(error.message, error.statusCode));
  }
};

export const varifyResetToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.resetToken && !req.body.userId)
      throw createError("Reset token is required", 400);
    const { resetToken, userId } = req.body;
    const { isValid } = await authServices.validateResetToken(
      resetToken,
      userId
    );
    return res.status(200).json({ isValid });
  } catch (error: any) {
    next(createError(error.message, error.statusCode));
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokens = extractTokens(req.headers.cookie as string);
    if (!tokens.refreshToken)
      throw createError("Refresh token is required", 400);
    const { accessToken, refreshToken } = await authServices.refreshAccessToken(
      tokens.refreshToken
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: envConfig.env === "production",
      sameSite: "none",
      maxAge: decoder.decodeToken(accessToken).exp! * 1000 - Date.now(),
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: envConfig.env === "production",
      sameSite: "none",
      maxAge: decoder.decodeToken(refreshToken).exp! * 1000 - Date.now(),
    });
    res.status(200).json({
      message: "Access token refreshed successfully",
      // accessToken,
      // refreshToken,
    });
  } catch (error: any) {
    next(createError(error.message || error.response || error, 400));
  }
};
