// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  // Malformed JSON body
  if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    statusCode = 400;
    message = "Invalid JSON in request body.";
    errors = [];
  }

  // Sequelize – unique constraint violation (e.g. duplicate email)
  if (err.name === "SequelizeUniqueConstraintError") {
    statusCode = 400;
    const field = err.errors?.[0]?.path || "field";
    message = `"${field}" already exists.`;
  }

  // Sequelize – validation error
  if (err.name === "SequelizeValidationError") {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(", ");
  }

  // Sequelize – foreign key constraint
  if (err.name === "SequelizeForeignKeyConstraintError") {
    statusCode = 400;
    message = "Invalid reference: related record does not exist.";
  }

  // Sequelize – database errors (bad column name, wrong type, etc.)
  if (err.name === "SequelizeDatabaseError") {
    statusCode = 500;
    message = "A database error occurred.";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired.";
  }

  if (process.env.NODE_ENV === "development") {
    console.error(
      `[${new Date().toISOString()}] ${statusCode} ${message}`,
      err.stack,
    );
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
