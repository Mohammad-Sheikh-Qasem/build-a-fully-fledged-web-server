import express from "express";
import { Request, Response, NextFunction } from "express";
import { apiConfig } from "./config.js";

const app = express();
const PORT = 8080;


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


app.get("/healthz", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
});

app.get("/metrics", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(`Hits: ${apiConfig.fileserverHits}`);
});

app.get("/reset", (req: Request, res: Response) => {
  apiConfig.fileserverHits = 0;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send("Hits reset to 0");
});


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
