// Middleware to validate incoming URL payload

import { isValidUrl } from "../utils/urlValidator.js";

export const validateUrlMiddleware = (req, res, next) => {
  const { url } = req.body || {};

  if (!url || typeof url !== "string" || url.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "The 'url' field is required in the request body."
    });
  }

  if (!isValidUrl(url.trim())) {
    return res.status(400).json({
      success: false,
      error: "Please enter a complete URL starting with http:// or https://"
    });
  }

  next();
};
