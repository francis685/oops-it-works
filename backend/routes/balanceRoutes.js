import express from "express";
import axios from "axios";

const router = express.Router();

// ✅ Route that connects Node → Flask
router.get("/", async (req, res) => {
  try {
    const nurses = [
      { name: "Alice", score: 45 },
      { name: "Bob", score: 82 },
      { name: "Catherine", score: 38 },
      { name: "Daniel", score: 76 }
    ];

    console.log("📤 Sending data to Flask...");
    const response = await axios.post("http://127.0.0.1:5003/balance", { nurses });

    console.log("✅ Flask response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Flask connection error:", error.message);
    if (error.response) {
      console.error("Flask response error:", error.response.data);
    }
    res.status(500).json({
      error: "AI Balance request failed",
      details: error.message
    });
  }
});

export default router;
