import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import LoginForm from "./pages/LoginForm";
import Registration from "./pages/Registration";
import UserDashboard from "./pages/UserDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import LaboratoryResultsDashboard from "./pages/LaboratoryResultsDashboard";
import LaboratoryDashboard from "./pages/LaboratoryDashboard";
import DoctorPatientApproval from "./pages/DoctorPatientApproval";
import DoctorApprovedApproval from "./pages/DoctorApprovedApproval";
import DoctorCancelledApproval from "./pages/DoctorCancelledApproval";
import AdminDashboard from "./pages/AdminDashboard";
import EMRDashboard from "./pages/EMRDashboard";
import BookAppointments from "./pages/BookAppointments";
import MyAppointments from "./pages/MyAppointments";
import Consultations from "./pages/Consultations";
import MedicalRecords from "./pages/MedicalRecords";
import Profile from "./pages/Profile";
import MedicalRecordPrint from "./pages/MedicalRecordPrint";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import ReceptionistRegistration from "./pages/ReceptionistRegistration";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={true} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/registration-receptionist" element={<ReceptionistRegistration />} />

        {/* Protected Routes */}
        <Route
          path="/user"
          element={<ProtectedRoute element={<UserDashboard />} />}
        />
        <Route
          path="/laboratory-dashboard"
          element={<ProtectedRoute element={<LaboratoryDashboard />} requiredRole="user" />}
        />
        <Route
          path="/patient"
          element={<ProtectedRoute element={<PatientDashboard />} requiredRole="patient" />}
        />
        <Route
          path="/patient-dashboard"
          element={<ProtectedRoute element={<PatientDashboard />} requiredRole="patient" />}
        />
        <Route
          path="/doctor"
          element={<ProtectedRoute element={<DoctorDashboard />} requiredRole="doctor" />}
        />
        <Route
          path="/doctor-dashboard"
          element={<ProtectedRoute element={<DoctorDashboard />} requiredRole="doctor" />}
        />
        <Route
          path="/laboratory-results"
          element={<ProtectedRoute element={<LaboratoryResultsDashboard />} requiredRole="doctor" />}
        />
        <Route
          path="/doctor/patient-approval"
          element={<ProtectedRoute element={<DoctorPatientApproval />} requiredRole="doctor" />}
        />
        <Route
          path="/doctor/approved-approval"
          element={<ProtectedRoute element={<DoctorApprovedApproval />} requiredRole="doctor" />}
        />
        <Route
          path="/doctor/cancelled-approval"
          element={<ProtectedRoute element={<DoctorCancelledApproval />} requiredRole="doctor" />}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />}
        />
        <Route
          path="/emr"
          element={<ProtectedRoute element={<EMRDashboard />} />}
        />
        <Route
          path="/book-appointments"
          element={<ProtectedRoute element={<BookAppointments />} />}
        />
        <Route
          path="/my-appointments"
          element={<ProtectedRoute element={<MyAppointments />} />}
        />
        <Route
          path="/consultations"
          element={<ProtectedRoute element={<Consultations />} />}
        />
        <Route
          path="/medical-records"
          element={<ProtectedRoute element={<MedicalRecords />} />}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute element={<Profile />} />}
        />
        <Route
          path="/receptionist-dashboard"
          element={<ProtectedRoute element={<ReceptionistDashboard />} requiredRole="receptionist" />}
        />
        <Route
          path="/print-record"
          element={<MedicalRecordPrint />}
        />
      </Routes>
    </>
  );
}

export default App;
