import express from "express";
import axios from "axios";

const router = express.Router();

// Flask API URL (make sure Flask runs on port 5001)
const FLASK_API = "http://localhost:5001";

// ✅ AI Fatigue Prediction Route - Proxy to Flask
router.post("/predict-fatigue", async (req, res) => {
  try {
    console.log("📥 Received prediction request:", req.body);

    // Forward request to Flask
    const response = await axios.post(`${FLASK_API}/predict`, req.body);

    console.log("✅ Flask response:", response.data);

    // Send Flask response back to frontend
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error calling Flask API:", error.message);
    
    // Check if Flask is not running
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "Flask AI service is not running",
        message: "Please start the Flask server on port 5001",
      });
    }

    res.status(500).json({
      error: "Failed to get AI prediction",
      details: error.message,
    });
  }
});

// ✅ Health check for AI service
router.get("/health", async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API}/health`);
    res.json({
      nodeBackend: "healthy",
      flaskBackend: response.data,
    });
  } catch (error) {
    res.status(503).json({
      nodeBackend: "healthy",
      flaskBackend: "unavailable",
      error: error.message,
    });
  }
});

export default router;