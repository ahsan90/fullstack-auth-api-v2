import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
