import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

export const validateCreateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required().messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email address",
    }),
    password: Joi.string()
      .min(6)
      .max(30)
      .required()
      .messages({ 
        "string.empty": "Password is required", 
        "string.min": "Password must be at least 6 characters long!",
        "string.max": "Password must be at most 30 characters long!",
        }),
    role: Joi.string().required().valid(Role.ADMIN, Role.USER),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
