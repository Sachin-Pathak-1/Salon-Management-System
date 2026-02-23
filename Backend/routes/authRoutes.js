const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Staff = require("../models/Staff");
const Customer = require("../models/Customer");
const CustomerOtp = require("../models/CustomerOtp");
const auth = require("../middleware/auth");
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const TRIAL_DAYS = 14;
const TRIAL_WINDOW_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;
const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_MS = 45 * 1000;

const router = express.Router();

const resolveTrialEnd = (user) => {
  if (user?.trialEndsAt) return new Date(user.trialEndsAt);
  const start = new Date(user?.trialStartAt || user?.createdAt || new Date());
  return new Date(start.getTime() + TRIAL_WINDOW_MS);
};

const isTrialExpired = (user) => {
  if (!user || user?.selectedPlanId) return false;
  const demoActive = user?.demoAccessUntil
    ? Date.now() <= new Date(user.demoAccessUntil).getTime()
    : false;
  if (demoActive) return false;
  return Date.now() > resolveTrialEnd(user).getTime();
};

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isBcryptHash = (value) =>
  typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);

const verifyAndUpgradePassword = async (account, inputPassword) => {
  if (isBcryptHash(account.password)) {
    return bcrypt.compare(inputPassword, account.password);
  }

  // Legacy support: plain-text passwords are upgraded after first successful login.
  if (account.password === inputPassword) {
    account.password = await bcrypt.hash(inputPassword, 10);
    await account.save();
    return true;
  }

  return false;
};

const findUserByEmailFlexible = async (Model, normalizedEmail) => {
  let account = await Model.findOne({ email: normalizedEmail })
    .collation({ locale: "en", strength: 2 });

  if (account) return account;

  // Legacy support: tolerate accidental spaces in stored emails.
  const emailRegex = new RegExp(`^\\s*${escapeRegex(normalizedEmail)}\\s*$`, "i");
  return Model.findOne({ email: { $regex: emailRegex } });
};

const createOtpCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const getMailerTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

const sendCustomerOtpMail = async ({ toEmail, otp, purpose }) => {
  const transport = getMailerTransport();
  if (!transport) {
    throw new Error("OTP mail service is not configured");
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject =
    purpose === "signup"
      ? "Your Signup OTP - Blissful Beauty Salon"
      : "Your Login OTP - Blissful Beauty Salon";

  await transport.sendMail({
    from,
    to: toEmail,
    subject,
    text: `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Blissful Beauty Salon</h2>
        <p>Your OTP code is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p>
        <p>This OTP expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
      </div>
    `
  });
};

const verifyCustomerOtp = async ({ email, purpose, otp }) => {
  const record = await CustomerOtp.findOne({
    email,
    purpose,
    expiresAt: { $gt: new Date() }
  });

  if (!record) {
    return { ok: false, message: "OTP is invalid or expired" };
  }

  const valid = await bcrypt.compare(String(otp), record.otpHash);
  if (!valid) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      await CustomerOtp.deleteOne({ _id: record._id });
      return { ok: false, message: "Too many invalid OTP attempts. Request a new OTP." };
    }
    await record.save();
    return { ok: false, message: "Invalid OTP" };
  }

  await CustomerOtp.deleteOne({ _id: record._id });
  return { ok: true };
};

