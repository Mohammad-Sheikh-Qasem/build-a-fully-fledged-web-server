import { db } from "../index.js";
import { users } from "../schema.js";
import { InferInsertModel } from "drizzle-orm";

export type NewUser = InferInsertModel<typeof users>;

export async function createUser(user: NewUser) {
  const [newUser] = await db.insert(users).values(user).returning();
  return newUser;
}

export async function resetUsers() {
  await db.delete(users);
}
