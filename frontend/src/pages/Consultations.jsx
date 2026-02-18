import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import VisitForm from "../components/VisitForm";
import { toast } from "react-toastify";
import { Calendar, ChevronRight, X, ArrowRight, Clock, Stethoscope, Menu } from "lucide-react";

const Consultations = () => {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "doctor") {
      navigate("/login");
      return;
    }
    fetchDoctor();
    fetchAppointments();
  }, [token, role, navigate]);

  const fetchDoctor = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch doctor data");

      const data = await res.json();
      setDoctor(data);
    } catch (err) {
      toast.error('Failed to fetch doctor data: ' + err.message);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/appointment/doctor`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch appointments");

      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      toast.error('Failed to fetch appointments: ' + err.message);
    }
  };

  const fetchPatientHistory = async (patientId) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/patient/history/${patientId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch patient history");

      const data = await res.json();
      setPatientHistory(data);
    } catch (err) {
      toast.error('Failed to fetch patient history: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    fetchPatientHistory(appointment.patient._id);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userID");
    navigate("/login");
  };

  const handleOpenVisitForm = (visit = null) => {
    setEditingVisit(visit);
    setShowVisitForm(true);
  };

  const handleCloseVisitForm = () => {
    setShowVisitForm(false);
    setEditingVisit(null);
  };

  const handleSaveVisit = (visitData) => {
    // Refresh patient history after saving
    if (selectedAppointment) {
      fetchPatientHistory(selectedAppointment.patient._id);
    }
  };

  // Filter visits based on search and filter criteria
  const filteredVisits = patientHistory?.visits.filter((visit) => {
    const matchesSearch = !searchTerm ||
      visit.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.treatment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.clinicalNotes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDoctor = !filterDoctor ||
      visit.doctor.username.toLowerCase().includes(filterDoctor.toLowerCase());

    const visitDate = new Date(visit.date);
    const matchesDateFrom = !filterDateFrom || visitDate >= new Date(filterDateFrom);
    const matchesDateTo = !filterDateTo || visitDate <= new Date(filterDateTo + 'T23:59:59');

    return matchesSearch && matchesDoctor && matchesDateFrom && matchesDateTo;
  }) || [];

  if (!doctor) {
    return (
      <motion.div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <p className="text-white text-xl">Loading...</p>
      </motion.div>
    );
  }

  return (
    <div className="flex bg-slate-900 min-h-screen text-slate-200">
      {/* Sidebar Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Since Sidebar component is reused, we might need to pass props if it supports them, 
          but based on previous files, each dashboard has its own sidebar logic or we use the common one. 
          Consultations uses the common Sidebar.jsx. Let's assume it needs sidebarOpen/setSidebarOpen if it follows the Admin pattern, or we just wrap it. */}
      <div className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition duration-200 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar userRole="doctor" onLogout={handleLogout} sidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} />
      </div>

      <motion.div
        className={`flex-1 w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12 overflow-x-hidden transition-all ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="mb-6 p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 lg:hidden hover:bg-slate-700"
          >
            <Menu size={24} />
          </button>

          <motion.div
            className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-8 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Consultations
            </h1>
            <p className="text-green-100 text-lg">
              View and manage patient consultations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Appointments List */}
            <motion.div
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Today's Appointments</h2>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${selectedAppointment?._id === appointment._id
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                      }`}
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{appointment.patient.username}</h3>
                        <p className="text-sm opacity-75">{appointment.reason}</p>
                        <p className="text-sm opacity-75">{appointment.time}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${appointment.status === 'confirmed' ? 'bg-green-500' :
                        appointment.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Patient History */}
            <motion.div
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {selectedAppointment ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      Patient History: {selectedAppointment.patient.username}
                    </h2>
                    <button
                      onClick={() => handleOpenVisitForm()}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Add Visit Details
                    </button>
                  </div>
                  {loading ? (
                    <p className="text-slate-400">Loading patient history...</p>
                  ) : patientHistory ? (
                    <div className="space-y-6">
                      {/* Patient Summary */}
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Patient Summary</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Age:</span>
                            <span className="text-white ml-2">{patientHistory.patient.age}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Gender:</span>
                            <span className="text-white ml-2">{patientHistory.patient.gender}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400">Allergies:</span>
                            <span className="text-white ml-2">
                              {patientHistory.patient.allergies.length > 0
                                ? patientHistory.patient.allergies.join(', ')
                                : 'None'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Total Visits:</span>
                            <span className="text-white ml-2">{patientHistory.summary.totalVisits}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Last Visit:</span>
                            <span className="text-white ml-2">
                              {patientHistory.summary.lastVisitDate
                                ? new Date(patientHistory.summary.lastVisitDate).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                        <h4 className="text-md font-semibold text-white mb-3">Filters</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          <input
                            type="text"
                            placeholder="Search diagnosis/treatment..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-2 bg-slate-600 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            type="text"
                            placeholder="Filter by doctor"
                            value={filterDoctor}
                            onChange={(e) => setFilterDoctor(e.target.value)}
                            className="px-3 py-2 bg-slate-600 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            type="date"
                            placeholder="From date"
                            value={filterDateFrom}
                            onChange={(e) => setFilterDateFrom(e.target.value)}
                            className="px-3 py-2 bg-slate-600 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            type="date"
                            placeholder="To date"
                            value={filterDateTo}
                            onChange={(e) => setFilterDateTo(e.target.value)}
                            className="px-3 py-2 bg-slate-600 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setFilterDoctor('');
                            setFilterDateFrom('');
                            setFilterDateTo('');
                          }}
                          className="mt-3 px-4 py-2 bg-slate-600 text-white rounded-md text-sm hover:bg-slate-500 transition-colors"
                        >
                          Clear Filters
                        </button>
                      </div>

                      {/* Medical History Timeline */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Medical History</h3>
                        <div className="space-y-4">
                          {filteredVisits.length > 0 ? (
                            filteredVisits.map((visit, index) => (
                              <div key={index} className="border border-slate-700/50 rounded-xl overflow-hidden shadow-sm mb-4">
                                <button
                                  onClick={() => setSelectedVisit(visit)}
                                  className="w-full flex justify-between items-center p-4 transition-all duration-200 bg-slate-700/20 hover:bg-slate-700/40 group/visit"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-slate-800 text-slate-500 group-hover/visit:bg-green-600 group-hover/visit:text-white transition-all">
                                      <Calendar size={18} />
                                    </div>
                                    <div className="text-left">
                                      <span className="block font-bold text-white">{new Date(visit.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Dr. {visit.doctor.username}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-green-400 opacity-0 group-hover/visit:opacity-100 transition-all font-medium text-sm">
                                    Open Record <ArrowRight size={16} />
                                  </div>
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400">No visit records found.</p>
                          )}
                        </div>
                      </div>

                      {/* Current Medications */}
                      {patientHistory.medications.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">Current Medications</h3>
                          <div className="space-y-2">
                            {patientHistory.medications.map((med, index) => (
                              <div key={index} className="bg-slate-700/30 rounded-lg p-3">
                                <div className="flex justify-between">
                                  <span className="text-white font-medium">{med.name}</span>
                                  <span className="text-sm text-slate-400">
                                    {med.dosageAmount} {med.dosageUnit} {med.frequency}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-300">
                                  Prescribed by Dr. {med.doctor.username} on {new Date(med.startDate).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Problems/Diagnoses */}
                      {patientHistory.problems.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">Medical Problems</h3>
                          <div className="space-y-2">
                            {patientHistory.problems.map((problem, index) => (
                              <div key={index} className="bg-slate-700/30 rounded-lg p-3">
                                <div className="flex justify-between">
                                  <span className="text-white font-medium">{problem.diagnosis}</span>
                                  <span className={`text-xs px-2 py-1 rounded ${problem.status === 'active' ? 'bg-red-500' : 'bg-green-500'
                                    }`}>
                                    {problem.status}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-300">
                                  Reported on {new Date(problem.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400">Failed to load patient history.</p>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">Select an appointment to view patient history</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Visit Form Modal */}
      {showVisitForm && selectedAppointment && (
        <VisitForm
          appointment={selectedAppointment}
          visit={editingVisit}
          onClose={handleCloseVisitForm}
          onSave={handleSaveVisit}
        />
      )}

      {/* VISIT DETAILS MODAL (New Small Window) */}
      <AnimatePresence>
        {selectedVisit && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedVisit(null)}
          >
            <motion.div
              className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-600 rounded-2xl shadow-lg shadow-green-600/20">
                    <Calendar className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Visit Record: {new Date(selectedVisit.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <p className="text-slate-400 text-sm">Attending Physician: Dr. {selectedVisit.doctor.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {selectedVisit.diagnosis && (
                    <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Diagnosis</span>
                      <p className="text-white font-bold text-lg flex items-center gap-2">
                        <Stethoscope size={18} className="text-green-400" /> {selectedVisit.diagnosis}
                      </p>
                    </div>
                  )}
                  {selectedVisit.treatment && (
                    <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Treatment</span>
                      <p className="text-white font-medium flex items-center gap-2">
                        <Clock size={18} className="text-blue-400" /> {selectedVisit.treatment}
                      </p>
                    </div>
                  )}
                </div>

                {selectedVisit.clinicalNotes && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Clinical Documentation</span>
                    <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 shadow-inner text-slate-300 text-sm leading-relaxed italic">
                      "{selectedVisit.clinicalNotes}"
                    </div>
                  </div>
                )}

                {selectedVisit.progressNotes && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Progress Notes</span>
                    <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 shadow-inner text-slate-300 text-sm leading-relaxed">
                      {selectedVisit.progressNotes}
                    </div>
                  </div>
                )}

                {selectedVisit.visitSummary && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Visit Summary</span>
                    <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 shadow-inner text-slate-300 text-sm leading-relaxed">
                      {selectedVisit.visitSummary}
                    </div>
                  </div>
                )}

                {selectedVisit.recommendations && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Recommendations</span>
                    <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 shadow-inner text-slate-300 text-sm leading-relaxed">
                      {selectedVisit.recommendations}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-800 bg-slate-800/10 flex justify-end">
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Consultations;
