import { Request, Response, NextFunction } from "express";
import * as adminServices from "../services/adminServices";
import { createError } from "../middlewares/errorMiddleware";
import { Role } from "@prisma/client";
import db from "../config/db";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await adminServices.createUser(req.body);
    res.status(201).json({ message: "User created successfully", user });
  } catch (error: any) {
    next(createError(error.message || "Something went wrong!", 500));
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await adminServices.getAllUsers();
    res.status(200).json({ users });
  } catch (error: any) {
    next(createError(error.message || "Something went wrong!", 500));
  }
};

export const updateUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await adminServices.updateUserById(
      req.params.userId,
      req.user,
      req.body
    );
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error: any) {
    next(createError(error.message || "Something went wrong!", 500));
  }
};

export const deleteUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user instanceof Object && "id" in req.user) {
      const userId = req.params.userId as any;
      const existingUser = await db.user.findUnique({ where: { id: userId } });
      if (!existingUser) {
        next(createError("User not found", 404));
        return;
      }

      if (req.user.id === userId) {
        next(createError("You cannot delete yourself as an admin user!", 401));
        return;
      }
      const deletedUser = await db.user.delete({
        where: { id: userId },
        select: {
          id: true,
        },
      });
      res
        .status(200)
        .json({ message: "User deleted successfully", deletedUser });
    } else {
      next(createError("Unauthorized!", 401));
    }
  } catch (error: any) {
    next(createError(error.message || "Something went wrong!", 500));
  }
};

export const getUserRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roles = Role;
    res.status(200).json(roles);
  } catch (error: any) {
    next(createError(error.message || "Something went wrong!", 500));
  }
};
