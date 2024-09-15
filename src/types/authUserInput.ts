import { Role } from "@prisma/client";

export interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
}

export interface CreateUserInput extends RegisterUserInput {
  role: Role | undefined;
}

export interface LoginUserInput {
  email: string;
  password: string;
}
