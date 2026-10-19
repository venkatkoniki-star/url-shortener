// Business logic for URL shortening, redirection, and analytics

import { urlRepository } from "../storage/url.repository.js";
import { encodeBase62 } from "../utils/base62.js";
import { normalizeUrl, isValidAlias } from "../utils/urlValidator.js";
import { config } from "../config/env.js";

// Starting counter value for Base62 encoding
let globalCounter = 1000;

export const urlService = {
  // Shortens a long URL using custom alias or Base62 encoding
  shortenUrl: ({ originalUrl, customAlias }) => {
    const cleanUrl = normalizeUrl(originalUrl);

    // Handle custom alias request
    if (customAlias && customAlias.trim() !== "") {
      const alias = customAlias.trim();
      const check = isValidAlias(alias);
      if (!check.valid) {
        const error = new Error(check.message);
        error.statusCode = 400;
        throw error;
      }

      const alreadyExists = urlRepository.findByCode(alias);
      if (alreadyExists) {
        const error = new Error(`The alias '${alias}' is already in use. Please choose another.`);
        error.statusCode = 409;
        throw error;
      }

      const record = urlRepository.save({
        id: `custom_${Date.now()}`,
        originalUrl: cleanUrl,
        shortCode: alias,
        isCustom: true
      });

      return {
        shortCode: record.shortCode,
        shortUrl: `${config.baseUrl}/${record.shortCode}`,
        originalUrl: record.originalUrl,
        clicks: record.clicks,
        createdAt: record.createdAt,
        isCustom: true
      };
    }

    // Return existing record if long URL was already shortened
    const existing = urlRepository.findByOriginalUrl(cleanUrl);
    if (existing) {
      return {
        shortCode: existing.shortCode,
        shortUrl: `${config.baseUrl}/${existing.shortCode}`,
        originalUrl: existing.originalUrl,
        clicks: existing.clicks,
        createdAt: existing.createdAt,
        isCustom: existing.isCustom
      };
    }

    // Generate new short code with Base62 encoding
    globalCounter += 1;
    const shortCode = encodeBase62(globalCounter);

    const record = urlRepository.save({
      id: globalCounter,
      originalUrl: cleanUrl,
      shortCode,
      isCustom: false
    });

    return {
      shortCode: record.shortCode,
      shortUrl: `${config.baseUrl}/${record.shortCode}`,
      originalUrl: record.originalUrl,
      clicks: record.clicks,
      createdAt: record.createdAt,
      isCustom: false
    };
  },

  // Resolves short code to destination URL and increments click count
  resolveUrl: (shortCode, metadata = {}) => {
    const record = urlRepository.incrementClicks(shortCode, metadata);
    return record ? record.originalUrl : null;
  },

  // Returns click analytics and visitor history for a short code
  getAnalytics: (shortCode) => {
    const record = urlRepository.findByCode(shortCode);
    if (!record) return null;

    return {
      shortCode: record.shortCode,
      shortUrl: `${config.baseUrl}/${record.shortCode}`,
      originalUrl: record.originalUrl,
      clicks: record.clicks,
      createdAt: record.createdAt,
      lastAccessedAt: record.lastAccessedAt,
      isCustom: record.isCustom,
      recentClicks: record.recentClicks || []
    };
  },

  // Returns all shortened URL records
  getAllUrls: () => {
    const records = urlRepository.findAll();
    return records.map((record) => ({
      shortCode: record.shortCode,
      shortUrl: `${config.baseUrl}/${record.shortCode}`,
      originalUrl: record.originalUrl,
      clicks: record.clicks,
      createdAt: record.createdAt,
      lastAccessedAt: record.lastAccessedAt,
      isCustom: record.isCustom
    }));
  },

  // Deletes a shortened URL record
  deleteUrl: (shortCode) => {
    return urlRepository.deleteByCode(shortCode);
  }
};
