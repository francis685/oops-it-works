import express from "express";
import Nurse from "../models/Nurse.js";

const router = express.Router();

// ✅ GET all nurses
router.get("/", async (req, res) => {
  try {
    const nurses = await Nurse.find();
    res.json(nurses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching nurses", error });
  }
});

// ✅ POST a new nurse
router.post("/", async (req, res) => {
  try {
    const nurse = new Nurse(req.body);
    await nurse.save();
    res.status(201).json(nurse);
  } catch (error) {
    res.status(500).json({ message: "Error saving nurse", error });
  }
});

// ✅ PUT (update) a nurse by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedNurse = await Nurse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedNurse);
  } catch (error) {
    res.status(500).json({ message: "Error updating nurse", error });
  }
});

export default router;
