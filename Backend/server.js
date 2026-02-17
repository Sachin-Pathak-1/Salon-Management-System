require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ---------------------
// MIDDLEWARE
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ---------------------
// MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.error("Mongo Error:", err));

// ---------------------
// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend + MongoDB working ✅");
});

// ---------------------
// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/adminProfile", require("./routes/adminProfileRoutes"));
app.use("/api/staffAuth", require("./routes/staffAuth"));
app.use("/api/staffProfile", require("./routes/staffProfile"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/manager-dashboard", require("./routes/managerDashboardRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/salons", require("./routes/salonRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/plans", require("./routes/plansRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));

// ---------------------
// SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Plans routes loaded at /api/plans");
});
