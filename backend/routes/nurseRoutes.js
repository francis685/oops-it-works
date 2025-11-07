import express from "express";
import Nurse from "../models/Nurse.js";

const router = express.Router();

// 🟢 Create Nurse (POST)
router.post("/", async (req, res) => {
  console.log("📥 Incoming nurse data:", req.body);

  try {
    const nurse = new Nurse(req.body);
    await nurse.save();
    res.status(201).json(nurse);
  } catch (error) {
    console.error("❌ Error saving nurse:", error);
    res.status(500).json({
      message: "Error saving nurse",
      error: error.message || error,
    });
  }
});

// 🟢 Get All Nurses (GET)
router.get("/", async (req, res) => {
  try {
    const nurses = await Nurse.find();
    res.status(200).json(nurses);
  } catch (error) {
    console.error("❌ Error fetching nurses:", error);
    res.status(500).json({
      message: "Error fetching nurses",
      error: error.message || error,
    });
  }
});

export default router;
