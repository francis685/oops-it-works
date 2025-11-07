// src/App.js
import React, { useEffect, useState } from "react";
import NurseFatigueDashboard from "./NurseFatigueDashboard";
import { getNurses } from "./api";

function App() {
  const [nurses, setNurses] = useState([]);

  useEffect(() => {
    getNurses()
      .then((res) => {
        console.log("✅ Nurses fetched:", res.data);
        setNurses(res.data);
      })
      .catch((err) => console.error("❌ Error fetching nurses:", err));
  }, []);

  return <NurseFatigueDashboard nurses={nurses} />;
}

export default App;
