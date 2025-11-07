import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function NurseChart({ history }) {
  if (!history || history.length === 0) return null;

  const formatted = history.map(h => ({
    date: new Date(h.date).toLocaleDateString(),
    fatigue: h.fatigueScore,
  }));

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mt-6 border border-white/20">
      <h3 className="text-xl font-semibold text-purple-300 mb-4">Fatigue Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" stroke="#ccc" />
          <YAxis stroke="#ccc" domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="fatigue" stroke="#a855f7" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
