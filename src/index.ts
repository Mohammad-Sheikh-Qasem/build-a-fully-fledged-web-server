import express from "express";
import { Request, Response, NextFunction } from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config, apiConfig } from "./config.js";
import { createUser, resetUsers } from "./db/queries/users.js";
import { createChirp, getAllChirps, getChirpById } from "./db/queries/chirps.js";

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

app.post("/admin/reset", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (apiConfig.platform !== "dev") {
      throw new ForbiddenError("Reset is only allowed in dev environment");
    }

    apiConfig.fileserverHits = 0;
    await resetUsers();

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send("Hits reset to 0 and users cleared");
  } catch (err) {
    next(err);
  }
});

app.post("/api/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError("Email is required");
    }

    const newUser = await createUser({ email });
    return res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

app.post("/api/chirps", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body, userId } = req.body;

    if (!body || typeof body !== "string" || body.length > 140) {
      throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    if (!userId) {
      throw new BadRequestError("userId is required");
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

    const newChirp = await createChirp({
      body: cleanedBody,
      userId,
    });

    return res.status(201).json(newChirp);
  } catch (err) {
    next(err);
  }
});

app.get("/api/chirps", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allChirps = await getAllChirps();
    return res.status(200).json(allChirps);
  } catch (err) {
    next(err);
  }
});

app.get("/api/chirps/:chirpId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chirpId = req.params.chirpId as string;

    const chirp = await getChirpById(chirpId);

    if (!chirp) {
      throw new NotFoundError("Chirp not found");
    }

    return res.status(200).json(chirp);
  } catch (err) {
    next(err);
  }
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
