import axios from "axios";

const BASE_URL = "http://localhost:5000/api";
const FLASK_API = "http://localhost:5001"; // Flask AI API

// 🩺 Nurse CRUD APIs
export const getNurses = () => axios.get(`${BASE_URL}/nurses`);
export const updateNurse = (id, data) => axios.put(`${BASE_URL}/nurses/${id}`, data);

// 🧠 AI Optimization & Balancing APIs
export const getBalance = () => axios.get(`${BASE_URL}/balance`);
export const optimizeAssignments = (payload) =>
  axios.post(`${BASE_URL}/optimize`, payload);

// ✅ AI Fatigue Prediction — Direct call to Flask (CHANGED)
export const predictFatigue = (payload) =>
  axios.post(`${FLASK_API}/predict`, payload);