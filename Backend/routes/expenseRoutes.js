const express = require("express");
const auth = require("../middleware/auth");
const Expense = require("../models/Expense");
const Salon = require("../models/Salon");

const router = express.Router();

const getDateBounds = () => {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);

  return { today, weekStart, monthStart, yearStart, now };
};

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

router.post("/", auth(["admin"]), async (req, res) => {
  try {
    const { category, amount, date, description = "", salonId } = req.body;

    if (!category || amount === undefined || !date || !salonId) {
      return res.status(400).json({ message: "category, amount, date and salonId are required" });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ message: "amount must be a valid positive number" });
    }

    const parsedDate = parseDate(date);
    if (!parsedDate) {
      return res.status(400).json({ message: "Invalid expense date" });
    }

    const salon = await Salon.findOne({ _id: salonId, adminId: req.user.id });
    if (!salon) {
      return res.status(403).json({ message: "Unauthorized salon access" });
    }

    const expense = await Expense.create({
      category: String(category).trim(),
      amount: parsedAmount,
      date: parsedDate,
      description: String(description || "").trim(),
      salonId,
      adminId: req.user.id,
    });

    res.status(201).json({
      message: "Expense added successfully",
      expense
    });
  } catch (err) {
    console.error("CREATE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", auth(["admin", "manager"]), async (req, res) => {
  try {
    const { salonId, startDate, endDate } = req.query;

    if (!salonId) {
      return res.status(400).json({ message: "salonId is required" });
    }

    const query = { salonId };

    if (req.user.role === "admin") {
      query.adminId = req.user.id;
    } else {
      if (!req.user.salonId || String(req.user.salonId) !== String(salonId)) {
        return res.status(403).json({ message: "Unauthorized salon access" });
      }
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const parsedStart = parseDate(startDate);
        if (!parsedStart) return res.status(400).json({ message: "Invalid startDate" });
        query.date.$gte = parsedStart;
      }
      if (endDate) {
        const parsedEnd = parseDate(endDate);
        if (!parsedEnd) return res.status(400).json({ message: "Invalid endDate" });
        query.date.$lte = parsedEnd;
      }
    }

    const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    console.error("GET EXPENSES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", auth(["admin"]), async (req, res) => {
  try {
    const { category, amount, date, description = "", salonId } = req.body;

    if (!category || amount === undefined || !date || !salonId) {
      return res.status(400).json({ message: "category, amount, date and salonId are required" });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ message: "amount must be a valid positive number" });
    }

    const parsedDate = parseDate(date);
    if (!parsedDate) {
      return res.status(400).json({ message: "Invalid expense date" });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (String(expense.adminId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const salon = await Salon.findOne({ _id: salonId, adminId: req.user.id });
    if (!salon) {
      return res.status(403).json({ message: "Unauthorized salon access" });
    }

    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        category: String(category).trim(),
        amount: parsedAmount,
        date: parsedDate,
        description: String(description || "").trim(),
        salonId
      },
      { new: true }
    );

    res.json({
      message: "Expense updated successfully",
      expense: updated
    });
  } catch (err) {
    console.error("UPDATE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/summary", auth(["admin", "manager", "staff"]), async (req, res) => {
  try {
    const { salonId } = req.query;
    if (!salonId) {
      return res.status(400).json({ message: "salonId is required" });
    }

    const baseQuery = { salonId };

    if (req.user.role === "admin") {
      baseQuery.adminId = req.user.id;
    } else if (!req.user.salonId || String(req.user.salonId) !== String(salonId)) {
      return res.status(403).json({ message: "Unauthorized salon access" });
    }

    const { weekStart, monthStart, yearStart, now } = getDateBounds();

    const [weeklyAgg, monthlyAgg, annualAgg, totalAgg] = await Promise.all([
      Expense.aggregate([
        { $match: { ...baseQuery, date: { $gte: weekStart, $lte: now } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Expense.aggregate([
        { $match: { ...baseQuery, date: { $gte: monthStart, $lte: now } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Expense.aggregate([
        { $match: { ...baseQuery, date: { $gte: yearStart, $lte: now } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Expense.aggregate([
        { $match: baseQuery },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    res.json({
      weeklyExpense: weeklyAgg[0]?.total || 0,
      monthlyExpense: monthlyAgg[0]?.total || 0,
      annualExpense: annualAgg[0]?.total || 0,
      totalExpense: totalAgg[0]?.total || 0
    });
  } catch (err) {
    console.error("EXPENSE SUMMARY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Ensure admin owns this expense
    if (String(expense.adminId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({ message: "Expense deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

