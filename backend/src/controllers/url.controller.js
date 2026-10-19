// Handles incoming requests for URL shortening, redirection, and analytics

import { urlService } from "../services/url.service.js";

export const urlController = {
  // Creates a short URL from the provided long URL
  createShortUrl: (req, res, next) => {
    try {
      const { url, customAlias } = req.body;
      const result = urlService.shortenUrl({ originalUrl: url, customAlias });
      return res.status(201).json({
        success: true,
        message: "Short URL created successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  // Redirects short code to destination URL and logs visitor metadata
  redirectToOriginalUrl: (req, res, next) => {
    try {
      const { shortCode } = req.params;
      const metadata = {
        userAgent: req.get("user-agent") || "Direct",
        referrer: req.get("referer") || req.get("referrer") || "Direct"
      };
      const originalUrl = urlService.resolveUrl(shortCode, metadata);

      if (!originalUrl) {
        return res.status(404).json({
          success: false,
          error: "Short URL not found"
        });
      }

      return res.redirect(302, originalUrl);
    } catch (error) {
      next(error);
    }
  },

  // Returns click count and visitor statistics for a short link
  getUrlAnalytics: (req, res, next) => {
    try {
      const { shortCode } = req.params;
      const stats = urlService.getAnalytics(shortCode);

      if (!stats) {
        return res.status(404).json({
          success: false,
          error: `No record found for '${shortCode}'`
        });
      }

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  },

  // Returns all shortened URLs
  getAllUrls: (req, res, next) => {
    try {
      const urls = urlService.getAllUrls();
      return res.status(200).json({
        success: true,
        count: urls.length,
        data: urls
      });
    } catch (error) {
      next(error);
    }
  },

  // Deletes a short URL by its code
  deleteUrl: (req, res, next) => {
    try {
      const { shortCode } = req.params;
      const deleted = urlService.deleteUrl(shortCode);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "Link not found or already deleted"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Link deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
};
