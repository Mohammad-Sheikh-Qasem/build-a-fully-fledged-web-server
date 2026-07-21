import express from "express";
import { Request, Response, NextFunction} from "express";

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

app.use("/app", express.static("./src/app"));

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});


app.get("/healthz", (req: Request, res: Response) => {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
});

