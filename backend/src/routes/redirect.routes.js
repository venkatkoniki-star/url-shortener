// Short URL redirection route definitions

import { Router } from "express";
import { urlController } from "../controllers/url.controller.js";

const router = Router();

// Ignore favicon requests
router.get("/favicon.ico", (req, res) => res.status(204).end());

// Redirect short code to destination URL
router.get("/:shortCode", urlController.redirectToOriginalUrl);

export default router;
