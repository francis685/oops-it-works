import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function EnergyGraph() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnergy = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/energy");
      setData(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching energy:", err.message);
      setData([]); // safe fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnergy();                    // first load
    const id = setInterval(fetchEnergy, 30000); // refresh every 30s
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-white/10 p-6 mt-10 rounded-2xl border border-white/20 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4">⚡ Nurse Energy Levels</h2>

      {loading ? (
        <p className="text-gray-300">Loading energy data…</p>
      ) : data.length === 0 ? (
        <p className="text-gray-400">No energy data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis domain={[0, 100]} stroke="#ccc" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="energy"
              stroke="#a855f7"
              strokeWidth={3}
              name="Energy"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
