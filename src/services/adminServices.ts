import db from "../config/db";
import { createError } from "../middlewares/errorMiddleware";
import bcrypt from "bcryptjs";
import { CreateUserInput } from "../types/authUserInput";

export const createUser = async ({
  email,
  name,
  password,
  role,
}: CreateUserInput) => {
  const existingUser = await db.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
  });
  if (existingUser) {
    throw createError("User with this Email already exists", 400);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
  return user;
};
export const getAllUsers = async () => {
  return await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const updateUserById = async (
  userId: string,
  loggedInUser: any,
  data: {
    name: string;
    email: string;
    role: string;
    currentPassword: string;
    newPassword?: string;
  }
) => {
  const existingUser = await db.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) throw createError("User not found", 404);

  //check if email already used by another user
  const isEmailUsedByAnotherUser = await db.user.findUnique({
    where: { email: data.email, NOT: { id: userId } },
  });
  if (isEmailUsedByAnotherUser)
    throw createError("Email already used by another user!", 400);

  if(loggedInUser instanceof Object && loggedInUser.id === userId && existingUser.role !== data.role) {
    throw createError("Admin is not allowed to change his/her own role!", 403);
  }

  let updatedData: any;
  if (
    !data.newPassword ||
    data.newPassword === "" ||
    data.newPassword === null ||
    data.newPassword === undefined
  ) {
    updatedData = {
      email: data.email,
      name: data.name,
      role: data.role,
    };
  } else {
    if (
      existingUser &&
      !(await bcrypt.compare(data.currentPassword, existingUser.password!))
    )
      throw createError("Your current password is incorrect", 400);
    updatedData = {
      email: data.email,
      name: data.name,
      password: await bcrypt.hash(data.newPassword, 10),
      role: data.role,
    };
  }

  return await db.user.update({
    where: { id: userId },
    data: updatedData,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};