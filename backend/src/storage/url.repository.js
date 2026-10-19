// In-memory data repository for URL records

// Primary index mapping shortCode to URL record
const urlsByCode = new Map();

// Secondary index mapping originalUrl to shortCode for idempotency
const codesByOriginalUrl = new Map();

export const urlRepository = {
  // Saves a new URL record
  save: (record) => {
    const entry = {
      id: record.id,
      originalUrl: record.originalUrl,
      shortCode: record.shortCode,
      isCustom: Boolean(record.isCustom),
      clicks: 0,
      createdAt: new Date().toISOString(),
      lastAccessedAt: null,
      recentClicks: []
    };

    urlsByCode.set(record.shortCode, entry);
    codesByOriginalUrl.set(record.originalUrl, record.shortCode);

    return entry;
  },

  // Finds URL record by short code
  findByCode: (shortCode) => {
    return urlsByCode.get(shortCode) || null;
  },

  // Finds URL record by original long URL
  findByOriginalUrl: (originalUrl) => {
    const shortCode = codesByOriginalUrl.get(originalUrl);
    if (!shortCode) return null;
    return urlsByCode.get(shortCode) || null;
  },

  // Increments click counter and logs visitor metadata
  incrementClicks: (shortCode, metadata = {}) => {
    const record = urlsByCode.get(shortCode);
    if (!record) return null;

    record.clicks += 1;
    record.lastAccessedAt = new Date().toISOString();

    if (!record.recentClicks) record.recentClicks = [];
    record.recentClicks.unshift({
      timestamp: record.lastAccessedAt,
      userAgent: metadata.userAgent || "Direct",
      referrer: metadata.referrer || "Direct"
    });

    return record;
  },

  // Returns all shortened URL records (newest first)
  findAll: () => {
    return Array.from(urlsByCode.values()).reverse();
  },

  // Deletes URL record by short code
  deleteByCode: (shortCode) => {
    const record = urlsByCode.get(shortCode);
    if (!record) return false;

    codesByOriginalUrl.delete(record.originalUrl);
    return urlsByCode.delete(shortCode);
  },

  // Clears all stored records (used in test suite)
  clear: () => {
    urlsByCode.clear();
    codesByOriginalUrl.clear();
  }
};
