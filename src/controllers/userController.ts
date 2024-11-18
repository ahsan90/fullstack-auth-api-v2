import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from "express";
import * as userServices from "../services/userServices";
import { createError } from "../middlewares/errorMiddleware";
import db from "../config/db";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    const user = await userServices.registerUser({ name, email, password });
    return res
      .status(201)
      .json({ message: "User registered successfully", user });
  } catch (error: any) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user! as any;
    if (user instanceof Object && "id" in user) {
      const existingUser = await db.user.findUnique({ where: { id: user.id } , select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      }});
      if (existingUser) {
        return res.status(200).json({ user: existingUser });
      }
      next(createError("Unauthorized!", 404));
    } else {
      next(createError("Unauthorized!", 401));
    }
  } catch (error: any) {
    next(createError(error.message, error.statusCode));
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user instanceof Object && "id" in req.user) {
      const currentUserId = req.user.id as any;
      const user = await userServices.updateUser(currentUserId, req.body);
      res.status(200).json({ message: "User updated successfully", user });
    } else {
      next(createError("Unauthorized!", 401));
    }
  } catch (error: any) {
    next(createError(error.message || "Something went wrong!", error.statusCode));
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user instanceof Object && "id" in req.user) {
      const currentUserId = req.user.id as any;
      const deletedUser = await userServices.deleteUser(currentUserId);
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res
        .status(200)
        .json({ message: "User deleted successfully", deletedUser });
    } else {
      next(createError("Unauthorized!", 401));
    }
  } catch (error: any) {
    next(createError(error.message || "Something went wrong!", error.statusCode));
  }
};