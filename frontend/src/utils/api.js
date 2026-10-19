// API client for HTTP communication with the backend

// Determines base URL for API requests
const getApiBase = () => {
  if (
    typeof window !== "undefined" &&
    (window.location.port === "5173" || window.location.port === "3000")
  ) {
    return ""; // Relative requests handled by Vite proxy
  }
  return typeof window !== "undefined" ? window.location.origin : "http://localhost:5000";
};

export const API_BASE = getApiBase();

export class ApiError extends Error {
  constructor(message, statusCode, data = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        (data && (data.error || data.message)) ||
        `HTTP Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      "Unable to connect to the server. Please verify the backend is running.",
      0,
      err
    );
  }
}

export const api = {
  // Shortens a destination URL with optional custom alias
  shortenUrl: async ({ url, customAlias }) => {
    return request("/api/shorten", {
      method: "POST",
      body: JSON.stringify({
        url,
        customAlias: customAlias ? customAlias.trim() : undefined
      })
    });
  },

  // Fetches all shortened URLs
  getAllUrls: async () => {
    return request("/api/urls");
  },

  // Fetches click analytics for a short code
  getAnalytics: async (shortCode) => {
    return request(`/api/analytics/${encodeURIComponent(shortCode)}`);
  },

  // Deletes a short URL by its code
  deleteUrl: async (shortCode) => {
    return request(`/api/urls/${encodeURIComponent(shortCode)}`, {
      method: "DELETE"
    });
  }
};