/* ======================
   CUSTOMER SEND OTP
====================== */
router.post("/customer/send-otp", async (req, res) => {
  try {
    const rawEmail = String(req.body?.email || "").trim();
    const purpose = String(req.body?.purpose || "").trim().toLowerCase();
    const normalizedEmail = rawEmail.toLowerCase();

    if (!rawEmail || !["signup", "login"].includes(purpose)) {
      return res.status(400).json({ message: "Email and valid purpose are required" });
    }

    if (purpose === "signup") {
      const existsInUsers = await User.findOne({ email: normalizedEmail });
      const existsInStaff = await Staff.findOne({ email: normalizedEmail });
      const existsInCustomers = await Customer.findOne({ email: normalizedEmail });
      if (existsInUsers || existsInStaff || existsInCustomers) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    if (purpose === "login") {
      const customer = await Customer.findOne({ email: normalizedEmail });
      if (!customer) {
        return res.status(404).json({ message: "Customer account not found" });
      }
    }

    const existingOtp = await CustomerOtp.findOne({ email: normalizedEmail, purpose });
    if (existingOtp?.lastSentAt && Date.now() - existingOtp.lastSentAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
      return res.status(429).json({ message: "Please wait before requesting OTP again" });
    }

    const otp = createOtpCode();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await CustomerOtp.findOneAndUpdate(
      { email: normalizedEmail, purpose },
      {
        $set: {
          otpHash,
          expiresAt,
          attempts: 0,
          lastSentAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    await sendCustomerOtpMail({ toEmail: normalizedEmail, otp, purpose });

    return res.json({
      message: "OTP sent successfully to your email",
      expiresInMinutes: OTP_EXPIRY_MINUTES
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to send OTP" });
  }
});

/* ======================
   ADMIN SIGNUP
====================== */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email: normalizedEmail,
      password: hashed,
      role: "admin",
      trialStartAt: new Date(),
      trialEndsAt: new Date(Date.now() + TRIAL_WINDOW_MS)
    });

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
        salonId: null
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        trialStartAt: admin.trialStartAt,
        trialEndsAt: admin.trialEndsAt,
        trialDays: TRIAL_DAYS
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   CUSTOMER SIGNUP
====================== */
router.post("/customer/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      otp,
      contact = "",
      address = "",
      gender = "",
      dob = null
    } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!name || !normalizedEmail || !otp) {
      return res.status(400).json({ message: "Name, email and OTP are required" });
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({ message: "OTP must be exactly 6 digits" });
    }

    const existsInUsers = await User.findOne({ email: normalizedEmail });
    const existsInStaff = await Staff.findOne({ email: normalizedEmail });
    const existsInCustomers = await Customer.findOne({ email: normalizedEmail });
    if (existsInUsers || existsInStaff || existsInCustomers) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const otpCheck = await verifyCustomerOtp({
      email: normalizedEmail,
      purpose: "signup",
      otp: String(otp)
    });
    if (!otpCheck.ok) {
      return res.status(400).json({ message: otpCheck.message });
    }

    const customer = await Customer.create({
      name: String(name).trim(),
      email: normalizedEmail,
      role: "customer",
      contact: String(contact || "").trim(),
      address: String(address || "").trim(),
      gender: String(gender || "").trim().toLowerCase(),
      dob: dob ? new Date(dob) : null,
      preferredVisitTime: String(req.body?.preferredVisitTime || "").trim()
    });

    const token = jwt.sign(
      {
        id: customer._id,
        role: "customer",
        salonId: null,
        adminId: null
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        role: customer.role,
        contact: customer.contact || "",
        address: customer.address || "",
        gender: customer.gender || "",
        dob: customer.dob || null
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   CUSTOMER LOGIN
====================== */
router.post("/customer/login", async (req, res) => {
  try {
    const rawEmail = String(req.body?.email || "").trim();
    const otp = String(req.body?.otp || "");
    const normalizedEmail = rawEmail.toLowerCase();

    if (!rawEmail || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const account = await Customer.findOne({ email: normalizedEmail });

    if (!account) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const otpCheck = await verifyCustomerOtp({
      email: normalizedEmail,
      purpose: "login",
      otp
    });
    if (!otpCheck.ok) {
      return res.status(400).json({ message: otpCheck.message });
    }

    const token = jwt.sign(
      {
        id: account._id,
        role: account.role,
        salonId: null,
        adminId: null
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: account._id,
        name: account.name,
        email: account.email,
        role: account.role,
        contact: account.contact || "",
        address: account.address || "",
        gender: account.gender || "",
        dob: account.dob || null
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   LOGIN (ALL ROLES)
====================== */
router.post("/login", async (req, res) => {
  try {
    const rawEmail = String(req.body?.email || "").trim();
    const password = String(req.body?.password || "");
    const normalizedEmail = rawEmail.toLowerCase();

    if (!rawEmail || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    let account = await findUserByEmailFlexible(User, normalizedEmail);

    if (!account) {
      account = await findUserByEmailFlexible(Staff, normalizedEmail);
    }

    if (!account) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (account.role !== "admin" && account.status === "inactive") {
      return res.status(403).json({ message: "Staff inactive" });
    }

    const ok = await verifyAndUpgradePassword(account, password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    let trialOwner = null;
    if (account.role === "admin") {
      trialOwner = account;
    } else if (account.adminId) {
      trialOwner = await User.findById(account.adminId).select(
        "selectedPlanId trialStartAt trialEndsAt demoAccessUntil createdAt"
      );
    }

    if (isTrialExpired(trialOwner)) {
      return res.status(403).json({
        code: "TRIAL_EXPIRED",
        message: "Your 14-day free demo has expired. Please purchase a plan to continue.",
        trialDays: TRIAL_DAYS,
        trialEndsAt: resolveTrialEnd(trialOwner)
      });
    }

    const token = jwt.sign(
      {
        id: account._id,
        role: account.role,
        salonId: account.salonId || null,
        adminId: account.adminId || null
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: account._id,
        name: account.name,
        email: account.email,
        role: account.role,
        salonId: account.salonId || null,
        adminId: account.adminId || null
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   CUSTOMER PROFILE
====================== */
router.get("/customer/me", auth(["customer"]), async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select(
      "_id name email role contact address gender dob preferredServices skinType hairType allergies preferredVisitTime communicationPreference notes createdAt"
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.json({
      id: customer._id,
      name: customer.name,
      email: customer.email,
      role: customer.role,
      contact: customer.contact || "",
      address: customer.address || "",
      gender: customer.gender || "",
      dob: customer.dob || null,
      preferredServices: Array.isArray(customer.preferredServices) ? customer.preferredServices : [],
      skinType: customer.skinType || "",
      hairType: customer.hairType || "",
      allergies: customer.allergies || "",
      preferredVisitTime: customer.preferredVisitTime || "",
      communicationPreference: {
        email: Boolean(customer.communicationPreference?.email),
        sms: Boolean(customer.communicationPreference?.sms),
        whatsapp: Boolean(customer.communicationPreference?.whatsapp)
      },
      notes: customer.notes || "",
      createdAt: customer.createdAt
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/customer/profile", auth(["customer"]), async (req, res) => {
  try {
    const {
      name,
      contact = "",
      address = "",
      gender = "",
      dob = null,
      preferredServices = [],
      skinType = "",
      hairType = "",
      allergies = "",
      preferredVisitTime = "",
      communicationPreference = {},
      notes = ""
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const updated = await Customer.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          name: String(name).trim(),
          contact: String(contact || "").trim(),
          address: String(address || "").trim(),
          gender: String(gender || "").trim().toLowerCase(),
          dob: dob ? new Date(dob) : null,
          preferredServices: Array.isArray(preferredServices)
            ? preferredServices.map((item) => String(item).trim()).filter(Boolean)
            : [],
          skinType: String(skinType || "").trim(),
          hairType: String(hairType || "").trim(),
          allergies: String(allergies || "").trim(),
          preferredVisitTime: String(preferredVisitTime || "").trim(),
          communicationPreference: {
            email: Boolean(communicationPreference?.email),
            sms: Boolean(communicationPreference?.sms),
            whatsapp: Boolean(communicationPreference?.whatsapp)
          },
          notes: String(notes || "").trim()
        }
      },
      { new: true }
    ).select("_id name email role contact address gender dob preferredServices skinType hairType allergies preferredVisitTime communicationPreference notes createdAt");

    if (!updated) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.json({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      contact: updated.contact || "",
      address: updated.address || "",
      gender: updated.gender || "",
      dob: updated.dob || null,
      preferredServices: Array.isArray(updated.preferredServices) ? updated.preferredServices : [],
      skinType: updated.skinType || "",
      hairType: updated.hairType || "",
      allergies: updated.allergies || "",
      preferredVisitTime: updated.preferredVisitTime || "",
      communicationPreference: {
        email: Boolean(updated.communicationPreference?.email),
        sms: Boolean(updated.communicationPreference?.sms),
        whatsapp: Boolean(updated.communicationPreference?.whatsapp)
      },
      notes: updated.notes || "",
      createdAt: updated.createdAt
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
