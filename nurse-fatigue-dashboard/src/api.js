import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

export const getNurses = () => API.get("/nurses");
export const updateNurse = (id, data) => API.put(`/nurses/${id}`, data);

// ✅ call the backend proxy which calls Python optimizer
export const optimizeAssignments = (patientsToAssign) =>
  API.post("/optimize", { patientsToAssign });

export default API;
