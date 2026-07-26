import process from "node:process";
import dotenv from "dotenv";

dotenv.config();

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export type APIConfig = {
  fileserverHits: number;
  platform: string;
  polkaKey: string;
};

export const apiConfig: APIConfig = {
  fileserverHits: 0,
  platform: envOrThrow("PLATFORM"),
  polkaKey: process.env.POLKA_KEY || "",
};

export const config = {
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: {
      migrationsFolder: "./src/db/migrations",
    },
  },
  jwtSecret: envOrThrow("JWT_SECRET"),
  polkaKey: process.env.POLKA_KEY || "",
};
