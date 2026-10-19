// Express server setup and route configuration

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import urlRoutes from "./routes/url.routes.js";
import redirectRoutes from "./routes/redirect.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, "../../frontend/dist");
const frontendPath = fs.existsSync(frontendDist) ? frontendDist : path.resolve(__dirname, "../../frontend");

export const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy" });
});

// URL Shortener API routes
app.use("/api", urlRoutes);

// Serves static frontend assets
app.use(express.static(frontendPath));

// Short code redirection route
app.use("/", redirectRoutes);

// Global error handler
app.use(errorHandler);

// Starts server when run directly
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  app.listen(config.port, () => {
    console.log(`Server started on ${config.baseUrl}`);
    console.log(`Open in browser: ${config.baseUrl}/`);
  });
}