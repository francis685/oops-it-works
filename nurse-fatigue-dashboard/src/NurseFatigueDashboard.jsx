import React, { useState, useEffect } from "react";
import { Activity, Calendar, Award, TrendingDown, AlertCircle } from "lucide-react";
import { getNurses, updateNurse } from "./api"; // ✅ All imports at the top

export default function NurseFatigueDashboard() {
  const [nurses, setNurses] = useState([]);

  // 🧠 Fetch nurses from MongoDB
  useEffect(() => {
    getNurses()
      .then((res) => {
        console.log("📦 Nurses fetched:", res.data);
        setNurses(res.data);
      })
      .catch((err) => console.error("❌ Error fetching nurses:", err));
  }, []);

  const weights = { A1: 20, A2: 15, A3: 10, A4: 5, A5: 2 };

  const calculateFatigue = (nurse) => {
    let total = 0;
    for (let key in weights) total += (nurse.patients[key] || 0) * weights[key];
    const score = Math.max(0, 100 - total);

    let status = "Fresh";
    let recommendation = "Assign A1–A3";
    if (score >= 80) {
      status = "Fresh";
      recommendation = "Assign A1–A3";
    } else if (score >= 60) {
      status = "Moderate";
      recommendation = "Assign A2–A4";
    } else if (score >= 40) {
      status = "Tired";
      recommendation = "Assign A4–A5";
    } else {
      status = "Fatigued";
      recommendation = "Assign A5 / Rest shift";
    }

    return { score, status, recommendation };
  };

  // 🧩 When user changes patient inputs
  const handleInputChange = async (id, field, value) => {
    const updated = nurses.map((nurse) => {
      if (nurse._id === id) {
        const newVal = Number(value);
        const updatedNurse = {
          ...nurse,
          patients: { ...nurse.patients, [field]: newVal },
        };
        const fatigue = calculateFatigue(updatedNurse);
        return { ...updatedNurse, ...fatigue };
      }
      return nurse;
    });

    setNurses(updated);

    // Save updated nurse to DB
    const changed = updated.find((n) => n._id === id);
    try {
      await updateNurse(id, changed);
      console.log("✅ Saved to DB:", changed.name);
    } catch (error) {
      console.error("❌ Error saving nurse:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Fresh":
        return "from-emerald-500 to-teal-500";
      case "Moderate":
        return "from-yellow-500 to-orange-500";
      case "Tired":
        return "from-orange-500 to-red-500";
      case "Fatigued":
        return "from-red-500 to-rose-600";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Fresh":
        return <Activity className="w-5 h-5 text-emerald-500" />;
      case "Moderate":
        return <TrendingDown className="w-5 h-5 text-yellow-500" />;
      case "Tired":
        return <TrendingDown className="w-5 h-5 text-orange-500" />;
      case "Fatigued":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-3 animate-pulse">
            Nurse Fatigue Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            Real-time workload monitoring and assignment recommendations
          </p>
        </div>
      </div>

      {/* Nurse Cards */}
      <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {nurses.map((nurse) => (
          <div
            key={nurse._id}
            className="group relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {nurse.name}
                  <Award className="w-5 h-5 text-yellow-400" />
                </h2>
                <p className="text-gray-300 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {nurse.experience} years exp
                </p>
                <p className="text-gray-400 text-sm">
                  Leave: {nurse.lastLeave}
                </p>
              </div>
              <div className="relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="url(#gradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${(nurse.score / 100) * 219.9} 219.9`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop
                        offset="0%"
                        stopColor={
                          nurse.score > 60
                            ? "#10b981"
                            : nurse.score > 40
                            ? "#f59e0b"
                            : "#ef4444"
                        }
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          nurse.score > 60
                            ? "#14b8a6"
                            : nurse.score > 40
                            ? "#f97316"
                            : "#dc2626"
                        }
                      />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {nurse.score}
                  </span>
                  <span className="text-xs text-gray-400">Energy</span>
                </div>
              </div>
            </div>

            {/* Patient Inputs */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {["A1", "A2", "A3", "A4", "A5"].map((code) => (
                <input
                  key={code}
                  type="number"
                  min="0"
                  value={nurse.patients[code] || 0}
                  onChange={(e) =>
                    handleInputChange(nurse._id, code, e.target.value)
                  }
                  className="bg-white/5 border border-white/20 rounded-xl py-2 text-center text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 outline-none"
                />
              ))}
            </div>

            {/* Status & Recommendation */}
            <div className="flex items-center justify-between mb-2">
              <div className={`flex items-center gap-2`}>
                {getStatusIcon(nurse.status)}
                <span className="font-semibold text-white">
                  {nurse.status}
                </span>
              </div>
            </div>
            <p className="text-sm text-purple-200 font-medium">
              {nurse.recommendation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
