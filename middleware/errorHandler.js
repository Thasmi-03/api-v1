export default function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(e => {
      const message = e.message;
      if (message.includes("is required")) {
        return message.replace(/Path `(.+)` is required\./, "$1 is required");
      }
      return message;
    });
    return res.status(400).json({ error: errors.join(", ") });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ error: `${field} already exists` });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }

  res.status(err.status || 500).json({ 
    error: err.message || "Internal Server Error" 
  });
}
