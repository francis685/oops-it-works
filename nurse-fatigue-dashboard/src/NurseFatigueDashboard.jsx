import React, { useState, useEffect } from "react";
import {
  Activity,
  Calendar,
  Award,
  TrendingDown,
  AlertCircle,
  Brain,
  Loader2,
} from "lucide-react";
import { getNurses, updateNurse, getBalance, predictFatigue } from "./api";
import EnergyGraph from "./EnergyGraph";

export default function NurseFatigueDashboard() {
  const [nurses, setNurses] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);

  // 🧠 Fetch nurses initially
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const nurseRes = await getNurses();
        setNurses(nurseRes.data);
      } catch (err) {
        console.error("❌ Error fetching nurses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // 🔁 Fetch AI balance suggestions every 30 seconds
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoadingAI(true);
        const res = await getBalance();
        setSuggestions(res.data.recommendations || []);
      } catch (err) {
        console.error("❌ Error fetching balance suggestions:", err);
      } finally {
        setLoadingAI(false);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  // ⚖️ Fatigue calculation
  const weights = { A1: 20, A2: 15, A3: 10, A4: 5, A5: 2 };
  const calculateFatigue = (nurse) => {
    let total = 0;
    for (const level in weights) {
      total += (nurse.patients?.[level] || 0) * weights[level];
    }
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

  // 💾 Update nurse workload input
  const handleInputChange = async (id, level, value) => {
    const updated = nurses.map((nurse) => {
      if (nurse._id === id) {
        const updatedPatients = {
          ...nurse.patients,
          [level]: Math.max(0, Number(value)),
        };
        const updatedNurse = { ...nurse, patients: updatedPatients };
        const fatigue = calculateFatigue(updatedNurse);
        return { ...updatedNurse, ...fatigue };
      }
      return nurse;
    });

    setNurses(updated);
    const changedNurse = updated.find((n) => n._id === id);

    try {
      await updateNurse(id, changedNurse);
      console.log(`✅ Updated nurse: ${changedNurse.name}`);
    } catch (error) {
      console.error("❌ Error updating nurse:", error);
    }
  };

  // 🎯 Predict Fatigue — AI Integration with Flask (UPDATED WITH BETTER ALERT)
  const handlePredictFatigue = async (nurse) => {
    // Calculate total patient count for severity
    const totalPatients = Object.values(nurse.patients || {}).reduce((sum, count) => sum + count, 0);
    
    // Calculate weighted severity (A1 = highest severity)
    const weights = { A1: 10, A2: 8, A3: 6, A4: 4, A5: 2 };
    let weightedSeverity = 0;
    for (const [level, count] of Object.entries(nurse.patients || {})) {
      weightedSeverity += (weights[level] || 0) * count;
    }
    const avgSeverity = totalPatients > 0 ? weightedSeverity / totalPatients : 1;

    const payload = {
      HoursWorked: nurse.hoursWorked || 8,
      DaysSinceLastLeave: nurse.daysSinceLastLeave || 5,
      PatientSeverityIndex: avgSeverity, // Now properly weighted
      EmotionalLoad: totalPatients > 5 ? 8 : 6, // More patients = more emotional load
      SleepHours: nurse.sleepHours || 7,
      NightShifts: nurse.nightShifts || 2,
      ExperienceYears: nurse.experience || 3,
      Age: nurse.age || 28,
    };

    console.log("🧠 Sending payload:", payload);

    try {
      setLoadingAI(true);
      const res = await predictFatigue(payload);
      console.log("✅ AI Response:", res.data);

      // ✅ UPDATED ALERT WITH FULL DETAILS
      alert(
        `🧠 AI Fatigue Analysis for ${nurse.name}\n\n` +
          `Status: ${res.data.fatigueLevel} (${res.data.riskLevel} Risk)\n` +
          `Burnout In: ${res.data.burnoutTimeHours} hours\n` +
          `Confidence: ${res.data.confidence.toFixed(1)}%\n\n` +
          `📋 Current Load:\n` +
          `- Hours Worked: ${res.data.inputSummary.hoursWorked}h\n` +
          `- Patient Severity: ${res.data.inputSummary.patientLoad}/10\n` +
          `- Sleep: ${res.data.inputSummary.sleepHours}h\n\n` +
          `💡 Recommendation:\n${res.data.recommendation}`
      );
    } catch (error) {
      console.error("❌ Failed to fetch AI prediction:", error);
      alert("⚠️ Failed to fetch AI prediction. Make sure Flask is running on port 5001");
    } finally {
      setLoadingAI(false);
    }
  };

  // 🎨 Status Icons
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
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-3 animate-pulse">
          Nurse Fatigue Dashboard
        </h1>
        <p className="text-gray-300 text-lg">
          Real-time workload tracking, burnout prediction & AI balancing
        </p>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="text-center text-gray-300 mt-20">
          <Loader2 className="animate-spin inline-block w-8 h-8 mr-2 text-purple-400" />
          Loading nurse data...
        </div>
      ) : (
        <>
          {/* Nurse Cards */}
          <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {nurses.map((nurse) => (
              <div
                key={nurse._id}
                className="group bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl hover:shadow-purple-500/20 hover:scale-105 transition-all"
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
                      Leave: {nurse.lastLeave || "N/A"}
                    </p>
                  </div>

                  {/* Score Circle */}
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
                      <span className="text-2xl font-bold text-white">{nurse.score}</span>
                      <span className="text-xs text-gray-400">Energy</span>
                    </div>
                  </div>
                </div>

                {/* Workload Inputs */}
                <div className="grid grid-cols-5 gap-2 mb-4 text-center">
                  {["A1", "A2", "A3", "A4", "A5"].map((code) => (
                    <div key={code}>
                      <label className="block text-xs text-gray-400 mb-1 font-semibold">
                        {code}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={nurse.patients?.[code] || 0}
                        onChange={(e) => handleInputChange(nurse._id, code, e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-xl py-2 text-center text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 outline-none"
                      />
                    </div>
                  ))}
                </div>

                {/* Status & Recommendation */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(nurse.status)}
                    <span className="font-semibold text-white">{nurse.status}</span>
                  </div>
                </div>
                <p className="text-sm text-purple-200 font-medium">
                  {nurse.recommendation}
                </p>

                {/* ✅ Predict Fatigue Button */}
                <button
                  onClick={() => handlePredictFatigue(nurse)}
                  disabled={loadingAI}
                  className="mt-3 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  {loadingAI ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 text-white" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" /> Predict Fatigue 🔮
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Graph Section */}
          <EnergyGraph />

          {/* AI Suggestions Section */}
          <div className="max-w-5xl mx-auto mt-10 p-6 bg-white/10 rounded-2xl border border-white/20 shadow-xl">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-white mb-4">
              <Brain className="w-6 h-6 text-purple-400" />
              AI Fatigue Balancer
            </h2>
            {suggestions.length > 0 ? (
              <ul className="space-y-3">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="text-gray-300 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2"
                  >
                    {s.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">No balance suggestions yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}