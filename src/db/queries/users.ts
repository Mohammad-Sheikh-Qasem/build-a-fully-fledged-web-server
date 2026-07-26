import { eq, and, gt, isNull } from "drizzle-orm";
import { db } from "../index.js";
import { refreshTokens, users } from "../schema.js";

export async function createRefreshToken(data: { token: string; userId: string; expiresAt: Date }) {
  const [newToken] = await db
    .insert(refreshTokens)
    .values({
      token: data.token,
      userId: data.userId,
      expiresAt: data.expiresAt,
    })
    .returning();
  return newToken;
}

export async function getUserFromRefreshToken(token: string) {
  const [result] = await db
    .select({
      user: users,
      refreshToken: refreshTokens,
    })
    .from(refreshTokens)
    .innerJoin(users, eq(refreshTokens.userId, users.id))
    .where(
      and(
        eq(refreshTokens.token, token),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date())
      )
    );

  return result ? result.user : null;
}

export async function revokeRefreshToken(token: string) {
  await db
    .update(refreshTokens)
    .set({
      revokedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(refreshTokens.token, token));
}


export async function createUser(data: { email: string; hashedPassword: string }) {
  const [newUser] = await db.insert(users).values(data).returning();
  return newUser;
}

export async function resetUsers() {
  await db.delete(users);
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}
