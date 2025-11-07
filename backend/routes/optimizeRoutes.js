import express from "express";
import axios from "axios";
import Nurse from "../models/Nurse.js";

const router = express.Router();

/**
 * POST /api/optimize
 * body:
 * {
 *   "patientsToAssign": { "A1": 4, "A2": 6, "A3": 8, "A4": 4, "A5": 3 }
 * }
 * It will fetch current nurses from DB, send to Python, and return assignments.
 */
router.post("/", async (req, res) => {
  try {
    const patientsToAssign = req.body?.patientsToAssign;

    // Validate input
    if (!patientsToAssign) {
      return res.status(400).json({ message: "patientsToAssign is required" });
    }

    // Fetch nurses (name, score, experience) from DB
    const nurses = await Nurse.find({}, "name score experience").lean();

    // Call Python optimizer API
    const pyResp = await axios.post("http://127.0.0.1:5002/optimize", {
      nurses,
      patientsToAssign,
    });

    const { assignments, status } = pyResp.data;
    return res.json({ status, assignments });
  } catch (err) {
    console.error("❌ Optimize error:", err?.response?.data || err.message);
    res.status(500).json({
      message: "Optimization failed",
      error: err?.response?.data || err.message || err,
    });
  }
});

export default router;
