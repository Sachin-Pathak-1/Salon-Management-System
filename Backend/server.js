const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

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
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/salons", require("./routes/salonRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/plans", require("./routes/plansRoutes"));

// ---------------------
// SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
