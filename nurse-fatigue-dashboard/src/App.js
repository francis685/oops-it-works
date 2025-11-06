import React, { useState } from "react";
import { Activity, Calendar, Award, TrendingDown, AlertCircle } from "lucide-react";

export default function NurseFatigueDashboard() {
  const [nurses, setNurses] = useState([
    {
      id: 1,
      name: "Alice",
      experience: 5,
      lastLeave: "2025-10-28",
      patients: { A1: 0, A2: 0, A3: 0, A4: 0, A5: 0 },
      score: 100,
      status: "Fresh",
      recommendation: "Assign A1–A3",
    },
    {
      id: 2,
      name: "Ben",
      experience: 3,
      lastLeave: "2025-11-02",
      patients: { A1: 0, A2: 0, A3: 0, A4: 0, A5: 0 },
      score: 100,
      status: "Fresh",
      recommendation: "Assign A1–A3",
    },
  ]);

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

  const handleInputChange = (id, field, value) => {
    const updated = nurses.map((nurse) => {
      if (nurse.id === id) {
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

    updated.sort((a, b) => a.score - b.score);
    setNurses(updated);
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
          <p className="text-gray-300 text-lg">Real-time workload monitoring and assignment recommendations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Nurses</p>
                <p className="text-2xl font-bold text-white">{nurses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Available</p>
                <p className="text-2xl font-bold text-white">
                  {nurses.filter(n => n.score >= 80).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Need Rest</p>
                <p className="text-2xl font-bold text-white">
                  {nurses.filter(n => n.score < 40).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nurse Cards */}
      <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {nurses.map((nurse) => (
          <div
            key={nurse.id}
            className="group relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300"
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getStatusColor(nurse.status)} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`}></div>
            
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {nurse.name}
                  <Award className="w-5 h-5 text-yellow-400" />
                </h2>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Award className="w-4 h-4" />
                  <span>{nurse.experience} years exp</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Leave: {nurse.lastLeave}</span>
                </div>
              </div>

              {/* Score Circle */}
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(nurse.score / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={nurse.score > 60 ? "#10b981" : nurse.score > 40 ? "#f59e0b" : "#ef4444"} />
                      <stop offset="100%" stopColor={nurse.score > 60 ? "#14b8a6" : nurse.score > 40 ? "#f97316" : "#dc2626"} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">{nurse.score}</span>
                  <span className="text-xs text-gray-400">Energy</span>
                </div>
              </div>
            </div>

            {/* Patient Inputs */}
            <div className="mb-5">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-3 font-semibold">Patient Load</p>
              <div className="grid grid-cols-5 gap-2">
                {["A1", "A2", "A3", "A4", "A5"].map((code) => (
                  <div key={code} className="relative">
                    <label className="block text-xs text-gray-400 font-semibold mb-1 text-center">
                      {code}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={nurse.patients[code]}
                      onChange={(e) =>
                        handleInputChange(nurse.id, code, e.target.value)
                      }
                      className="w-full text-center bg-white/5 border border-white/20 rounded-xl py-2 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 focus:outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Status Bar */}
            <div className="mb-5">
              <div className="h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full bg-gradient-to-r ${getStatusColor(nurse.status)} transition-all duration-700 rounded-full shadow-lg`}
                  style={{ width: `${nurse.score}%` }}
                ></div>
              </div>
            </div>

            {/* Status & Recommendation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/20">
                  {getStatusIcon(nurse.status)}
                  <span className="font-semibold text-white">{nurse.status}</span>
                </div>
              </div>
              
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Recommendation</p>
                <p className="text-sm text-purple-200 font-medium">{nurse.recommendation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}