import jwt, { JwtPayload } from "jsonwebtoken";

export const decodeToken = (token: string) => {
    return jwt.decode(token) as JwtPayload;
}

export const tokenExpiration = (token: string): Date | undefined => {
  const decoded = jwt.decode(token) as JwtPayload;
  if (decoded && decoded.exp) {
    // Convert `exp` from seconds to milliseconds
    const expMilliseconds = decoded.exp * 1000;
    // Create a new Date object
    const expirationDate = new Date(expMilliseconds);
    return expirationDate;
  } else {
    console.log("Failed to decode token or `exp` property not found.");
  }
};