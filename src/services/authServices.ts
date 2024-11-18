import { LoginUserInput } from "./../types/authUserInput";
import { User } from "@prisma/client";
import db from "../config/db";
import { createError } from "../middlewares/errorMiddleware";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import envConfig from "../config/env";
import crypto from "crypto";
import {
  sendPasswordResetLinkEmail,
  sendResetConfirmationEmail,
} from "./mailServices";

export const loginUser = async ({
  email,
  password,
}: LoginUserInput): Promise<{
  accessToken: string;
  refreshToken: string;
  user: Partial<User>;
}> => {
  const existingUser = await db.user.findUnique({
    where: { email },
  });
  if (
    existingUser &&
    (await bcrypt.compare(password, existingUser?.password!))
  ) {
    const jwtPayload = {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
    };
    const accessToken = jwt.sign(jwtPayload, envConfig.accessTokenSecret, {
      expiresIn: envConfig.accessTokenExpiration,
    });
    const refreshToken = jwt.sign(jwtPayload, envConfig.refreshTokenSecret, {
      expiresIn: envConfig.refreshTokenExpiration,
    });

    // await db.user.update({
    //   where: { id: existingUser.id },
    //   data: { refreshToken },
    // });
    return {
      accessToken,
      refreshToken,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
    };
  } else {
    console.log("Invalid Login credentials!");
    throw createError("Invalid Login credentials!", 400);
  }
};
/*
export const logoutUser = async (userId: string) => {
  return await db.user.update({
    where: { id: userId },
    data: {
      refreshToken: null,
    },
  });
};
*/

export const requestResetPassword = async (email: string) => {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    throw createError("User does not exist!", 404);
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = await bcrypt.hash(resetToken, 10);
  const resetTokenExpirsAt = new Date(Date.now() + 60 * 60 * 1000);
  await db.user.update({
    where: { email },
    data: {
      passwordResetToken: hashedResetToken,
      passwordResetTokenExpires: resetTokenExpirsAt,
    },
  });
  const resetUrl = `${envConfig.frontendUrl}/reset-password/${resetToken}/${user.id}`;
  try {
    await sendPasswordResetLinkEmail(user.email, resetUrl);
    return {
      message: "Password reset link sent to your email!",
      resetToken: resetToken,
      email: user.email,
    };
  } catch (error: any) {
    throw createError(
      "Something went wrong while password reset request email!",
      500
    );
  }
};

export const resetPassword = async (data: {
  resetToken: string;
  id: string;
  newPassword: string;
}) => {
  const { resetToken, id, newPassword } = data;
  const user = await db.user.findFirst({
    where: { id, passwordResetTokenExpires: { gte: new Date() } },
  });
  if (!user) {
    throw createError("Invalid reset token!", 400);
  }
  const isValidResetToken = await bcrypt.compare(
    resetToken,
    user.passwordResetToken!
  );
  if (!isValidResetToken) {
    throw createError("Invalid reset token!", 400);
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
    },
  });
  try {
    await sendResetConfirmationEmail(user.email);
    return {
      message: "Password reset successful. Please login to continue!",
    };
  } catch (error: any) {
    throw createError(error.message || error, 500);
  }
};

export const validateResetToken = async (
  resetToken: string,
  userId: string
): Promise<{ isValid: boolean }> => {
  const user = await db.user.findFirst({
    where: {
      id: userId,
      passwordResetTokenExpires: { gte: new Date() },
      passwordResetToken: { not: null },
    },
  });
  if (user) {
    const isValidResetToken = await bcrypt.compare(
      resetToken,
      user.passwordResetToken!
    );
    if (isValidResetToken) return { isValid: true };
  }
  const userWithResetToken = await db.user.findFirst({
    where: { id: userId, passwordResetToken: { not: null } },
  });
  if (userWithResetToken) nullyfyResetTokenInfo(userWithResetToken.id);
  return { isValid: false };
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (
    !refreshToken ||
    typeof refreshToken !== "string" ||
    refreshToken === "" ||
    refreshToken == null ||
    refreshToken === undefined
  ) {
    throw new Error("Refresh token is required!");
  }
  const varifiedPayload = jwt.verify(
    refreshToken,
    envConfig.refreshTokenSecret
  );

  if (varifiedPayload instanceof Object && "id" in varifiedPayload) {
    const user = await db.user.findUnique({
      where: { id: varifiedPayload.id },
    });
    if (!user) {
      throw createError("Invalid refresh token!", 401);
    }
    // if (user?.refreshToken !== refreshToken) {
    //   throw createError("Invalid refresh token..!", 401);
    // }
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      envConfig.accessTokenSecret,
      {
        expiresIn: envConfig.accessTokenExpiration,
      }
    );
    const newRefreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      envConfig.refreshTokenSecret,
      {
        expiresIn: envConfig.refreshTokenExpiration,
      }
    );

    // await db.user.update({
    //   where: { id: user.id },
    //   data: { refreshToken: newRefreshToken },
    // });
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } else {
    throw createError("Invalid refresh token!", 401);
  }
};

const nullyfyResetTokenInfo = async (userId: string) => {
  await db.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: null,
      passwordResetTokenExpires: null,
    },
  });
};
