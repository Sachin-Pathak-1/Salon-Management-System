const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "mysecretkey");

    // 🔒 STAFF ONLY
    if (decoded.role !== "staff") {
      return res.status(403).json({ message: "Access denied" });
    }

    req.staff = decoded; // { id, role, salonId }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
