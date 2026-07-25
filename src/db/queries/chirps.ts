import { db } from "../index.js";
import { chirps } from "../schema.js";

export async function createChirp(data: { body: string; userId: string }) {
  const [newChirp] = await db
    .insert(chirps)
    .values({
      body: data.body,
      userId: data.userId,
    })
    .returning();

  return newChirp;
}
