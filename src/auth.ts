import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import crypto from "node:crypto";

export function makeRefreshToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getAPIKey(req: Request): string {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "ApiKey") {
    throw new Error("Malformed Authorization header");
  }

  return parts[1].trim();
}


type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
}

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresIn;

  const tokenPayload: payload = {
    iss: "chirpy",
    sub: userID,
    iat,
    exp,
  };

  return jwt.sign(tokenPayload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
  try {
    const decoded = jwt.verify(tokenString, secret) as JwtPayload;

    if (!decoded.sub) {
      throw new Error("Invalid token payload: missing sub");
    }

    return decoded.sub;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

export function getBearerToken(req: Request): string {
  const authHeader = req.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }
  return authHeader.replace("Bearer ", "").trim();
}
