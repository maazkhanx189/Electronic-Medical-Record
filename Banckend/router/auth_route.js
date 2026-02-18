import express from 'express'
import { getUsers, home, login, registration, deleteUser, updateUser, getDoctors, getPatients, deletePatient, updatePatient, deleteDoctor, updateDoctor, getDoctorsAdmin, approveDoctor, rejectDoctor, getLaboratorySummary, addLabResult, getLabResultsByEmail, orderLabTest, getPendingLabTests, fulfillLabRequest, getAllCompletedLabResults, getDoctorLabUpdates } from '../controllers/auth_controllers.js';
import { patientRegistration, patientLogin } from '../controllers/patient_controller.js';
import { doctorRegistration, doctorLogin } from '../controllers/doctor_controller.js';
import { receptionistRegistration, receptionistLogin } from '../controllers/receptionist_controller.js';
import validator from '../middlewares/validate-middleware.js';
import upload from '../middlewares/upload.js';
import User from '../validator/auth_validator.js';
import { Login, Patient, Doctor, Receptionist } from '../validator/auth_validator.js';
import { isAdmin, protect, isAdminOrDoctor } from '../middlewares/auth.js';

const app = express.Router()
// user routes
app.route('/').get(home)
app.route('/registration').post(upload.none(), validator(User), registration);
app.route("/login").post(validator(Login), login);

// Patient routes
app.route('/registration/patient').post(upload.none(), validator(Patient), patientRegistration);
app.route('/login/patient').post(validator(Login), patientLogin);

// Doctor routes
app.route('/registration/doctor').post(upload.single('profilePicture'), validator(Doctor), doctorRegistration);
app.route('/login/doctor').post(validator(Login), doctorLogin);

// Receptionist routes
app.route('/registration/receptionist').post(upload.none(), validator(Receptionist), receptionistRegistration);
app.route('/login/receptionist').post(validator(Login), receptionistLogin);

// Admin only routes
app.route("/users").get(protect, isAdmin, getUsers);
app.route("/users/:id").delete(protect, isAdmin, deleteUser).put(protect, isAdmin, updateUser);
// Manage patients
app.route("/patients").get(protect, isAdminOrDoctor, getPatients);
app.route("/patients/:id").delete(protect, isAdmin, deletePatient).put(protect, isAdmin, updatePatient);
// Manage doctors (admin)
app.route("/doctors/manage").get(protect, isAdmin, getDoctorsAdmin);
app.route("/doctors/:id").delete(protect, isAdmin, deleteDoctor).put(protect, isAdmin, updateDoctor);
// Doctor approval routes
app.route("/doctors/:id/approve").post(protect, isAdmin, approveDoctor);
app.route("/doctors/:id/reject").post(protect, isAdmin, rejectDoctor);
app.route("/profile").get(protect, (req, res) => {
  res.status(200).json(req.user);
});

// Laboratory dashboard summary
app.route("/laboratory/summary").get(protect, getLaboratorySummary);

// Laboratory results upload and view
app
  .route("/laboratory/results")
  .post(protect, upload.single('attachment'), addLabResult)
  .get(protect, getLabResultsByEmail);

// Laboratory pending requests
app.route("/laboratory/pending").get(protect, getPendingLabTests);
app.route("/laboratory/fulfill").post(protect, fulfillLabRequest);
// Laboratory: list all completed results
app.route("/laboratory/completed").get(protect, getAllCompletedLabResults);

// Doctor: Order lab test
app.route("/doctor/lab-order").post(protect, orderLabTest);
app.route("/doctor/lab-updates").get(protect, getDoctorLabUpdates);

// Public route to get all doctors
app.route("/doctors").get(getDoctors);

export default app;

