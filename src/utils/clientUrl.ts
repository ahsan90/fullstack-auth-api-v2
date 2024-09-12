import envConfig from "../config/env";

const clientUrl =
  envConfig.env === "development"
    ? envConfig.frontendUrl
    : "https://fullstack-auth-client-v2.vercel.app";

export default clientUrl