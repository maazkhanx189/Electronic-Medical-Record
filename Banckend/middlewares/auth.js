import jwt from "jsonwebtoken";
import User from "../model/user_model.js";
import Patient from "../model/patient_model.js";
import Doctor from "../model/doctor_model.js";
import Receptionist from "../model/receptionist_model.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Try to find user in all three models
      let user = await User.findById(decoded.userID).select("-password");
      if (!user) {
        user = await Patient.findById(decoded.userID).select("-password");
      }
      if (!user) {
        user = await Doctor.findById(decoded.userID).select("-password");
      }
      if (!user) {
        user = await Receptionist.findById(decoded.userID).select("-password");
      }

      if (!user) return res.status(401).json({ msg: "User not found" });

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ msg: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ msg: "Not authorized, no token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied. Admins only." });
  }
  next();
};

export const isDoctor = (req, res, next) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ msg: "Access denied. Doctors only." });
  }
  next();
};

export const isAdminOrDoctor = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "doctor") {
    return res.status(403).json({ msg: "Access denied. Admins or Doctors only." });
  }
  next();
};

