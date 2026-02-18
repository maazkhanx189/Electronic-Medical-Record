import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar, Users, Clock, Activity, Search, X,
  FileText, Plus, AlertCircle, ChevronRight,
  Stethoscope, Pill, FlaskConical, Microscope,
  LayoutDashboard, UserCheck, UserX, LogOut, ArrowRight, FileDown, Edit, User, Save, History, Bell, RefreshCw, Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import VisitForm from "../components/VisitForm";

// Custom Dashboard Sidebar
const DashboardSidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen }) => {
  const filters = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "approved", label: "Approved Patients", icon: UserCheck },
    { id: "pending", label: "Pending Patients", icon: Clock },
    { id: "cancelled", label: "Cancelled Patients", icon: UserX },
    { id: "medical-records", label: "Medical Records", icon: FileText },
    { id: "lab-results", label: "Lab Results", icon: FlaskConical },
    { id: "full-history", label: "View Full History", icon: History },
    { id: "profile", label: "My Profile", icon: User },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />
      <aside className={`w-64 bg-slate-900 border-r border-slate-800 h-[calc(100vh-80px)] top-[80px] flex flex-col fixed left-0 z-50 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800 md:hidden">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-lg">
              <Activity className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Doctor<span className="font-light text-slate-500">Panel</span>
            </span>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <div className="text-xs font-bold text-slate-500 px-4 mb-2 uppercase tracking-wider">Main Menu</div>
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => { setActiveTab(filter.id); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === filter.id
                ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
            >
              <filter.icon size={18} />
              {filter.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // overview, approved, pending, cancelled
  const [stats, setStats] = useState({ todayAppointments: 0, totalPatients: 0, pendingRequests: 0 });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Patient Management State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [activePatientTab, setActivePatientTab] = useState("consultation");

  // Mini Profile State
  const [isMiniProfileOpen, setIsMiniProfileOpen] = useState(false);
  const [miniProfilePatient, setMiniProfilePatient] = useState(null);

  // Forms State
  const [consultationForm, setConsultationForm] = useState({ diagnosis: "", notes: "" });
  const [labForm, setLabForm] = useState({ testName: "", notes: "" });
  const [medForm, setMedForm] = useState({ name: "", dosageAmount: "", dosageUnit: "mg", frequency: "Once daily", startDate: "", endDate: "", notes: "" });
  const [patientMedications, setPatientMedications] = useState([]);
  const [patientVisits, setPatientVisits] = useState([]);
  const [patientModalVisits, setPatientModalVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [newHistoryItem, setNewHistoryItem] = useState("");

  // Problem List State
  const [patientProblems, setPatientProblems] = useState([]);
  const [problemForm, setProblemForm] = useState({ symptoms: "", diagnosis: "", treatment: "" });
  const [problemSortOrder, setProblemSortOrder] = useState("newest"); // newest, oldest

  // Visit State
  const [visitForm, setVisitForm] = useState({ date: "", notes: "", progressNotes: "", visitSummary: "", recommendations: "" });
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);

  // State for Doctor's own profile update
  const [doctorProfileForm, setDoctorProfileForm] = useState({
    username: "",
    specialization: "",
    phone: "",
    address: ""
  });

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastLabCheckAt, setLastLabCheckAt] = useState(new Date().toISOString());
  const [notifiedLabIds, setNotifiedLabIds] = useState(new Set());
  const [allLabResults, setAllLabResults] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Add notification function
  const addNotification = (message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  const fetchLabUpdates = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const since = encodeURIComponent(lastLabCheckAt);
      const res = await fetch(`http://localhost:5000/api/auth/doctor/lab-updates?since=${since}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const updates = await res.json();

      const newUpdates = updates.filter(u => !notifiedLabIds.has(u.id));

      if (newUpdates.length > 0) {
        // Option A: Single aggregate toast for multiple results
        if (newUpdates.length > 1) {
          toast.info(`New lab results are available for ${newUpdates.length} patients.`);
        } else {
          const u = newUpdates[0];
          toast.info(`Lab result ready: ${u.patientName} • ${u.testName}`);
        }

        newUpdates.forEach(u => {
          addNotification(`Lab result ready for ${u.patientName}: ${u.testName} (${u.result} ${u.unit || ""})`, 'info');
          setNotifiedLabIds(prev => new Set([...prev, u.id]));
        });
      }

      setLastLabCheckAt(new Date().toISOString());

      // Also refresh all labs if currently in lab-results tab
      if (activeTab === "lab-results") {
        fetchAllCompletedLabs();
      }
    } catch { }
  }, [lastLabCheckAt, notifiedLabIds, activeTab]);

  useEffect(() => {
    fetchLabUpdates();
    const id = setInterval(fetchLabUpdates, 30000);
    return () => clearInterval(id);
  }, [fetchLabUpdates]);

  // Dummy doctorInfo for profile page, replace with actual fetched data
  const [doctorInfo, setDoctorInfo] = useState({
    username: "Dr. John Doe",
    email: "john.doe@example.com",
    specialization: "General Practitioner",
    phone: "123-456-7890",
    address: "123 Medical Center Dr."
  });

  // Full History State
  const [allPatients, setAllPatients] = useState([]);
  const [selectedHistoryPatient, setSelectedHistoryPatient] = useState(null);
  const [patientHistoryDetails, setPatientHistoryDetails] = useState(null);
  const [patientHistoryProblems, setPatientHistoryProblems] = useState([]);
  const [patientHistoryMedications, setPatientHistoryMedications] = useState([]);
  const [patientHistoryVisits, setPatientHistoryVisits] = useState([]);
  const [selectedDateGroup, setSelectedDateGroup] = useState(null);

  // Group patient history by date for a unified timeline
  const getGroupedHistory = () => {
    const grouped = {};

    const addEntry = (date, type, data) => {
      if (!date) return;
      const dateKey = new Date(date).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = { visits: [], consultations: [], problems: [], medications: [], labs: [] };
      }
      grouped[dateKey][type].push(data);
    };

    patientHistoryVisits.forEach(v => addEntry(v.date, 'visits', v));
    patientHistoryDetails?.consultations?.forEach(c => addEntry(c.date, 'consultations', c));
    patientHistoryProblems.forEach(p => addEntry(p.createdAt, 'problems', p));
    patientHistoryMedications.forEach(m => addEntry(m.startDate, 'medications', m));
    patientHistoryDetails?.labResults?.forEach(l => addEntry(l.date, 'labs', l));

    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(date => ({ date, ...grouped[date] }));
  };


  useEffect(() => {
    if (doctorInfo) {
      setDoctorProfileForm({
        username: doctorInfo.username || "",
        specialization: doctorInfo.specialization || "",
        phone: doctorInfo.phone || "N/A",
        address: doctorInfo.address || "123 Medical Center Dr."
      });
    }
  }, [doctorInfo]);

  const handleDoctorProfileChange = (e) => {
    setDoctorProfileForm({ ...doctorProfileForm, [e.target.name]: e.target.value });
  };

  const handleUpdateDoctorProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/doctor/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(doctorProfileForm)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile updated successfully");
        // Update local doctorInfo if needed
        setDoctorInfo(prev => ({ ...prev, ...doctorProfileForm }));
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userID");
      if (!token || !userId) { navigate("/login"); return; }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Appointments
      const aptRes = await fetch(`http://localhost:5000/api/appointments/doctor/${userId}`, { headers });
      const aptData = await aptRes.json();

      // Fetch Doctor's Patient List for total count
      const patRes = await fetch(`http://localhost:5000/api/doctor/my-patients`, { headers });
      const patData = await patRes.json();

      // Fetch Doctor's own profile info
      const doctorRes = await fetch(`http://localhost:5000/api/doctor/profile/${userId}`, { headers });
      const doctorData = await doctorRes.json();
      if (doctorRes.ok) {
        setDoctorInfo(doctorData);
      }

      if (aptRes.ok) {
        setAppointments(aptData);
        const today = new Date().toISOString().split('T')[0];
        setStats({
          todayAppointments: aptData.filter(a => a.date.startsWith(today) && a.status !== 'cancelled').length,
          pendingRequests: aptData.filter(a => a.status === 'pending').length,
          totalPatients: patData.data?.length || 0
        });
        setAllPatients(patData.data || []);
      }
    } catch (error) {
      console.error("Error:", error);
      // toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Filter Logic
  const getFilteredAppointments = () => {
    return appointments.filter(app => {
      // Safety check for patient
      if (!app.patient) return false;

      // Search Filter
      const matchesSearch = (app.patient.username || "Patient").toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Tab Filter based on STATUS
      if (activeTab === "overview") return false; // Overview has its own view
      if (activeTab === "pending") return app.status === "pending";
      if (activeTab === "approved") return app.status === "confirmed";
      if (activeTab === "cancelled") return app.status === "cancelled";

      return false;
    });
  };

  const fetchAllCompletedLabs = async () => {
    try {
      const token = localStorage.getItem("token");
      // This endpoint should return all lab results for patients assigned to this doctor
      // Reusing the logic from the dashboard, but specialized for the history list
      const res = await fetch(`http://localhost:5000/api/auth/doctor/lab-updates?since=2000-01-01`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const labs = await res.json();
        setAllLabResults(labs.sort((a, b) => new Date(b.resultDate) - new Date(a.resultDate)));
      }
    } catch (err) {
      console.error("Failed to fetch lab results:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "lab-results") {
      fetchAllCompletedLabs();
    }
  }, [activeTab]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast.success(`Appointment ${newStatus}`);
        fetchData();
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/doctor/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPatientDetails(data.patient);
        setSelectedPatient(data.patient);
        fetchPatientProblems(patientId);
        fetchPatientMedications(patientId);
        fetchPatientModalVisits(patientId);
        setIsPatientModalOpen(true);
      }
    } catch (error) {
      toast.error("Error fetching patient details");
    }
  };

  const fetchPatientProblems = async (patientId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/doctor/problems/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPatientProblems(data);
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
    }
  };

  const handleAddProblem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/doctor/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: selectedPatient._id,
          ...problemForm
        })
      });
      if (res.ok) {
        toast.success("Problem added to list");
        setProblemForm({ symptoms: "", diagnosis: "", treatment: "" });
        fetchPatientProblems(selectedPatient._id);
      } else {
        toast.error("Failed to add problem");
      }
    } catch (error) {
      toast.error("Error adding problem");
    }
  };

  const handleResolveProblem = async (problemId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/doctor/problems/${problemId}/resolve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Problem resolved");
        fetchPatientProblems(selectedPatient._id);
      }
    } catch (error) {
      toast.error("Failed to resolve problem");
    }
  };

  // --- FORM HANDLERS ---

  const handleAddConsultation = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/doctor/add-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: selectedPatient._id,
          ...consultationForm
        })
      });
      if (res.ok) {
        toast.success("Consultation added");
        setConsultationForm({ diagnosis: "", notes: "" });
        fetchPatientDetails(selectedPatient._id);
      } else {
        toast.error("Failed to add consultation");
      }
    } catch (error) {
      toast.error("Failed to add consultation");
    }
  };

  const handleUpdateHistory = async () => {
    if (!newHistoryItem) return;
    try {
      const token = localStorage.getItem("token");
      const updatedHistory = [...(patientDetails.medicalHistory || []), newHistoryItem];

      const res = await fetch("http://localhost:5000/api/doctor/update-medical-history", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patientId: selectedPatient._id, medicalHistory: updatedHistory })
      });

      if (res.ok) {
        toast.success("Medical History updated");
        setNewHistoryItem("");
        fetchPatientDetails(selectedPatient._id);
      }
    } catch (error) {
      toast.error("Failed to update history");
    }
  };

  const handleOrderLabTest = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/auth/doctor/lab-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientEmail: selectedPatient.email,
          testName: labForm.testName,
          notes: labForm.notes
        })
      });

      if (res.ok) {
        toast.success("Lab test ordered successfully");
        setLabForm({ testName: "", notes: "" });
        fetchPatientDetails(selectedPatient._id);
      } else {
        const data = await res.json();
        toast.error(data.msg || "Failed to order lab test");
      }
    } catch (error) {
      toast.error("Failed to order lab test");
    }
  };

  const fetchPatientMedications = async (patientId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/doctor/medications/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPatientMedications(data);
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
    }
  };

  const fetchPatientModalVisits = async (patientId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/visits/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPatientModalVisits(data);
      }
    } catch (error) {
      console.error("Error fetching visits:", error);
    }
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/doctor/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patientId: selectedPatient._id, ...medForm })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.allergyWarning) {
          toast.warning(data.allergyWarning, { autoClose: 10000 });
        } else {
          toast.success("Medication prescribed successfully");
        }
        setMedForm({ name: "", dosageAmount: "", dosageUnit: "mg", frequency: "Once daily", startDate: "", endDate: "", notes: "" });
        fetchPatientMedications(selectedPatient._id);
      } else {
        toast.error(data.error || "Failed to prescribe medication");
      }
    } catch (error) {
      toast.error("Error prescribing medication");
    }
  };

  const handleUpdateMedicationStatus = async (medicationId, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/doctor/medications/${medicationId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Medication marked as ${status}`);
        fetchPatientMedications(selectedPatient._id);
      }
    } catch (error) {
      toast.error("Failed to update medication status");
    }
  };

  const handleSelectHistoryPatient = async (patient) => {
    setSelectedHistoryPatient(patient);
    console.log("Selected patient:", patient);
    console.log("Patient ID:", patient._id);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      console.log("Fetching patient details from:", `http://localhost:5000/api/doctor/patient/${patient._id}`);
      const res = await fetch(`http://localhost:5000/api/doctor/patient/${patient._id}`, { headers });
      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);
      if (res.ok) {
        setPatientHistoryDetails(data.patient);
        fetchPatientHistoryProblems(patient._id);
        fetchPatientHistoryMedications(patient._id);
        fetchPatientHistoryVisits(patient._id);
      } else {
        toast.error(data.error || "Failed to fetch patient details");
      }
    } catch (error) {
      console.error("Error fetching patient history:", error);
      toast.error("Error fetching patient history");
    }
  };

  const fetchPatientHistoryProblems = async (patientId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/doctor/problems/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPatientHistoryProblems(data);
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
    }
  };

  const fetchPatientHistoryMedications = async (patientId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/doctor/medications/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPatientHistoryMedications(data);
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
    }
  };

  const fetchPatientHistoryVisits = async (patientId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/visits/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPatientHistoryVisits(data);
      }
    } catch (error) {
      console.error("Error fetching visits:", error);
    }
  };

  // Handle Download Medical Record -> Open Print Window
  const handleDownloadRecord = () => {
    if (!patientDetails) return;

    // Enrich with doctor info if available in context, otherwise defaults
    const recordData = {
      ...patientDetails,
      doctorName: doctorInfo?.username || "Doctor",
    }

    const json = JSON.stringify(recordData);
    const win = window.open(`/print-record?data=${encodeURIComponent(json)}`, "_blank", "width=1000,height=900");
    if (win) {
      win.focus();
    } else {
      toast.error("Please allow popups for this website");
    }
  };

  const handleOpenMiniProfile = (patient) => {
    setMiniProfilePatient(patient);
    setPatientEditForm({
      username: patient.username || "",
      age: patient.age || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      address: patient.address || ""
    });
    setIsMiniProfileOpen(true);
  };

  // State for editing patient details in the modal
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [patientEditForm, setPatientEditForm] = useState({
    username: "",
    age: "",
    gender: "",
    phone: "",
    address: ""
  });

  // State for expanded consultation in modal
  const [expandedModalConsultationId, setExpandedModalConsultationId] = useState(null);

  const handlePatientUpdateChange = (e) => {
    setPatientEditForm({ ...patientEditForm, [e.target.name]: e.target.value });
  };

  const handleUpdatePatientDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/doctor/update-patient-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: miniProfilePatient._id,
          ...patientEditForm
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Patient details updated successfully");
        setMiniProfilePatient({ ...miniProfilePatient, ...patientEditForm }); // Update local view
        setIsEditingPatient(false);
        fetchData(); // Refresh main lists
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (error) {
      toast.error("Failed to update details");
    }
  };

  // --- RENDER ---

  const filteredList = getFilteredAppointments();

  return (
    <div className="flex bg-slate-950 min-h-screen font-sans text-slate-200 pt-[80px]">
      {/* Custom Sidebar */}
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full transition-all">
        {/* Top Bar */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 md:hidden hover:bg-slate-800"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2 capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
              <p className="text-slate-400 text-sm md:text-base">Welcome, Doctor.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => setShowNotifications(true)}>
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-2xl text-slate-400 group-hover:bg-slate-800 transition-all">
                <Bell size={24} />
              </div>
              {(stats.pendingRequests > 0 || notifications.filter(n => !n.read).length > 0) && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-950 animate-bounce">
                  {stats.pendingRequests + notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Pending Appointment Alert */}
        <AnimatePresence>
          {stats.pendingRequests > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md relative group">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Clock size={80} className="text-orange-500" />
                </div>

                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/40 animate-pulse">
                    <AlertCircle size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">New Appointment Requests</h3>
                    <p className="text-orange-200/80">
                      You have <span className="text-white font-bold underline decoration-orange-500 decoration-2 underline-offset-4">{stats.pendingRequests}</span> new {stats.pendingRequests === 1 ? 'patient booking' : 'patient bookings'} awaiting your confirmation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <button
                    onClick={() => setActiveTab('pending')}
                    className="bg-white text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-xl font-bold transition-all shadow-xl flex items-center gap-2 group/btn"
                  >
                    View Requests
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {activeTab === "overview" ? (
          <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Today's Appointments" value={stats.todayAppointments} icon={Calendar} color="blue" />
              <StatCard label="Total Patients" value={stats.totalPatients} icon={Users} color="green" />
              <StatCard label="Pending Requests" value={stats.pendingRequests} icon={Clock} color="orange" />
            </div>

            {/* Today's Schedule */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Today's Schedule</h3>
              <div className="space-y-4">
                {appointments.filter(a => a.date.startsWith(new Date().toISOString().split('T')[0]) && a.status !== 'cancelled').map(app => (
                  <div key={app._id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-4">
                      <div className="text-blue-400 font-bold">{app.time}</div>
                      <div>
                        <div className="font-bold text-white">{app.patient?.username || "Unknown"}</div>
                        <div className="text-sm text-slate-400">{app.reason}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded border capitalize ${app.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      app.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'text-slate-400 border-slate-700'
                      }`}>{app.status}</span>
                  </div>
                ))}
                {appointments.filter(a => a.date.startsWith(new Date().toISOString().split('T')[0]) && a.status !== 'cancelled').length === 0 && (
                  <p className="text-slate-500 italic">No appointments for today.</p>
                )}
              </div>
            </div>

          </div>
        ) : activeTab === "medical-records" ? (
          <div className="space-y-6">
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search patient records..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-700 text-sm uppercase tracking-wider">
                    <th className="p-6 font-semibold">Username</th>
                    <th className="p-6 font-semibold">Email</th>
                    <th className="p-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[...new Map(appointments.filter(a => a.status === 'confirmed').map(item => [item.patient?._id, item])).values()]
                    .filter(app => (app.patient?.username || "").toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((app, i) => (
                      <tr key={app._id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold border border-slate-700">
                              {app.patient?.username?.charAt(0)}
                            </div>
                            <span className="text-white font-bold text-lg">{app.patient?.username}</span>
                          </div>
                        </td>
                        <td className="p-6 text-slate-400">{app.patient?.email}</td>
                        <td className="p-6 text-right">
                          <button
                            onClick={() => handleOpenMiniProfile(app.patient)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 ml-auto"
                          >
                            <User size={18} /> View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  {appointments.filter(a => a.status === 'confirmed').length === 0 && (
                    <tr key="no-records">
                      <td colSpan="3" className="p-8 text-center text-slate-500 italic">
                        No confirmed patients found for records.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "lab-results" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <FlaskConical className="text-blue-400" size={28} /> Lab Reports History
              </h2>
              <button
                onClick={fetchAllCompletedLabs}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all"
                title="Refresh Results"
              >
                <RefreshCw size={20} />
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-700 text-xs uppercase tracking-widest">
                      <th className="p-6 font-bold">Patient</th>
                      <th className="p-6 font-bold">Test Name</th>
                      <th className="p-6 font-bold">Result</th>
                      <th className="p-6 font-bold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {allLabResults.length > 0 ? (
                      allLabResults.map((lab, i) => (
                        <tr key={i} className="hover:bg-slate-800/40 transition-colors group">
                          <td className="p-6 font-bold text-white">{lab.patientEmail}</td>
                          <td className="p-6 text-blue-400 font-medium">{lab.testName}</td>
                          <td className="p-6">
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg font-bold border border-blue-500/20">
                              {lab.result} {lab.unit}
                            </span>
                          </td>
                          <td className="p-6 text-slate-500 text-sm">
                            {lab.resultDate ? new Date(lab.resultDate).toLocaleDateString() : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-20 text-center text-slate-500 italic">
                          <FlaskConical size={48} className="mx-auto mb-4 opacity-20" />
                          No laboratory results found for your patients.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "profile" ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-4xl font-bold text-blue-500 border-4 border-slate-700 shadow-xl">
                  {doctorInfo?.username?.charAt(0) || "D"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{doctorInfo?.username}</h2>
                  <p className="text-slate-400">{doctorInfo?.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full uppercase tracking-wider border border-green-500/20">
                    Approved Doctor
                  </span>
                </div>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); handleUpdateDoctorProfile(); }}>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase">Full Name</label>
                  <input name="username" type="text" value={doctorProfileForm.username} onChange={handleDoctorProfileChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase">Specialization</label>
                  <input name="specialization" type="text" value={doctorProfileForm.specialization} onChange={handleDoctorProfileChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase">Email Address</label>
                  <input type="email" defaultValue={doctorInfo?.email} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none transition-colors" disabled title="Contact admin to change email" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase">Phone Number</label>
                  <input name="phone" type="tel" value={doctorProfileForm.phone} onChange={handleDoctorProfileChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none transition-colors" />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase">Clinic Address</label>
                  <textarea name="address" rows="3" value={doctorProfileForm.address} onChange={handleDoctorProfileChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none transition-colors resize-none" />
                </div>

                <div className="col-span-1 md:col-span-2 pt-6 border-t border-slate-800 flex justify-end">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                    <Save size={20} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : activeTab === "full-history" ? (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {selectedHistoryPatient ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">Patient History: {selectedHistoryPatient.username}</h3>
                  <button
                    onClick={() => setSelectedHistoryPatient(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Back to List
                  </button>
                </div>

                {/* Patient Details */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4">Patient Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 text-sm">Name:</span>
                      <p className="text-white">{patientHistoryDetails?.username}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm">Email:</span>
                      <p className="text-white">{patientHistoryDetails?.email}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm">Age:</span>
                      <p className="text-white">{patientHistoryDetails?.age || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm">Gender:</span>
                      <p className="text-white">{patientHistoryDetails?.gender || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Unified Medical History Timeline */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <History className="text-blue-400" /> Patient Health Timeline
                  </h4>

                  <div className="space-y-4">
                    {getGroupedHistory().length > 0 ? (
                      getGroupedHistory().map((group, index) => (
                        <div key={group.date} className="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                          <button
                            onClick={() => setSelectedDateGroup(group)}
                            className="w-full flex justify-between items-center p-4 transition-all duration-200 bg-slate-800/20 hover:bg-slate-800/40 group/date"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 rounded-lg bg-slate-700 text-slate-400 group-hover/date:bg-blue-600 group-hover/date:text-white transition-all">
                                <Calendar size={20} />
                              </div>
                              <div className="text-left">
                                <span className="block font-bold text-white text-lg">
                                  {new Date(group.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                                <div className="flex gap-3 mt-1">
                                  {group.visits.length > 0 && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-bold uppercase">Visits: {group.visits.length}</span>}
                                  {group.consultations.length > 0 && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase">Consultations: {group.consultations.length}</span>}
                                  {group.problems.length > 0 && <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20 font-bold uppercase">Problems: {group.problems.length}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-blue-400 opacity-0 group-hover/date:opacity-100 transition-all font-medium text-sm">
                              View Details <ArrowRight size={16} />
                            </div>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-slate-800/10 rounded-2xl border border-dashed border-slate-800">
                        <p className="text-slate-500 italic">No medical activity history found for this patient.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Patient Static Medical History (Non-dated items) */}
                {patientHistoryDetails?.medicalHistory?.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h4 className="text-lg font-bold text-white mb-4">Patient Background History</h4>
                    <div className="space-y-2">
                      {patientHistoryDetails.medicalHistory.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 text-slate-300">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {allPatients.filter(p => (p.username || "").toLowerCase().includes(searchTerm.toLowerCase())).map(patient => (
                    <motion.div
                      key={patient._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 group hover:border-blue-500/50 transition-all shadow-lg shadow-black/20 cursor-pointer"
                      onClick={() => handleSelectHistoryPatient(patient)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                          {patient.username?.charAt(0) || "?"}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1">{patient.username}</h3>
                      <p className="text-slate-500 text-sm mb-4">{patient.email}</p>

                      <div className="text-sm text-slate-400">Click to view full history</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            {allPatients.length === 0 && (
              <div className="text-center py-20 text-slate-500">
                <p>No patients found.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search Bar for Lists */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Filtered List Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredList.map(app => (
                  <motion.div
                    key={app._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 group hover:border-blue-500/50 transition-all shadow-lg shadow-black/20"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                        {app.patient?.username?.charAt(0) || "?"}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded border capitalize ${app.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        app.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                        {app.status}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1">{app.patient?.username || "Unknown Patient"}</h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{app.reason}</p>

                    <div className="space-y-2 text-sm text-slate-400 mb-6">
                      <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(app.date).toLocaleDateString()}</div>
                      <div className="flex items-center gap-2"><Clock size={14} /> {app.time}</div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2 text-sm">
                        {/* Action Buttons based on Status */}
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'confirmed')}
                              className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-medium transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'cancelled')}
                              className="px-3 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-slate-700 rounded-lg transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        {app.status === 'confirmed' && (
                          <button
                            onClick={() => {
                              setSelectedPatient(app.patient);
                              fetchPatientDetails(app.patient._id);
                              fetchPatientProblems(app.patient._id);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            View Record <ArrowRight size={16} />
                          </button>
                        )}
                      </div>

                      {/* Medical Record Button */}
                      <button
                        onClick={() => handleOpenMiniProfile(app.patient)}
                        className="w-full py-2 bg-slate-800 hover:bg-blue-500/20 hover:text-blue-400 text-slate-400 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <User size={16} /> Patient Profile
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {filteredList.length === 0 && (
              <div className="text-center py-20 text-slate-500">
                <p>No {activeTab} patients found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DATE DETAILS MODAL (New Small Window for Date-specific History) */}
      <AnimatePresence>
        {selectedDateGroup && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedDateGroup(null)}
          >
            <motion.div
              className="bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[90vh] md:max-h-[85vh] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2 md:p-3 bg-blue-600 rounded-xl md:rounded-2xl shadow-lg shadow-blue-600/20">
                    <Calendar className="text-white w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                      {new Date(selectedDateGroup.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <p className="text-slate-400 text-sm">Patient: {selectedHistoryPatient?.username || selectedPatient?.username || "Patient Record"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDateGroup(null)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
                {/* Visits section */}
                {selectedDateGroup.visits?.length > 0 && (
                  <section>
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Clock size={14} /> Visit Records
                    </h4>
                    <div className="grid gap-4">
                      {selectedDateGroup.visits.map(visit => (
                        <div key={visit._id} className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-white text-lg">{visit.time}</span>
                            <span className="text-xs px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 font-bold uppercase tracking-wider italic">
                              {visit.reason}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed mt-3">{visit.notes}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Consultations section */}
                {selectedDateGroup.consultations?.length > 0 && (
                  <section>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Stethoscope size={14} /> Consultations
                    </h4>
                    <div className="grid gap-4">
                      {selectedDateGroup.consultations.map((con, i) => (
                        <div key={i} className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Diagnosis</span>
                              <p className="text-white font-bold text-xl">{con.diagnosis}</p>
                            </div>
                            <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">Dr. {con.doctor?.username || "You"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Clinical Notes</span>
                            <div className="bg-slate-900/50 p-3 md:p-4 rounded-xl border border-slate-700/30 text-slate-300 text-sm italic leading-relaxed">
                              "{con.notes}"
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Problems section */}
                {selectedDateGroup.problems?.length > 0 && (
                  <section>
                    <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <AlertCircle size={14} /> Problems Added
                    </h4>
                    <div className="grid gap-4">
                      {selectedDateGroup.problems.map(problem => (
                        <div key={problem._id} className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/50">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-white text-lg">{problem.diagnosis}</span>
                            <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase border font-bold tracking-wider ${problem.status === 'active' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                              {problem.status}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm leading-relaxed"><span className="text-slate-500 font-bold mr-2">SYMPTOMS:</span> {problem.symptoms}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Medications section */}
                {selectedDateGroup.medications?.length > 0 && (
                  <section>
                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Pill size={14} /> Prescribed Medications
                    </h4>
                    <div className="grid gap-3">
                      {selectedDateGroup.medications.map(med => (
                        <div key={med._id} className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 flex justify-between items-center group/med">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg group-hover/med:bg-purple-500 group-hover/med:text-white transition-all">
                              <Pill size={18} />
                            </div>
                            <div>
                              <span className="font-bold text-white block">{med.name}</span>
                              <p className="text-slate-500 text-xs font-medium">{med.dosageAmount}{med.dosageUnit} • {med.frequency}</p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-1 rounded border border-slate-700 font-bold uppercase">Today</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Labs section */}
                {selectedDateGroup.labs?.length > 0 && (
                  <section>
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Microscope size={14} /> Lab Results
                    </h4>
                    <div className="grid gap-3">
                      {selectedDateGroup.labs.map((lab, i) => (
                        <div key={i} className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                              <FlaskConical size={18} />
                            </div>
                            <div>
                              <span className="font-bold text-white block">{lab.testName}</span>
                              <p className="text-slate-500 text-xs font-medium">Result: <span className="text-blue-400">{lab.result} {lab.unit}</span></p>
                            </div>
                          </div>
                          <Activity size={16} className="text-slate-600" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-800 bg-slate-800/10 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedDateGroup(null)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MINI PROFILE MODAL */}
      <AnimatePresence>
        {isMiniProfileOpen && miniProfilePatient && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMiniProfileOpen(false)}
          >
            <motion.div
              className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto flex flex-col my-4 md:my-8"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Patient Details & Edit */}
              <div className="p-6 md:p-8 bg-slate-800/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <User size={24} className="text-blue-400" /> Patient Profile
                  </h3>
                  <div className="flex items-center gap-4">
                    {!isEditingPatient ? (
                      <button onClick={() => setIsEditingPatient(true)} className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                        <Edit size={16} /> Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={handleUpdatePatientDetails} className="text-green-400 hover:text-green-300 text-sm font-medium">Save</button>
                        <button onClick={() => setIsEditingPatient(false)} className="text-slate-400 hover:text-white text-sm font-medium">Cancel</button>
                      </div>
                    )}
                    <button onClick={() => setIsMiniProfileOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
                  </div>
                </div>

                <div className="text-center mb-6 md:mb-8">
                  <div className="w-24 h-24 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-4xl font-bold text-blue-400 mb-4 border-4 border-slate-700 shadow-xl">
                    {miniProfilePatient.username?.charAt(0) || "?"}
                  </div>
                  {!isEditingPatient ? (
                    <>
                      <h2 className="text-2xl font-bold text-white">{miniProfilePatient.username}</h2>
                      <p className="text-slate-400">{miniProfilePatient.email}</p>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <input name="username" value={patientEditForm.username} onChange={handlePatientUpdateChange} className="bg-slate-900 border border-slate-700 rounded p-2 text-white w-full text-center" placeholder="Name" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-bold">Age</label>
                        {!isEditingPatient ? (
                          <div className="text-white">{miniProfilePatient.age || "N/A"}</div>
                        ) : (
                          <input name="age" value={patientEditForm.age} onChange={handlePatientUpdateChange} className="bg-slate-800 border border-slate-700 rounded p-1 text-white w-full" />
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-bold">Gender</label>
                        {!isEditingPatient ? (
                          <div className="text-white">{miniProfilePatient.gender || "N/A"}</div>
                        ) : (
                          <select name="gender" value={patientEditForm.gender} onChange={handlePatientUpdateChange} className="bg-slate-800 border border-slate-700 rounded p-1 text-white w-full">
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 uppercase font-bold">Phone Contact</label>
                      {!isEditingPatient ? (
                        <div className="text-white flex items-center gap-2"> <Activity size={14} className="text-green-400" /> {miniProfilePatient.phone || "N/A"}</div>
                      ) : (
                        <input name="phone" value={patientEditForm.phone} onChange={handlePatientUpdateChange} className="bg-slate-800 border border-slate-700 rounded p-1 text-white w-full" />
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase font-bold">Address</label>
                      {!isEditingPatient ? (
                        <div className="text-white flex items-center gap-2"> <Activity size={14} className="text-orange-400" /> {miniProfilePatient.address || "N/A"}</div>
                      ) : (
                        <input name="address" value={patientEditForm.address} onChange={handlePatientUpdateChange} className="bg-slate-800 border border-slate-700 rounded p-1 text-white w-full" />
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setIsMiniProfileOpen(false);
                        setSelectedPatient(miniProfilePatient);
                        fetchPatientDetails(miniProfilePatient._id);
                        fetchPatientProblems(miniProfilePatient._id);
                        fetchPatientMedications(miniProfilePatient._id);
                      }}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                    >
                      <Stethoscope size={20} /> View Full Medical Record
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PATIENT RECORD MODAL */}
      <AnimatePresence>
        {isPatientModalOpen && patientDetails && (
          <motion.div
            className="fixed inset-0 z-50  flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsPatientModalOpen(false)}
          >
            <motion.div
              className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[95vh] md:h-[85vh] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Sidebar */}
              <div className="w-full md:w-64 bg-slate-800/50 border-b md:border-b-0 md:border-r border-slate-700 p-4 md:p-6 flex flex-col gap-4 md:gap-6">
                <div className="text-center md:block hidden">
                  <div className="w-20 h-20 rounded-full bg-slate-700 mx-auto flex items-center justify-center text-3xl font-bold text-blue-400 mb-4">
                    {patientDetails.username.charAt(0)}
                  </div>
                  <h2 className="text-xl font-bold text-white">{patientDetails.username}</h2>
                  <p className="text-slate-400 text-sm">{patientDetails.age} yrs • {patientDetails.gender}</p>
                </div>

                <div className="md:hidden flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold text-blue-400">
                      {patientDetails.username.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white leading-none">{patientDetails.username}</h2>
                      <p className="text-slate-400 text-xs mt-1">{patientDetails.age} yrs • {patientDetails.gender}</p>
                    </div>
                  </div>
                </div>

                <nav className="flex md:flex-col gap-1 md:gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
                  {[
                    { id: "consultation", label: "Consultation", icon: Stethoscope },
                    { id: "problems", label: "Problems", icon: AlertCircle },
                    { id: "history", label: "History", icon: Calendar },
                    { id: "labs", label: "Labs", icon: Microscope },
                    { id: "meds", label: "Meds", icon: Pill },
                    { id: "visits", label: "Visits", icon: Clock },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActivePatientTab(item.id)}
                      className={`flex-shrink-0 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg md:xl transition-all whitespace-nowrap text-sm font-medium ${activePatientTab === item.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                        }`}
                    >
                      <item.icon className="w-4 h-4 md:w-5 md:h-5" /> {item.label}
                    </button>
                  ))}
                </nav>

                <div className="mt-auto md:space-y-3 space-y-0 flex md:flex-col gap-2 md:gap-0">
                  <button onClick={handleDownloadRecord} className="flex-1 flex items-center justify-center gap-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white py-2.5 rounded-xl font-bold transition-all border border-blue-600/30 text-xs md:text-sm">
                    <FileDown size={16} /> <span className="md:inline hidden">Download Record</span><span className="md:hidden inline">Download</span>
                  </button>
                  <button onClick={() => setIsPatientModalOpen(false)} className="px-4 py-2.5 flex items-center justify-center gap-2 text-slate-400 hover:text-white bg-slate-700/50 rounded-xl md:bg-transparent md:rounded-none text-xs md:text-sm">
                    <X size={16} /> <span className="md:inline hidden">Close View</span><span className="md:hidden inline">Close</span>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-900 custom-scrollbar">
                {activePatientTab === "consultation" && (
                  <div className="space-y-8">
                    <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
                      <h3 className="text-lg font-bold text-white mb-4">New Consultation</h3>
                      <form onSubmit={handleAddConsultation} className="space-y-4">
                        <div>
                          <label className="text-sm text-slate-400 block mb-1">Diagnosis</label>
                          <input
                            type="text"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g. Acute Bronchitis"
                            value={consultationForm.diagnosis}
                            onChange={e => setConsultationForm({ ...consultationForm, diagnosis: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-400 block mb-1">Clinical Notes</label>
                          <textarea
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 h-32 resize-none"
                            placeholder="Patient presented with..."
                            value={consultationForm.notes}
                            onChange={e => setConsultationForm({ ...consultationForm, notes: e.target.value })}
                            required
                          />
                        </div>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                          Save Consultation
                        </button>
                      </form>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Past Consultations</h3>
                      <div className="space-y-4">
                        {patientDetails.consultations?.slice().reverse().map((con, i) => (
                          <div key={i} className="border border-slate-700/50 rounded-xl overflow-hidden shadow-sm">
                            <button
                              onClick={() => setExpandedModalConsultationId(expandedModalConsultationId === i ? null : i)}
                              className={`w-full flex justify-between items-center p-4 transition-all duration-200 ${expandedModalConsultationId === i ? 'bg-blue-600/10 border-b border-slate-700/50' : 'bg-slate-800/10 hover:bg-slate-800/30'}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${expandedModalConsultationId === i ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                                  <Calendar size={18} />
                                </div>
                                <div className="text-left">
                                  <span className="block font-bold text-white">{new Date(con.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Attending: Dr. {con.doctor?.username || "You"}</span>
                                </div>
                              </div>
                              <ChevronRight size={20} className={`text-slate-500 transition-transform duration-300 ${expandedModalConsultationId === i ? 'rotate-90 text-blue-400' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {expandedModalConsultationId === i && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-slate-800/20"
                                >
                                  <div className="p-5 space-y-4">
                                    <div>
                                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Diagnosis</span>
                                      <p className="text-lg font-medium text-white">{con.diagnosis}</p>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Clinical Notes</span>
                                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-slate-300 text-sm leading-relaxed">
                                        {con.notes}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                        {(!patientDetails.consultations || patientDetails.consultations.length === 0) && (
                          <p className="text-slate-500 italic">No previous consultations.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activePatientTab === "problems" && (
                  <div className="space-y-8">
                    <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">Add Health Problem</h3>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                          <AlertCircle size={20} />
                        </div>
                      </div>
                      <form onSubmit={handleAddProblem} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-sm text-slate-400 block mb-1">Symptoms reported</label>
                            <input
                              type="text"
                              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                              placeholder="e.g. Chronic cough, chest pain"
                              value={problemForm.symptoms}
                              onChange={e => setProblemForm({ ...problemForm, symptoms: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm text-slate-400 block mb-1">Diagnosis</label>
                            <input
                              type="text"
                              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                              placeholder="Diagnosis"
                              value={problemForm.diagnosis}
                              onChange={e => setProblemForm({ ...problemForm, diagnosis: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm text-slate-400 block mb-1">Treatment/Action</label>
                            <input
                              type="text"
                              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                              placeholder="Action taken"
                              value={problemForm.treatment}
                              onChange={e => setProblemForm({ ...problemForm, treatment: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                          Add Problem to History
                        </button>
                      </form>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white">Patient Health Journey</h3>
                        <button
                          onClick={() => setProblemSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
                          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10 transition-all"
                        >
                          {problemSortOrder === "newest" ? "Newest First" : "Oldest First"}
                          {problemSortOrder === "newest" ? <Clock size={16} /> : <Calendar size={16} />}
                        </button>
                      </div>

                      <div className="relative">
                        <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-800"></div>
                        <div className="space-y-8 relative">
                          {(problemSortOrder === "newest" ? patientProblems : [...patientProblems].reverse()).map((problem) => (
                            <div key={problem._id} className="pl-12 relative group">
                              <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-slate-900 flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${problem.status === 'active' ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-green-500'}`}>
                                {problem.status === 'active' ? <AlertCircle size={16} className="text-white" /> : <CheckCircle size={16} className="text-white" />}
                              </div>
                              <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/40 hover:border-blue-500/30 transition-all shadow-lg backdrop-blur-sm">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{new Date(problem.createdAt).toLocaleString()}</span>
                                    <h4 className="text-xl font-bold text-white mt-1">{problem.diagnosis}</h4>
                                  </div>
                                  <div className={`text-xs px-3 py-1 rounded-full border font-bold uppercase tracking-wider ${problem.status === 'active' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                    {problem.status}
                                  </div>
                                </div>
                                <div className="grid md:grid-cols-3 gap-6 text-sm">
                                  <div className="space-y-1">
                                    <span className="text-slate-500 font-bold uppercase text-[10px]">Symptoms</span>
                                    <p className="text-slate-300 italic">"{problem.symptoms}"</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-slate-500 font-bold uppercase text-[10px]">Plan/Treatment</span>
                                    <p className="text-slate-300">{problem.treatment}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-slate-500 font-bold uppercase text-[10px]">Attending</span>
                                    <p className="text-blue-400 font-medium">Dr. {problem.doctor?.username || "You"}</p>
                                  </div>
                                </div>
                                {problem.status === 'active' && (
                                  <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-end">
                                    <button
                                      onClick={() => handleResolveProblem(problem._id)}
                                      className="text-xs font-bold text-green-400 hover:text-green-300 flex items-center gap-1.5 py-2 px-4 rounded-lg bg-green-500/5 hover:bg-green-500/10 border border-green-500/10 transition-all"
                                    >
                                      <CheckCircle size={14} /> Mark as Resolved
                                    </button>
                                  </div>
                                )}
                                {problem.status === 'resolved' && problem.resolvedAt && (
                                  <div className="mt-4 text-xs text-slate-500 italic flex items-center gap-1">
                                    <CheckCircle size={12} /> Resolved on {new Date(problem.resolvedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {patientProblems.length === 0 && (
                            <div className="text-center py-10 bg-slate-800/10 rounded-2xl border border-dashed border-slate-700">
                              <p className="text-slate-500 italic">No health problems recorded in this journey yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activePatientTab === "history" && (
                  <div className="space-y-8">
                    <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
                      <h3 className="text-lg font-bold text-white mb-4">Update Medical History</h3>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                          placeholder="Add new condition or surgery..."
                          value={newHistoryItem}
                          onChange={e => setNewHistoryItem(e.target.value)}
                        />
                        <button onClick={handleUpdateHistory} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                          Add
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {patientDetails.medicalHistory?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 text-slate-300">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          {item}
                        </div>
                      ))}
                      {(!patientDetails.medicalHistory || patientDetails.medicalHistory.length === 0) && (
                        <p className="text-slate-500 italic">No medical history recorded.</p>
                      )}
                    </div>
                  </div>
                )}

                {activePatientTab === "labs" && (
                  <div className="space-y-8">
                    <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
                      <h3 className="text-lg font-bold text-white mb-4">Order Lab Test</h3>
                      <form onSubmit={handleOrderLabTest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Test Name</label>
                          <input type="text" placeholder="e.g. Complete Blood Count" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" value={labForm.testName} onChange={e => setLabForm({ ...labForm, testName: e.target.value })} required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Clinical Notes (Optional)</label>
                          <input type="text" placeholder="e.g. Check for anemia" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" value={labForm.notes || ""} onChange={e => setLabForm({ ...labForm, notes: e.target.value })} />
                        </div>

                        <button type="submit" className="md:col-span-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                          <Microscope size={18} /> Order Test
                        </button>
                      </form>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-700">
                      <table className="w-full text-left">
                        <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                          <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Test</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700 bg-slate-900">
                          {patientDetails.labResults?.slice().reverse().map((lab, i) => (
                            <tr key={i}>
                              <td className="p-4 text-slate-500">{lab.requestDate ? new Date(lab.requestDate).toLocaleDateString() : (lab.date ? new Date(lab.date).toLocaleDateString() : "-")}</td>
                              <td className="p-4 text-white font-medium">{lab.testName}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${lab.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                  {lab.status || (lab.result ? "completed" : "pending")}
                                </span>
                              </td>
                              <td className="p-4 text-slate-300">
                                {lab.status === 'pending' ? (
                                  <span className="text-slate-500 italic">Awaiting results...</span>
                                ) : (
                                  <>{lab.result} <span className="text-xs text-slate-500">{lab.unit}</span></>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {(!patientDetails.labResults || patientDetails.labResults.length === 0) && (
                        <p className="text-slate-500 italic p-4 text-center">No lab results available.</p>
                      )}
                    </div>
                  </div>
                )}

                {activePatientTab === "meds" && (
                  <div className="space-y-8">
                    <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Prescribe New Medication</h3>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                          <Pill size={24} />
                        </div>
                      </div>

                      {/* Allergy Warning Display (if any recorded in patient details) */}
                      {patientDetails.allergies?.length > 0 && (
                        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3">
                          <AlertCircle className="text-orange-400 flex-shrink-0" size={20} />
                          <div>
                            <div className="text-sm font-bold text-orange-400 uppercase tracking-wider">Patient Allergies</div>
                            <p className="text-sm text-slate-300">This patient is allergic to: <span className="font-bold">{patientDetails.allergies.join(", ")}</span>. Please avoid prescribing these.</p>
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleAddMedication} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Medication Name</label>
                            <input
                              type="text"
                              placeholder="Enter medication name..."
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                              value={medForm.name}
                              onChange={e => setMedForm({ ...medForm, name: e.target.value })}
                              required
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Dosage</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Amount (e.g. 500)"
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                                value={medForm.dosageAmount}
                                onChange={e => setMedForm({ ...medForm, dosageAmount: e.target.value })}
                                required
                              />
                              <select
                                className="w-24 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 appearance-none"
                                value={medForm.dosageUnit}
                                onChange={e => setMedForm({ ...medForm, dosageUnit: e.target.value })}
                              >
                                <option value="mg">mg</option>
                                <option value="mcg">mcg</option>
                                <option value="g">g</option>
                                <option value="ml">ml</option>
                                <option value="tablet">tablet</option>
                                <option value="capsule">capsule</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Frequency</label>
                            <select
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                              value={medForm.frequency}
                              onChange={e => setMedForm({ ...medForm, frequency: e.target.value })}
                              required
                            >
                              <option value="Once daily">Once daily</option>
                              <option value="Twice daily">Twice daily</option>
                              <option value="Three times daily">Three times daily</option>
                              <option value="Four times daily">Four times daily</option>
                              <option value="Every 4 hours">Every 4 hours</option>
                              <option value="Every 6 hours">Every 6 hours</option>
                              <option value="Every 8 hours">Every 8 hours</option>
                              <option value="As needed (PRN)">As needed (PRN)</option>
                              <option value="Before bed">Before bed</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Start Date</label>
                            <input
                              type="date"
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                              value={medForm.startDate}
                              onChange={e => setMedForm({ ...medForm, startDate: e.target.value })}
                              required
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">End Date</label>
                            <input
                              type="date"
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                              value={medForm.endDate}
                              onChange={e => setMedForm({ ...medForm, endDate: e.target.value })}
                              required
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Administration Notes (Optional)</label>
                            <textarea
                              placeholder="e.g. Take with food, avoid alcohol..."
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all resize-none h-24"
                              value={medForm.notes}
                              onChange={e => setMedForm({ ...medForm, notes: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                            <Pill size={18} /> Prescribe Medication
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <h3 className="text-xl font-bold text-white">Current Medications</h3>
                        <div className="h-px flex-1 bg-slate-800"></div>
                      </div>

                      <div className="grid gap-4">
                        {patientMedications.filter(m => m.status === 'active').length > 0 ? (
                          patientMedications.filter(m => m.status === 'active').map((med) => (
                            <div key={med._id} className="group bg-slate-800/20 p-6 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-all shadow-lg backdrop-blur-sm">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                                    <Pill size={24} />
                                  </div>
                                  <div>
                                    <h4 className="text-xl font-bold text-white leading-tight">{med.name}</h4>
                                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                      <span className="bg-slate-700/50 px-2 py-0.5 rounded text-xs font-medium text-slate-300">
                                        {med.dosageAmount}{med.dosageUnit}
                                      </span>
                                      <span>•</span>
                                      <span className="text-blue-400 font-medium">{med.frequency}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right hidden sm:block">
                                    <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Prescribed By</div>
                                    <div className="text-sm text-white">Dr. {med.doctor?.username || "Medical Staff"}</div>
                                  </div>
                                  <button
                                    onClick={() => handleUpdateMedicationStatus(med._id, 'inactive')}
                                    className="bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 border border-slate-700 hover:border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider"
                                  >
                                    Deactivate
                                  </button>
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800/50">
                                <div className="space-y-1">
                                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Duration Profile</span>
                                  <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <Calendar size={14} className="text-slate-500" />
                                    {new Date(med.startDate).toLocaleDateString()} — {new Date(med.endDate).toLocaleDateString()}
                                  </div>
                                </div>
                                {med.notes && (
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Clinical Notes</span>
                                    <p className="text-xs text-slate-400 italic">"{med.notes}"</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-slate-500 italic">
                            <p>No active medications currently prescribed.</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-12">
                        <h3 className="text-xl font-bold text-white opacity-60">Medication History</h3>
                        <div className="h-px flex-1 bg-slate-800 opacity-60"></div>
                      </div>

                      <div className="grid gap-4 opacity-75">
                        {patientMedications.filter(m => m.status === 'inactive').map((med) => (
                          <div key={med._id} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 grayscale hover:grayscale-0 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-3">
                                <Pill size={18} className="text-slate-600" />
                                <h4 className="font-bold text-slate-300">{med.name}</h4>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 font-bold uppercase border border-slate-700">Past Prescription</span>
                            </div>
                            <div className="text-xs text-slate-500 flex gap-4">
                              <span>{med.dosageAmount}{med.dosageUnit} • {med.frequency}</span>
                              <span>Ended: {new Date(med.endDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                        {patientMedications.filter(m => m.status === 'inactive').length === 0 && (
                          <p className="text-center text-slate-600 text-sm italic py-4">No historical data available.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };
  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} bg-slate-900`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color === 'blue' ? 'bg-blue-500/20' : color === 'green' ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
          <Icon size={24} />
        </div>
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      <div className="font-medium opacity-80">{label}</div>
    </div>
  );
};

export default DoctorDashboard;
