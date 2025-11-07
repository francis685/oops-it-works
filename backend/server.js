import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// ✅ Load environment variables first
dotenv.config();

// ✅ Initialize Express app BEFORE using it
const app = express();

// ✅ Middleware setup
app.use(cors());
app.use(express.json());

// ✅ Import routes AFTER app is created
import nurseRoutes from "./routes/nurseRoutes.js";
import optimizeRoutes from "./routes/optimizeRoutes.js";
import balanceRoutes from "./routes/balanceRoutes.js";
import energyRoutes from "./routes/energyRoutes.js"; // <-- your new route
import aiRoutes from "./routes/airoutes.js";
// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// ✅ Base route
app.get("/", (req, res) => {
  res.json({
    message: "🩺 Nurse Fatigue API is running",
    routes: [
      "/api/nurses",
      "/api/optimize",
      "/api/balance",
      "/api/ai",
      "/api/energy",
    ],
  });
});

// ✅ Register routes
app.use("/api/nurses", nurseRoutes);
app.use("/api/optimize", optimizeRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/energy", energyRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
