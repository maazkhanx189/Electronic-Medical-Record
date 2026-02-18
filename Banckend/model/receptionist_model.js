import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const receptionistSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
  password: { type: String, required: true },
  role: { type: String, default: "receptionist" },
  createdAt: { type: Date, default: Date.now },
});

receptionistSchema.pre("save", async function () {
  const user = this;
  if (!user.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
  } catch (err) {
    throw err;
  }
});

receptionistSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

receptionistSchema.methods.generateToken = async function () {
  return jwt.sign(
    {
      userID: this._id.toString(),
      userEmail: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "2d" }
  );
};

export default mongoose.model("Receptionist", receptionistSchema);

