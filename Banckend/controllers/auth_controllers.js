import User from "../model/user_model.js";
import Doctor from "../model/doctor_model.js";
import Patient from "../model/patient_model.js";
import { checkUniqueEmailAndPhone } from "../utils/validationUtils.js";
import { User as UserSchema, Login as LoginSchema } from "../validator/auth_validator.js";




// ____________________________? 
// Home Route
//  ____________________________?//



const home = async (req, res) => {
  try {
    res.send("Welcome to Auth Route");
  } catch (error) {
    console.error(error);
  }
};




// ____________________________? 
//  Registration logic
//  ____________________________?//
const registration = async (req, res) => {
  try {
    // Validate input using Zod schema
    const validatedData = UserSchema.parse(req.body);
    const { username, email, phone, address, password, gender } = validatedData;
    // 



    // Check if email and phone are unique across all user types
    const uniqueCheck = await checkUniqueEmailAndPhone(email, phone);
    if (!uniqueCheck.isUnique) {
      return res.status(400).json({ message: uniqueCheck.message });
    }

    // user created
    const userCreated = await User.create({ username, email, phone, address, password, gender });
    if (userCreated) {
      res.status(200).json({
        msg: userCreated,
        token: await userCreated.generateToken(),
        userID: userCreated._id.toString(),
      });
    } else {
      res.status(500).json({ msg: "Something went wrong" });
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        msg: "Validation failed",
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    res.status(500).json({ msg: "Internal Error" });
  }
};



// ____________________________? 
// Login Logic
//  ____________________________?//
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const token = await user.generateToken();

    res.status(200).json({
      msg: "Login successful",
      token,
      userID: user._id.toString(),
      role: user.role,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};




// ____________________________? 
//  Get All Users 
//  ____________________________?//
const getUsers = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admins only." });
    }

    const { q, page = 1, limit = 20, role } = req.query;
    const filter = {};
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ username: regex }, { email: regex }];
    }
    if (role && role !== "all") {
      filter.role = role;
    }

    const total = await User.countDocuments(filter);
    const pages = Math.ceil(total / limit);
    const users = await User.find(filter, "-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({ data: users, total, page: Number(page), pages });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// ____________________________? 
// Delete User
//  ____________________________?//
const deleteUser = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ msg: "Admins only" });
    }

    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ msg: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};





// ____________________________?
// Update User
//  ____________________________?//
const updateUser = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ msg: "Admins only" });
    }

    const userId = req.params.id;
    const updateData = req.body;

    // Validate role if it's being updated
    if (updateData.role && !["user", "admin"].includes(updateData.role)) {
      return res.status(400).json({ msg: "Invalid role. Must be 'user' or 'admin'" });
    }

    // Prevent admin from demoting themselves
    if (updateData.role === "user" && userId === String(currentUser._id)) {
      return res.status(400).json({ msg: "You cannot demote yourself from admin role" });
    }

    if (updateData.password) delete updateData.password;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({
      msg: "User updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("Update User Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ____________________________? 
// Get All Doctors
//  ____________________________?//
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}, "-password");
    return res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Admin-only doctors list with search + pagination
