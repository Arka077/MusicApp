const jwt = require("jsonwebtoken");

/**
 * Generic core JWT token verification layer
 */
const authenticate = async (req, res, next) => {
  const token = req.cookies.token;

  console.log("--- MIDDLEWARE REACHED ---");
  console.log("Token present:", !!token);

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    console.log("User authorized with role:", decoded.role);

    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

/**
 * Dynamic Role Verification Closure Factory
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        message: `Forbidden: Only ${role}s can perform this action`,
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authArtist: [authenticate, requireRole("artist")],
  authUser: [authenticate, requireRole("user")],
};
