const jwt = require("jsonwebtoken");
const User = require("../models/user");

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader)
    return res.status(401).json({ message: "No token, authorization denied" });

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Token is not valid" });
  }
};

const verifyAdmin = async (req, res, next) => {
  verifyToken(req, res, async () => {
    try {
      const user = await User.findById(req.user);
      if (!user || user.role !== "admin")
        return res.status(403).json({ message: "Access denied" });
      next();
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });
};

module.exports = { verifyToken, verifyAdmin };
