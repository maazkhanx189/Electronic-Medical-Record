import Receptionist from "../model/receptionist_model.js";
import { checkUniqueEmailAndPhone } from "../utils/validationUtils.js";

export const receptionistRegistration = async (req, res) => {
  try {
    const { username, email, password, phone, address, gender } = req.body;
    if (!username || !email || !password || !phone || !address) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    const unique = await checkUniqueEmailAndPhone(email, phone);
    if (!unique.isUnique) {
      return res.status(400).json({ msg: unique.message });
    }
    const receptionist = await Receptionist.create({
      username,
      email,
      phone,
      address,
      gender,
      password,
      role: "receptionist",
    });
    res.status(201).json({ msg: "Receptionist registered successfully", id: receptionist._id });
  } catch (error) {
    console.error("Receptionist Registration Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const receptionistLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }
    const receptionist = await Receptionist.findOne({ email });
    if (!receptionist) return res.status(400).json({ msg: "Invalid email or password" });
    const ok = await receptionist.comparePassword(password);
    if (!ok) return res.status(400).json({ msg: "Invalid email or password" });
    const token = await receptionist.generateToken();
    res.status(200).json({
      msg: "Login successful",
      token,
      userID: receptionist._id.toString(),
      role: receptionist.role,
      receptionist: { username: receptionist.username, email: receptionist.email },
    });
  } catch (error) {
    console.error("Receptionist Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

