import process from "node:process";
import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

export type APIConfig = {
  fileserverHits: number;
};

export const config = {
  api: {
    fileserverHits: 0,
  } satisfies APIConfig,
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig,
  } satisfies DBConfig,
};

export const apiConfig = config.api;
