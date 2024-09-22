import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export const validateRegisterUser = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters long!",
      }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
}

