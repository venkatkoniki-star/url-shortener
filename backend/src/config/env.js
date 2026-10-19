// Application configuration loaded from environment variables

export const config = {
  // Server listener port
  port: process.env.PORT || 5000,

  // Public base URL used for short links
  baseUrl: process.env.BASE_URL || "http://localhost:5000"
};
