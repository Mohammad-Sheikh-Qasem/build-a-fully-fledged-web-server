import { db } from "../index.js";
import { chirps } from "../schema.js";
import { asc, eq } from "drizzle-orm";

export async function getAllChirps(authorId?: string) {
  if (authorId) {
    return await db
      .select()
      .from(chirps)
      .where(eq(chirps.userId, authorId))
      .orderBy(asc(chirps.createdAt));
  }

  return await db
    .select()
    .from(chirps)
    .orderBy(asc(chirps.createdAt));
}

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

export async function getChirpById(id: string) {
  const [chirp] = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, id));

  return chirp;
}

export async function deleteChirp(chirpId: string) {
  const [deletedChirp] = await db
    .delete(chirps)
    .where(eq(chirps.id, chirpId))
    .returning();

  return deletedChirp;
}
