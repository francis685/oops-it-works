// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // backend base URL
});

// API functions
export const getNurses = () => API.get("/nurses");
export const addNurse = (data) => API.post("/nurses", data);

export default API;
