import { Role, User } from "@prisma/client";
import { RegisterUserInput } from "../types/authUserInput";
import db from "../config/db";
import { createError } from "../middlewares/errorMiddleware";
import bcrypt from "bcryptjs";

export const registerUser = async ({
  name,
  email,
  password,
}: RegisterUserInput): Promise<Partial<User>> => {
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

export const updateUser = async (
  userId: string,
  data: {
    name: string;
    email: string;
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
    };
  } else {
    if (
      existingUser &&
      !(await bcrypt.compare(data.currentPassword, existingUser.password!))
    ) {
      throw createError("Your current password is incorrect!", 400);
    }
    updatedData = {
      email: data.email,
      name: data.name,
      password: await bcrypt.hash(data.newPassword, 10),
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

export const deleteUser = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw createError("User not found", 404);
  if (user.role === Role.ADMIN)
    throw createError(
      "Admin user is not allowed to delete his own account!",
      400
    );
  return await db.user.delete({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};
