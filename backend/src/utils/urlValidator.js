// URL validation and normalization utilities

// Reserved slugs that conflict with API endpoints
export const RESERVED_ALIASES = new Set(["api", "health", "favicon.ico", "assets"]);

// Validates whether a string is a valid HTTP or HTTPS URL
export function isValidUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return false;

  try {
    const parsed = new URL(urlString.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (error) {
    return false;
  }
}

// Normalizes URL by lowercasing hostname and trimming trailing slashes
export function normalizeUrl(urlString) {
  if (!isValidUrl(urlString)) return urlString;

  try {
    const parsed = new URL(urlString.trim());
    let pathname = parsed.pathname.replace(/\/+$/, "");

    const port = parsed.port ? `:${parsed.port}` : "";
    const search = parsed.search || "";
    const hash = parsed.hash || "";

    return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${port}${pathname}${search}${hash}`;
  } catch (error) {
    return urlString.trim();
  }
}

// Validates format, length, and availability of custom alias slugs
export function isValidAlias(alias) {
  if (!alias || typeof alias !== "string") {
    return { valid: false, message: "Alias must be a string." };
  }

  const clean = alias.trim();

  if (clean.length < 3 || clean.length > 30) {
    return { valid: false, message: "Custom alias must be between 3 and 30 characters." };
  }

  const allowedCharacters = /^[a-zA-Z0-9_-]+$/;
  if (!allowedCharacters.test(clean)) {
    return { valid: false, message: "Alias can only contain letters, numbers, - and _" };
  }

  if (RESERVED_ALIASES.has(clean.toLowerCase())) {
    return { valid: false, message: `The alias '${clean}' is reserved by the server.` };
  }

  return { valid: true };
}
