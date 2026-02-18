const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Staff = require("../models/Staff");

const TRIAL_DAYS = 14;
const TRIAL_WINDOW_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

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

const isTrialBypassRoute = (req) => {
  const method = (req.method || "").toUpperCase();
  const route = req.originalUrl || req.url || "";

  if (route.startsWith("/api/plans")) return true;
  if (method === "GET" && route === "/") return true;
  return false;
};

const resolveTrialEnd = (adminUser) => {
  if (adminUser?.trialEndsAt) {
    return new Date(adminUser.trialEndsAt);
  }

  const startSource = adminUser?.trialStartAt || adminUser?.createdAt || new Date();
  const start = new Date(startSource);
  return new Date(start.getTime() + TRIAL_WINDOW_MS);
};

const hasActiveDemoAccess = (adminUser) => {
  if (!adminUser?.demoAccessUntil) return false;
  return Date.now() <= new Date(adminUser.demoAccessUntil).getTime();
};

module.exports = (allowedRoles = []) => {
  return async (req, res, next) => {

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
      // { id, role, salonId, adminId }

      if (
        allowedRoles.length &&
        !allowedRoles.includes(decoded.role)
      ) {
        debugLog(`AUTH FAILED: Access Denied. Role ${decoded.role} not in [${allowedRoles.join(",")}] | Path: ${req.originalUrl}`);
        return res.status(403).json({ message: "Access denied" });
      }

      if (!isTrialBypassRoute(req)) {
        let adminUserId = decoded.role === "admin" ? decoded.id : decoded.adminId;

        if (!adminUserId && (decoded.role === "staff" || decoded.role === "manager")) {
          const staff = await Staff.findById(decoded.id).select("adminId");
          adminUserId = staff?.adminId || null;
        }

        if (adminUserId) {
          const adminUser = await User.findById(adminUserId).select(
            "selectedPlanId trialStartAt trialEndsAt demoAccessUntil createdAt"
          );

          if (adminUser && !adminUser.selectedPlanId) {
            const demoActive = hasActiveDemoAccess(adminUser);
            if (demoActive) {
              debugLog(`AUTH SUCCESS: Demo access active | Role: ${decoded.role} | Path: ${req.originalUrl}`);
              return next();
            }

            const trialEndsAt = resolveTrialEnd(adminUser);
            const isExpired = Date.now() > trialEndsAt.getTime();

            if (isExpired) {
              return res.status(403).json({
                code: "TRIAL_EXPIRED",
                message: "Your 14-day free demo has expired. Please purchase a plan to continue.",
                trialDays: TRIAL_DAYS,
                trialEndsAt
              });
            }
          }
        }
      }

      debugLog(`AUTH SUCCESS: Role: ${decoded.role} | Path: ${req.originalUrl}`);

      next();

    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};
