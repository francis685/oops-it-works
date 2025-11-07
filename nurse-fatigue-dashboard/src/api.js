import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

// ✅ Get all nurses
export const getNurses = () => API.get("/nurses");

// ✅ Update nurse by ID
export const updateNurse = (id, data) => API.put(`/nurses/${id}`, data);
