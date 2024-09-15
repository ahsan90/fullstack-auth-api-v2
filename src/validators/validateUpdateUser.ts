import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateUdpateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userUpdateSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    currentPassword: Joi.alternatives().conditional(
      Joi.ref("currentPassword"),
      {
        is: Joi.exist(),
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
      }
    ),
    newPassword: Joi.alternatives().conditional(Joi.ref("newPassword"), {
      is: Joi.exist(),
      then: Joi.string()
        .min(6)
        .required()
        .error((err) => {
          err[0].message = "New password must be at least 6 characters long!";
          return err;
        }),
      otherwise: Joi.forbidden(),
    }),
  });
  const { error } = userUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
