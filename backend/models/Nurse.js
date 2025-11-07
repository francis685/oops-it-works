import mongoose from "mongoose";

const nurseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  experience: { type: Number, required: true },
  lastLeave: { type: String, required: true },
  patients: {
    A1: { type: Number, default: 0 },
    A2: { type: Number, default: 0 },
    A3: { type: Number, default: 0 },
    A4: { type: Number, default: 0 },
    A5: { type: Number, default: 0 },
  },
  score: { type: Number, required: true },
  status: { type: String, required: true },
  recommendation: { type: String, required: true },
});

const Nurse = mongoose.model("Nurse", nurseSchema);
export default Nurse;
