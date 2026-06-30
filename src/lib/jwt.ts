import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

export function signToken(payload: object, expiresIn: string | number = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as SignOptions["expiresIn"] });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
