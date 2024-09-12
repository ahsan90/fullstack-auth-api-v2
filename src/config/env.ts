import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid("production", "development", "test").required(),
  PORT: Joi.number().required().default(8000),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRATION: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_EXPIRATION: Joi.string().required(),
  MAIL_PORT: Joi.number().required(),
  MAIL_HOST: Joi.string().required(),
  MAIL_USER: Joi.string().required(),
  MAIL_PASSWORD: Joi.string().required(),
  MAIL_FROM: Joi.string().required(),

  FRONTEND_URL: Joi.string().required(),
}).unknown();

const { error, value: envVars } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(
    `Config validation error: ${error.message || "- Something went wrong!"}`
  );
}

const envConfig = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  accessTokenSecret: envVars.ACCESS_TOKEN_SECRET,
  accessTokenExpiration: envVars.ACCESS_TOKEN_EXPIRATION,
  refreshTokenSecret: envVars.REFRESH_TOKEN_SECRET,
  refreshTokenExpiration: envVars.REFRESH_TOKEN_EXPIRATION,
  mailPort: envVars.MAIL_PORT,
  mailHost: envVars.MAIL_HOST,
  mailUser: envVars.MAIL_USER,
  mailPassword: envVars.MAIL_PASSWORD,
  mailFrom: envVars.MAIL_FROM,
  frontendUrl: envVars.FRONTEND_URL,
};

export default envConfig;
