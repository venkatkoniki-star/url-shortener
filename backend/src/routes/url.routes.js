// URL Shortener API route definitions

import { Router } from "express";
import { urlController } from "../controllers/url.controller.js";
import { validateUrlMiddleware } from "../middlewares/validateUrl.js";

const router = Router();

// Shorten a long URL
router.post("/shorten", validateUrlMiddleware, urlController.createShortUrl);

// List all shortened URLs
router.get("/urls", urlController.getAllUrls);

// Get click statistics for a short link
router.get("/analytics/:shortCode", urlController.getUrlAnalytics);

// Delete a shortened URL
router.delete("/urls/:shortCode", urlController.deleteUrl);

export default router;
