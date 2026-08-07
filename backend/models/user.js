import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username:   { type: String, sparse: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String },           // optional for OAuth users
  googleId:   { type: String, sparse: true, unique: true },
  avatar:     { type: String },
  provider:   { type: String, default: "local" }, // "local" | "google"
  role:       { type: String, default: "beta" },
  createdAt:  { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