const getDoctorsAdmin = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ msg: "Admins only" });
    }

    const { q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ username: regex }, { email: regex }, { specialization: regex }];
    }

    const total = await Doctor.countDocuments(filter);
    const pages = Math.ceil(total / limit);
    const doctors = await Doctor.find(filter, "-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({ data: doctors, total, page: Number(page), pages });
  } catch (error) {
    console.error("Error fetching doctors (admin):", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// ____________________________? 
// Get All Patients (Admin)
// ____________________________?//
const getPatients = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "doctor")) {
      return res.status(403).json({ msg: "Admins or Doctors only" });
    }

    const { q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ username: regex }, { email: regex }];
    }

    const total = await Patient.countDocuments(filter);
    const pages = Math.ceil(total / limit);
    const patients = await Patient.find(filter, "-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({ data: patients, total, page: Number(page), pages });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// ____________________________? 
// Laboratory summary for dashboard
// ____________________________?//
const getLaboratorySummary = async (req, res) => {
  try {
    const patients = await Patient.find(
      { "labResults.0": { $exists: true } },
      "username labResults"
    ).lean();

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const allLabs = [];
    let pendingCount = 0;

    patients.forEach((patient) => {
      const name = patient.username || "Patient";
      (patient.labResults || []).forEach((lab) => {
        if (!lab) return;
        
        // Determine status: prioritize explicit status, fallback to check result presence
        let status = lab.status;
        if (!status) {
           // Fallback logic for old data
           status = (lab.result && lab.result !== "Pending") ? "completed" : "pending";
        }
        
        if (status === "pending") {
            pendingCount++;
        }

        // Use resultDate if completed, or requestDate/date if pending
        const dateStr = lab.resultDate || lab.date || lab.requestDate;
        const date = dateStr ? new Date(dateStr) : null;
        
        allLabs.push({
          patientName: name,
          testName: lab.testName || "Lab Test",
          result: lab.result,
          date,
          unit: lab.unit,
          status: status,
          id: lab._id ? lab._id.toString() : undefined,
        });
      });
    });

    const labsToday = allLabs.filter(
      (lab) => lab.date && lab.date >= startOfDay && lab.date < endOfDay
    );

    const totalSamplesToday = labsToday.length;

    const workloadMap = new Map();
    allLabs.forEach((lab) => {
      const key = lab.testName || "Lab Test";
      const entry = workloadMap.get(key) || { test: key, pending: 0, completed: 0 };
      
      if (lab.status === 'pending') {
          entry.pending += 1;
      } else {
          entry.completed += 1;
      }
      
      workloadMap.set(key, entry);
    });

    const workloadByTest = Array.from(workloadMap.values());

    const recentLabsSorted = allLabs
      .filter((lab) => lab.date)
      .sort((a, b) => b.date - a.date)
      .slice(0, 20);

    const recentSamples = recentLabsSorted.map((lab) => ({
      id: lab.id || `${lab.patientName}-${lab.testName}-${lab.date && lab.date.toISOString()}`,
      patient: lab.patientName,
      test: lab.testName,
      status: lab.status === 'pending' ? "Pending" : "Completed",
      priority: "Routine",
      collectedAt: lab.date
        ? lab.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "-",
      reportedAt: (lab.status === 'completed' && lab.date)
        ? lab.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "-",
    }));

    res.status(200).json({
      totalSamplesToday,
      pendingReports: pendingCount,
      criticalAlerts: 0,
      avgTurnaroundMinutes: null,
      workloadByTest,
      recentSamples,
    });
  } catch (error) {
    console.error("Error building laboratory summary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ____________________________? 
// Laboratory: upload and view lab results
// ____________________________?//
const addLabResult = async (req, res) => {
  try {
    if (req.user.role === "patient") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { email, testName, type, result, unit, date } = req.body;

    if (!email || !testName || !result) {
      return res.status(400).json({ msg: "Email, test name and result are required" });
    }

    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(404).json({ msg: "Patient not found" });
    }

    const labResult = {
      testName: String(testName).trim(),
      type: type ? String(type).trim() : undefined,
      result: String(result).trim(),
      unit: unit ? String(unit).trim() : undefined,
      date: date ? new Date(date) : new Date(),
      attachment: req.file ? `/uploads/${req.file.filename}` : undefined,
    };

    patient.labResults.push(labResult);
    await patient.save();

    const savedResult = patient.labResults[patient.labResults.length - 1];

    res.status(201).json({
      msg: "Lab result recorded successfully",
      labResult: savedResult,
    });
  } catch (error) {
    console.error("Error adding lab result:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getLabResultsByEmail = async (req, res) => {
  try {
    if (req.user.role === "patient") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ msg: "Patient email is required" });
    }

    const patient = await Patient.findOne({ email }).select(
      "username age gender email labResults"
    );

    if (!patient) {
      return res.status(404).json({ msg: "Patient not found" });
    }

    const sortedResults = [...(patient.labResults || [])].sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0;
      const bTime = b.date ? new Date(b.date).getTime() : 0;
      return bTime - aTime;
    });

    res.status(200).json({
      patient: {
        name: patient.username,
        age: patient.age,
        gender: patient.gender,
        email: patient.email,
      },
      labResults: sortedResults,
    });
  } catch (error) {
    console.error("Error fetching lab results:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ____________________________? 
// Doctor: Order a lab test
// ____________________________?//
const orderLabTest = async (req, res) => {
  try {
    const currentUser = req.user;
    if (currentUser.role !== "doctor") {
      return res.status(403).json({ msg: "Access denied. Doctors only." });
    }

    const { patientEmail, testName, notes } = req.body;

    if (!patientEmail || !testName) {
      return res.status(400).json({ msg: "Patient email and test name are required" });
    }

    const patient = await Patient.findOne({ email: patientEmail });
    if (!patient) {
      return res.status(404).json({ msg: "Patient not found" });
    }

    const newOrder = {
      testName,
      status: "pending",
      doctor: currentUser._id,
      doctorName: currentUser.username,
      requestDate: new Date(),
      notes: notes || "",
      result: "Pending", // Placeholder
      unit: "",
      date: null // Not completed yet
    };

    if (!Array.isArray(patient.labResults)) {
      patient.labResults = [];
    }
    patient.labResults.push(newOrder);
    await patient.save();

    res.status(201).json({ msg: "Lab test ordered successfully", order: newOrder });
  } catch (error) {
    console.error("Error ordering lab test:", error);
    res.status(500).json({ msg: "Internal server error", error: String(error?.message || error) });
  }
};

// ____________________________? 
// Laboratory: Get all pending lab requests
// ____________________________?//
const getPendingLabTests = async (req, res) => {
  try {
    // Ideally check if user is lab staff/admin, but reusing existing auth structure
    // Assuming this endpoint is protected
    
    // Find all patients who have at least one labResult with status 'pending'
    const patients = await Patient.find(
      { "labResults.status": "pending" },
      "username email labResults"
    );

    let pendingTests = [];

    patients.forEach(patient => {
      const pending = patient.labResults.filter(r => r.status === "pending");
      pending.forEach(req => {
        pendingTests.push({
          _id: req._id,
          patientName: patient.username,
          patientEmail: patient.email,
          testName: req.testName,
          doctorName: req.doctorName,
          requestDate: req.requestDate,
          notes: req.notes
        });
      });
    });

    // Sort by oldest request first
    pendingTests.sort((a, b) => new Date(a.requestDate) - new Date(b.requestDate));

    res.status(200).json(pendingTests);
  } catch (error) {
    console.error("Error fetching pending tests:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// ____________________________? 
// Laboratory: Fulfill (Complete) a lab request
// ____________________________?//
const fulfillLabRequest = async (req, res) => {
  try {
    const { requestId, result, unit, date } = req.body;

    if (!requestId || !result) {
      return res.status(400).json({ msg: "Request ID and result are required" });
    }

    // Find the patient who has this specific lab result subdocument
    const patient = await Patient.findOne({ "labResults._id": requestId });

    if (!patient) {
      return res.status(404).json({ msg: "Lab request not found" });
    }

    // Find the subdocument
    const labResult = patient.labResults.id(requestId);
    if (!labResult) {
      return res.status(404).json({ msg: "Lab request subdocument not found" });
    }

    // Update fields
    labResult.result = result;
    labResult.unit = unit || "";
    labResult.status = "completed";
    labResult.resultDate = date ? new Date(date) : new Date();
    labResult.date = labResult.resultDate; // For backward compatibility with existing views

    await patient.save();

    res.status(200).json({ msg: "Lab test completed successfully", labResult });
  } catch (error) {
    console.error("Error fulfilling lab request:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// ____________________________? 
// Laboratory: Get all completed lab results across patients
// ____________________________?//
const getAllCompletedLabResults = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role === "patient") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const {
      test,
      doctorId,
      doctorName,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const patients = await Patient.find(
      { "labResults.0": { $exists: true } },
      "username age gender email labResults"
    ).lean();

    let completed = [];

    patients.forEach((patient) => {
      (patient.labResults || []).forEach((lab) => {
        if (!lab) return;
        let isCompleted = lab.status === "completed";
        if (!lab.status) {
          isCompleted = lab.result && lab.result !== "Pending";
        }
        if (isCompleted) {
          const dateStr = lab.resultDate || lab.date;
          const date = dateStr ? new Date(dateStr) : null;
          completed.push({
            patientEmail: patient.email,
            testName: lab.testName,
            result: lab.result,
            unit: lab.unit,
            date,
            doctorId: lab.doctor ? String(lab.doctor) : undefined,
            doctorName: lab.doctorName || undefined,
          });
        }
      });
    });

    completed.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

    if (test) {
      const t = String(test).toLowerCase();
      completed = completed.filter((r) => (r.testName || "").toLowerCase().includes(t));
    }
    if (doctorId) {
      completed = completed.filter((r) => r.doctorId === String(doctorId));
    }
    if (doctorName) {
      const dn = String(doctorName).toLowerCase();
      completed = completed.filter((r) => (r.doctorName || "").toLowerCase().includes(dn));
    }
    if (start) {
      completed = completed.filter((r) => r.date && r.date >= start);
    }
    if (end) {
      completed = completed.filter((r) => r.date && r.date <= end);
    }

    const total = completed.length;
    const pages = Math.ceil(total / Number(limit));
    const startIdx = (Number(page) - 1) * Number(limit);
    const data = completed.slice(startIdx, startIdx + Number(limit));

    return res.status(200).json({ data, total, page: Number(page), pages });
  } catch (error) {
    console.error("Error fetching completed lab results:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};


// ____________________________? 
// Doctor: Fetch lab updates since timestamp
// ____________________________?//
const getDoctorLabUpdates = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== "doctor") {
      return res.status(403).json({ msg: "Access denied. Doctors only." });
    }
    const sinceParam = req.query.since;
    const since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const patients = await Patient.find(
      { labResults: { $elemMatch: { doctor: currentUser._id, status: "completed", resultDate: { $gt: since } } } },
      "username email labResults"
    ).lean();
    const updates = [];
    patients.forEach((patient) => {
      (patient.labResults || []).forEach((lab) => {
        if (
          lab &&
          lab.doctor &&
          lab.status === "completed" &&
          lab.resultDate &&
          new Date(lab.resultDate) > since &&
          String(lab.doctor) === String(currentUser._id)
        ) {
          updates.push({
            id: lab._id ? lab._id.toString() : undefined,
            patientName: patient.username,
            patientEmail: patient.email,
            testName: lab.testName,
            result: lab.result,
            unit: lab.unit,
            resultDate: lab.resultDate,
          });
        }
      });
    });
    updates.sort((a, b) => new Date(a.resultDate) - new Date(b.resultDate));
    res.status(200).json(updates);
  } catch (error) {
    console.error("Error fetching doctor lab updates:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};


// ____________________________? 
// Delete Patient (Admin)
// ____________________________?//
const deletePatient = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ msg: "Admins only" });
    }

    const patientId = req.params.id;
    await Patient.findByIdAndDelete(patientId);
    res.status(200).json({ msg: "Patient deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ____________________________? 
// Update Patient (Admin)
// ____________________________?//
const updatePatient = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ msg: "Admins only" });
    }

    const patientId = req.params.id;
    const updateData = req.body;
    if (updateData.password) delete updateData.password;

    const updatedPatient = await Patient.findByIdAndUpdate(patientId, updateData, { new: true }).select("-password");
    res.status(200).json(updatedPatient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ____________________________? 
// Delete Doctor (Admin)
// ____________________________?//
const deleteDoctor = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ msg: "Admins only" });
    }

    const doctorId = req.params.id;
    await Doctor.findByIdAndDelete(doctorId);
    res.status(200).json({ msg: "Doctor deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ____________________________? 
// Update Doctor (Admin)
// ____________________________?//
const updateDoctor = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ msg: "Admins only" });
    }

    const doctorId = req.params.id;
    const updateData = req.body;
    if (updateData.password) delete updateData.password;

    const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updateData, { new: true }).select("-password");
    res.status(200).json(updatedDoctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ____________________________? 
// Approve Doctor (Admin)
// ____________________________?//
const approveDoctor = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ msg: "Admins only" });
    }

    const doctorId = req.params.id;
    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { isApproved: true, approvalStatus: "approved" },
      { new: true }
    ).select("-password");

    if (!doctor) {
      return res.status(404).json({ msg: "Doctor not found" });
    }



    res.status(200).json({ msg: "Doctor approved successfully", doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ____________________________? 
// Reject Doctor (Admin)
// ____________________________?//
const rejectDoctor = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ msg: "Admins only" });
    }

    const doctorId = req.params.id;
    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { isApproved: false, approvalStatus: "rejected" },
      { new: true }
    ).select("-password");

    if (!doctor) {
      return res.status(404).json({ msg: "Doctor not found" });
    }



    res.status(200).json({ msg: "Doctor rejected successfully", doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export {
  home,
  registration,
  login,
  getUsers,
  deleteUser,
  updateUser,
  getDoctors,
  getPatients,
  deletePatient,
  updatePatient,
  deleteDoctor,
  updateDoctor,
  getDoctorsAdmin,
  approveDoctor,
  rejectDoctor,
  getLaboratorySummary,
  addLabResult,
  getLabResultsByEmail,
  orderLabTest,
  getPendingLabTests,
  fulfillLabRequest,
  getAllCompletedLabResults,
  getDoctorLabUpdates,
};
