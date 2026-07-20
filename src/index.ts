import express from "express";


const app = express();

cosnt PORT = 8080;

app.use(express.static("."));

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});


