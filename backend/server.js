import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import nurseRoutes from "./routes/nurseRoutes.js";
import optimizeRoutes from "./routes/optimizeRoutes.js"; // ✅ new route

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

// ✅ Base route for testing
app.get("/", (req, res) => {
  res.send("🩺 Nurse Fatigue & Optimization API is running...");
});

// ✅ Nurse CRUD routes
app.use("/api/nurses", nurseRoutes);

// ✅ AI Optimization route (connects to Python AI service)
app.use("/api/optimize", optimizeRoutes);

// ✅ Global error handler (optional but helpful)
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
