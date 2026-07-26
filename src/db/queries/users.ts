import { eq } from "drizzle-orm"; 
import { db } from "../index.js";
import { users } from "../schema.js";

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
