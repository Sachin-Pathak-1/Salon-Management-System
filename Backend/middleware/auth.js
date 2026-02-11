const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

console.log("JWT_SECRET:", JWT_SECRET); // Debugging line

module.exports = (allowedRoles = []) => {
  return (req, res, next) => {

    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
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
        return res.status(403).json({ message: "Access denied" });
      }

      next();

    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};
