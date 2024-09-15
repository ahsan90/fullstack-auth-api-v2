import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export const validateResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const resetPassSchema = Joi.object({
    resetToken: Joi.string().required(),
    id: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  });
  const { error } = resetPassSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
