import express from "express";
import { Request, Response, NextFunction } from "express";
import { apiConfig } from "./config.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);



export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const app = express();
const PORT = 8080;

app.use(express.json());

export const middlewareLogResponses = (req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
    }
  });

  next();
};

app.use(middlewareLogResponses);

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
  apiConfig.fileserverHits++;
  next();
}

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.get("/api/healthz", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
});

app.get("/admin/metrics", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${apiConfig.fileserverHits} times!</p>
  </body>
</html>`);
});

app.post("/admin/reset", (req: Request, res: Response) => {
  apiConfig.fileserverHits = 0;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send("Hits reset to 0");
});

app.post("/api/validate_chirp", async (req: Request, res: Response) => {
  const body = req.body?.body;

  if (!body || typeof body !== "string" || body.length > 140) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const badWords = ["kerfuffle", "sharbert", "fornax"];
  const words = body.split(" ");
  const cleanedWords = words.map((word) => {
    if (badWords.includes(word.toLowerCase())) {
      return "****";
    }
    return word;
  });

  const cleanedBody = cleanedWords.join(" ");

  return res.status(200).json({
    cleanedBody: cleanedBody
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof BadRequestError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({ error: err.message });
  }
  if (err instanceof ForbiddenError) {
    return res.status(403).json({ error: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }

  console.log(err);
  return res.status(500).json({
    error: "Something went wrong on our end"
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
