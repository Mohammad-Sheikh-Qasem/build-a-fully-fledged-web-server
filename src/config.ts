import process from "node:process";

process.loadEnvFile();

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
};

export const config = {
  api: {
    fileserverHits: 0,
    platform: envOrThrow("PLATFORM"),
  },
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: {
      migrationsFolder: "./src/db/migrations",
    },
  },
};

export const apiConfig: APIConfig = config.api;
