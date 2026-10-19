// Global error handling middleware

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error(`[Error on ${req.method} ${req.originalUrl}]:`, err.message);

  res.status(statusCode).json({
    success: false,
    error: err.message || "An unexpected error occurred."
  });
};
