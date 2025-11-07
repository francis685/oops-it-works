// backend/routes/energyRoutes.js
import express from "express";
import Nurse from "../models/Nurse.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let nurses = [];
    try {
      nurses = await Nurse.find({}).lean();
    } catch (dbErr) {
      console.warn("⚠️ Mongo not connected or Nurse model missing. Using fallback data.");
    }

    if (!nurses || nurses.length === 0) {
      console.log("🟣 Returning fallback data...");
      return res.json([
        { name: "Alice", energy: 85 },
        { name: "Ben", energy: 68 },
        { name: "Carol", energy: 74 },
        { name: "David", energy: 56 },
        { name: "Eve", energy: 92 }
      ]);
    }

    // Compute energy based on patients or score
    const weights = { A1: 20, A2: 15, A3: 10, A4: 5, A5: 2 };
    const calcScore = (p = {}) =>
      Math.max(0, 100 - ((p.A1||0)*20 + (p.A2||0)*15 + (p.A3||0)*10 + (p.A4||0)*5 + (p.A5||0)*2));

    const energy = nurses.map(n => ({
      name: n.name || "Unknown",
      energy: typeof n.score === "number" ? n.score : calcScore(n.patients),
    }));

    console.log("✅ Returning", energy.length, "energy records.");
    res.json(energy);
  } catch (err) {
    console.error("❌ Error in /api/energy:", err.message);
    res.status(500).json({ message: "Server error fetching energy data" });
  }
});

export default router;
