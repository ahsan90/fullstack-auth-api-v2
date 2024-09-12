import { User, Role } from "@prisma/client";
import db from "../config/db";
import bcrypt from "bcryptjs";

type UserInput = Omit<
  User,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "passwordResetToken"
  | "passwordResetTokenExpires"
>;

const users: UserInput[] = [
  {
    name: "Codehouse Lab",
    email: "codehouselab@gmail.com",
    password: "112233",
    role: Role.ADMIN,
  },
  {
    name: "Md",
    email: "ahrony90@gmail.com",
    password: "112233",
    role: Role.USER,
  },
  {
    name: "Datapoth",
    email: "datapoth@gmail.com",
    password: "112233",
    role: Role.USER,
  },
];

export const seedUsers = async () => {
  for (const user of users) {
    const existingUser = await db.user.findUnique({
      where: { email: user?.email },
    });
    if (!existingUser) {
      await db.user.create({
        data: {
          ...user,
          password: await bcrypt.hash(user.password!, 10),
        },
      });
    }
  }
};
