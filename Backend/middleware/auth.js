const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const fs = require("fs");
const path = require("path");

const logPath = path.join(__dirname, "..", "logs", "deletion_debug.log");
const debugLog = (msg) => {
  try {
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    const time = new Date().toISOString();
    fs.appendFileSync(logPath, `[${time}] ${msg}\n`);
  } catch (err) {
    console.error("AUTH DEBUG LOG ERROR:", err.message);
  }
};

module.exports = (allowedRoles = []) => {
  return (req, res, next) => {

    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      debugLog("AUTH FAILED: No token or Bearer header");
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        JWT_SECRET
      );

      req.user = decoded;
      // { id, role, salonId }

      if (
        allowedRoles.length &&
        !allowedRoles.includes(decoded.role)
      ) {
        debugLog(`AUTH FAILED: Access Denied. Role ${decoded.role} not in [${allowedRoles.join(",")}] | Path: ${req.originalUrl}`);
        return res.status(403).json({ message: "Access denied" });
      }

      debugLog(`AUTH SUCCESS: Role: ${decoded.role} | Path: ${req.originalUrl}`);

      next();

    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};
