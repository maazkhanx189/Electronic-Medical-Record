import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar, Users, Clock, Activity, Search, X,
  FileText, Plus, CheckCircle, AlertCircle, ChevronRight,
  Stethoscope, Pill, FlaskConical, Microscope,
  LayoutDashboard, UserCheck, UserX, LogOut, ArrowRight, FileDown, Edit, User, Save, Printer, History, Bell,
  Upload, TrendingUp, BarChart3, LineChart, Activity as ActivityIcon, Menu, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Custom Dashboard Sidebar
const DashboardSidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen }) => {
  const filters = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "patient-list", label: "Patient List", icon: UserCheck },
    { id: "pending-labs", label: "Pending Tests", icon: Clock },
    { id: "completed-labs", label: "Completed Tests", icon: FileText },
    { id: "upload-results", label: "Upload Results", icon: Upload },
    { id: "analytics", label: "Lab Analytics", icon: BarChart3 },
    { id: "profile", label: "Staff Profile", icon: User },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed top-0 left-0 h-full bg-slate-900 shadow-2xl z-[70] transition-all duration-300 border-r border-slate-800 ${isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}
        initial={{ x: -256 }}
        animate={{ x: 0 }}
      >
        <div className="flex flex-col h-full py-8">
          <div className="px-6 mb-10 flex items-center justify-between">
            {isOpen ? (
              <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
                LAB <span className="text-slate-500 font-light">SYSTEM</span>
              </h1>
            ) : (
              <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                <FlaskConical size={20} />
              </div>
            )}
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => { setActiveTab(filter.id); if (window.innerWidth < 1024) setIsOpen(false); }}
                className={`w-full group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 relative ${activeTab === filter.id
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
              >
                <filter.icon size={22} className="flex-shrink-0" />
                {isOpen && <span className="font-bold tracking-tight">{filter.label}</span>}
              </button>
            ))}
          </nav>

          <div className="px-4 mt-auto">
            <button
              onClick={onLogout}
              className="w-full group flex items-center gap-4 p-4 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all duration-300"
            >
              <LogOut size={22} className="flex-shrink-0" />
              {isOpen && <span className="font-bold tracking-tight text-sm">System Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

const LaboratoryResultsDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ todayAppointments: 0, totalPatients: 0, pendingRequests: 0 });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Lab Results State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [allPatients, setAllPatients] = useState([]);
  const [labForm, setLabForm] = useState({ testName: "", type: "", result: "", unit: "", date: "" });
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("glucose");

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

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

      // Fetch Doctor's Patient List
      const patRes = await fetch(`http://localhost:5000/api/doctor/my-patients`, { headers });
      const patData = await patRes.json();

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

  // Fetch patient details for lab results
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
        processChartData(data.patient.labResults || []);
        setIsLabModalOpen(true);
      }
    } catch (error) {
      toast.error("Error fetching patient details");
    }
  };

  // Process lab results for charting
  const processChartData = (labResults) => {
    const metrics = {
      glucose: [],
      bloodPressureSystolic: [],
      bloodPressureDiastolic: [],
      cholesterol: [],
      hemoglobin: []
    };

    labResults.forEach(result => {
      const date = new Date(result.date).toLocaleDateString();
      const value = parseFloat(result.result);

      if (result.testName.toLowerCase().includes('glucose')) {
        metrics.glucose.push({ date, value, unit: result.unit });
      } else if (result.testName.toLowerCase().includes('blood pressure') && result.testName.toLowerCase().includes('systolic')) {
        metrics.bloodPressureSystolic.push({ date, value, unit: result.unit });
      } else if (result.testName.toLowerCase().includes('blood pressure') && result.testName.toLowerCase().includes('diastolic')) {
        metrics.bloodPressureDiastolic.push({ date, value, unit: result.unit });
      } else if (result.testName.toLowerCase().includes('cholesterol')) {
        metrics.cholesterol.push({ date, value, unit: result.unit });
      } else if (result.testName.toLowerCase().includes('hemoglobin')) {
        metrics.hemoglobin.push({ date, value, unit: result.unit });
      }
    });

    // Sort by date and prepare chart data
    Object.keys(metrics).forEach(key => {
      metrics[key].sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    setChartData(metrics);
  };

  // Handle adding lab result
  const handleAddLabResult = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("email", selectedPatient.email);
      formData.append("testName", labForm.testName);
      if (labForm.type) formData.append("type", labForm.type);
      formData.append("result", labForm.result);
      if (labForm.unit) formData.append("unit", labForm.unit);
      formData.append("date", labForm.date || new Date().toISOString());
      if (attachmentFile) formData.append("attachment", attachmentFile);

      const res = await fetch("http://localhost:5000/api/auth/laboratory/results", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        toast.success("Lab result added");
        setLabForm({ testName: "", type: "", result: "", unit: "", date: "" });
        setAttachmentFile(null);
        fetchPatientDetails(selectedPatient._id);
      } else {
        toast.error("Failed to add lab result");
      }
    } catch (error) {
      toast.error("Failed to add lab result");
    }
  };

  // Get filtered patients
  const getFilteredPatients = () => {
    return allPatients.filter(p =>
      (p.username || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Render chart based on selected metric
  const renderChart = () => {
    const data = chartData[selectedMetric] || [];
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-slate-800/20 rounded-xl border border-slate-700/50">
          <div className="text-center text-slate-400">
            <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
            <p>No data available for {selectedMetric.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
          </div>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="flex bg-slate-950 min-h-screen font-sans text-slate-200">
      {/* Custom Sidebar */}
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className={`flex-1 p-4 md:p-8 w-full transition-all ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
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
              <p className="text-slate-400 text-sm md:text-base">Laboratory Information System</p>
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

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Patients" value={stats.totalPatients} icon={Users} color="blue" />
          <StatCard label="Today's Appointments" value={stats.todayAppointments} icon={Calendar} color="green" />
          <StatCard label="Pending Requests" value={stats.pendingRequests} icon={Clock} color="orange" />
          <StatCard label="Lab Tests Today" value={0} icon={FlaskConical} color="purple" />
        </div>

        {/* Patient Selection and Lab Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient List */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Users size={20} className="text-blue-400" />
                Select Patient
              </h3>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Patient List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getFilteredPatients().map(patient => (
                  <button
                    key={patient._id}
                    onClick={() => fetchPatientDetails(patient._id)}
                    className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-blue-400 font-bold">
                        {patient.username?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{patient.username}</div>
                        <div className="text-sm text-slate-400">{patient.email}</div>
                      </div>
                    </div>
                  </button>
                ))}
                {getFilteredPatients().length === 0 && (
                  <p className="text-slate-500 italic text-center py-8">No patients found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Lab Results and Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metric Selection */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-400" />
                Trend Analysis
              </h3>

              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { key: 'glucose', label: 'Glucose', icon: ActivityIcon },
                  { key: 'bloodPressureSystolic', label: 'BP Systolic', icon: Activity },
                  { key: 'bloodPressureDiastolic', label: 'BP Diastolic', icon: Activity },
                  { key: 'cholesterol', label: 'Cholesterol', icon: BarChart3 },
                  { key: 'hemoglobin', label: 'Hemoglobin', icon: LineChart }
                ].map(metric => (
                  <button
                    key={metric.key}
                    onClick={() => setSelectedMetric(metric.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${selectedMetric === metric.key
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                  >
                    <metric.icon size={16} />
                    {metric.label}
                  </button>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-slate-800/20 rounded-xl p-4 border border-slate-700/50">
                {renderChart()}
              </div>
            </div>

            {/* Recent Lab Results */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText size={20} className="text-purple-400" />
                Recent Lab Results
              </h3>

              {selectedPatient ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setIsLabModalOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add New Lab Result
                  </button>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {patientDetails?.labResults?.slice().reverse().slice(0, 10).map((result, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <div>
                          <div className="font-bold text-white">{result.testName}</div>
                          <div className="text-sm text-slate-400">{new Date(result.date).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-400">{result.result} {result.unit}</div>
                        </div>
                      </div>
                    ))}
                    {(!patientDetails?.labResults || patientDetails.labResults.length === 0) && (
                      <p className="text-slate-500 italic text-center py-8">No lab results available.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <FlaskConical size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select a patient to view lab results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lab Result Modal */}
      <AnimatePresence>
        {isLabModalOpen && selectedPatient && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsLabModalOpen(false)}
          >
            <motion.div
              className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FlaskConical size={24} className="text-blue-400" />
                  Add Lab Result
                </h3>
                <p className="text-slate-400 text-sm">For patient: {selectedPatient.username}</p>
              </div>

              <form onSubmit={handleAddLabResult} className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Test Name</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                    value={labForm.testName}
                    onChange={e => setLabForm({ ...labForm, testName: e.target.value })}
                    required
                  >
                    <option value="">Select test</option>
                    <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                    <option value="Hemoglobin">Hemoglobin</option>
                    <option value="Hematocrit">Hematocrit</option>
                    <option value="White Blood Cell Count">White Blood Cell Count</option>
                    <option value="Red Blood Cell Count">Red Blood Cell Count</option>
                    <option value="Platelet Count">Platelet Count</option>
                    <option value="Blood Glucose (Fasting)">Blood Glucose (Fasting)</option>
                    <option value="HbA1c">HbA1c</option>
                    <option value="Lipid Profile - Total Cholesterol">Lipid Profile - Total Cholesterol</option>
                    <option value="Lipid Profile - HDL">Lipid Profile - HDL</option>
                    <option value="Lipid Profile - LDL">Lipid Profile - LDL</option>
                    <option value="Lipid Profile - Triglycerides">Lipid Profile - Triglycerides</option>
                    <option value="Renal Function - Creatinine">Renal Function - Creatinine</option>
                    <option value="Renal Function - BUN">Renal Function - BUN</option>
                    <option value="Electrolytes - Sodium">Electrolytes - Sodium</option>
                    <option value="Electrolytes - Potassium">Electrolytes - Potassium</option>
                    <option value="Electrolytes - Chloride">Electrolytes - Chloride</option>
                    <option value="Liver Function - AST">Liver Function - AST</option>
                    <option value="Liver Function - ALT">Liver Function - ALT</option>
                    <option value="Liver Function - ALP">Liver Function - ALP</option>
                    <option value="Liver Function - Bilirubin">Liver Function - Bilirubin</option>
                    <option value="Thyroid - TSH">Thyroid - TSH</option>
                    <option value="Thyroid - T3">Thyroid - T3</option>
                    <option value="Thyroid - T4">Thyroid - T4</option>
                    <option value="Urinalysis - Protein">Urinalysis - Protein</option>
                    <option value="Urinalysis - Glucose">Urinalysis - Glucose</option>
                    <option value="Urinalysis - Ketones">Urinalysis - Ketones</option>
                    <option value="Pregnancy Test (hCG)">Pregnancy Test (hCG)</option>
                    <option value="C-Reactive Protein (CRP)">C-Reactive Protein (CRP)</option>
                    <option value="ESR">ESR</option>
                    <option value="Vitamin D">Vitamin D</option>
                    <option value="Vitamin B12">Vitamin B12</option>
                    <option value="Ferritin">Ferritin</option>
                    <option value="D-Dimer">D-Dimer</option>
                    <option value="Prothrombin Time (PT)">Prothrombin Time (PT)</option>
                    <option value="INR">INR</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 block mb-1">Type</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                    value={labForm.type}
                    onChange={e => setLabForm({ ...labForm, type: e.target.value })}
                  >
                    <option value="">Select type</option>
                    <option value="Blood">Blood</option>
                    <option value="Urine">Urine</option>
                    <option value="Stool">Stool</option>
                    <option value="Saliva">Saliva</option>
                    <option value="Imaging">Imaging</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Result</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                      placeholder="Value"
                      value={labForm.result}
                      onChange={e => setLabForm({ ...labForm, result: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Unit</label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                      placeholder="mg/dL"
                      value={labForm.unit}
                      onChange={e => setLabForm({ ...labForm, unit: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400 block mb-1">Test Date</label>
                  <input
                    type="date"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                    value={labForm.date}
                    onChange={e => setLabForm({ ...labForm, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 block mb-1">Upload Image</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                    onChange={e => setAttachmentFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP up to 5MB</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsLabModalOpen(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg transition-colors"
                  >
                    Add Result
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} bg-slate-900`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color === 'blue' ? 'bg-blue-500/20' : color === 'green' ? 'bg-green-500/20' : color === 'orange' ? 'bg-orange-500/20' : 'bg-purple-500/20'}`}>
          <Icon size={24} />
        </div>
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      <div className="font-medium opacity-80">{label}</div>
    </div>
  );
};

export default LaboratoryResultsDashboard;
