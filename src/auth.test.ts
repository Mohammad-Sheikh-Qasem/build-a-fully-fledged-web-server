import { describe, it, expect, beforeAll } from "vitest";
import { hashPassword, checkPasswordHash, makeJWT, validateJWT } from "./auth.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  let hash1: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});

describe("JWT Functions", () => {
  const secret = "super-secret-key";
  const userId = "123-456-789";

  it("should create and validate a valid JWT", () => {
    const token = makeJWT(userId, 3600, secret);
    const validatedUserId = validateJWT(token, secret);
    expect(validatedUserId).toBe(userId);
  });

  it("should reject an expired JWT", async () => {
    const expiredToken = makeJWT(userId, -1, secret);
    expect(() => validateJWT(expiredToken, secret)).toThrow();
  });

  it("should reject a JWT signed with the wrong secret", () => {
    const token = makeJWT(userId, 3600, secret);
    expect(() => validateJWT(token, "wrong-secret")).toThrow();
  });
});
