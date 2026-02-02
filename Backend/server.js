const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // ✅ ADD THIS
require("dotenv").config();

const app = express();


// ✅ FIX CORS (very important)
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// allow json body
app.use(express.json());


// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));


// test route
app.get("/", (req, res) => {
  res.send("Backend + MongoDB working ✅");
});


// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));


// start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
