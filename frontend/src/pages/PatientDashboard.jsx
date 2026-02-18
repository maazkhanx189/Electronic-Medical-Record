import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Calendar, Clock, User, FileText, Pill, Activity, Search,
  X, AlertCircle, Stethoscope, Droplet, Thermometer, CheckCircle,
  LayoutDashboard, LogOut, RefreshCw, Save, Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const DashboardSidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen }) => {
  const menus = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "doctors", label: "Find Doctors", icon: Search },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "journey", label: "Health Journey", icon: Activity },
    { id: "record", label: "Medical Record", icon: FileText },
    { id: "medications", label: "Medications", icon: Pill },
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
            <div className="p-1.5 bg-gradient-to-tr from-green-500 to-emerald-500 rounded-lg">
              <Activity className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Patient<span className="font-light text-slate-500">Panel</span>
            </span>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <div className="text-xs font-bold text-slate-500 px-4 mb-2 uppercase tracking-wider">Main Menu</div>
          {menus.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === item.id
                ? "bg-green-600/10 text-green-400 border border-green-600/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
            >
              <item.icon size={18} />
              {item.label}
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

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // overview, appointments, doctors, record
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [problems, setProblems] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [problemSortOrder, setProblemSortOrder] = useState("newest");

  // Modal states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDoctorProfileOpen, setIsDoctorProfileOpen] = useState(false);
  const [bookingData, setBookingData] = useState({ date: "", time: "", reason: "", notes: "" });

  // Reschedule State
  const [rescheduleData, setRescheduleData] = useState(null); // stores the appointment being rescheduled
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableTimes] = useState([
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ]);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [invoiceStats, setInvoiceStats] = useState({ pending: 0, paid: 0 });
  const [invoices, setInvoices] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch Initial Data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem("userID");

        // Fetch Appointments
        const appRes = await fetch(`http://localhost:5000/api/appointments/patient/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (appRes.ok) setAppointments(await appRes.json());
        else console.error("Failed to fetch appointments");

        // Fetch Approved Doctors
        const docRes = await fetch(`http://localhost:5000/api/doctor/approved`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (docRes.ok) setDoctors(await docRes.json());
        else console.error("Failed to fetch doctors");

        // Fetch Medical Profile
        const profileRes = await fetch(`http://localhost:5000/api/patient/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.ok) setMedicalRecord(await profileRes.json());
        else console.error("Failed to fetch profile");

        // Fetch Problems
        const problemRes = await fetch(`http://localhost:5000/api/patient/problems`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (problemRes.ok) setProblems(await problemRes.json());
        else console.error("Failed to fetch problems");

        // Fetch Medications
        const medRes = await fetch(`http://localhost:5000/api/patient/medications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (medRes.ok) setMedications(await medRes.json());
        else console.error("Failed to fetch medications");

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [navigate]);

  // Fetch invoices for patient
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/invoices/patient/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const list = await res.json();
          setInvoices(Array.isArray(list) ? list : []);
          const pending = list.filter(i => i.status === "pending").length;
          const paid = list.filter(i => i.status === "paid" || i.status === "confirmed").length;
          setInvoiceStats({ pending, paid });
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Handlers
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userID");

      if (!bookingData.time) {
        toast.error("Please select an available time slot");
        return;
      }

      const res = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patient: userId,
          doctor: selectedDoctor._id,
          ...bookingData
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Appointment booked successfully!");
        setIsBookingModalOpen(false);
        setBookingData({ date: "", time: "", reason: "", notes: "" });
        // Refresh appointments
        const appRes = await fetch(`http://localhost:5000/api/appointments/patient/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (appRes.ok) setAppointments(await appRes.json());
      } else {
        toast.error(data.msg || "Booking failed");
      }
    } catch (error) {
      toast.error("Error booking appointment");
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "cancelled" })
      });

      if (res.ok) {
        toast.success("Appointment cancelled");
        setAppointments(prev => prev.map(app => app._id === id ? { ...app, status: "cancelled" } : app));
      } else {
        toast.error("Failed to cancel appointment");
      }
    } catch (error) {
      toast.error("Error cancelling appointment");
    }
  };

  const fetchBookedSlots = async (docId, selectedDate) => {
    if (!docId || !selectedDate) return;
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/booked-slots?doctorID=${docId}&date=${selectedDate}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch slots");
      const data = await res.json();
      setBookedSlots(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleOpenReschedule = (appointment) => {
    setRescheduleData(appointment);
    setNewDate(new Date(appointment.date).toISOString().split('T')[0]);
    setNewTime(appointment.time);
    fetchBookedSlots(appointment.doctor._id, new Date(appointment.date).toISOString().split('T')[0]);
  };

  const handleRescheduleSubmit = async () => {
    if (!newDate || !newTime) {
      toast.error("Please select a date and time");
      return;
    }
    setIsRescheduling(true);
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${rescheduleData._id}/reschedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          date: newDate,
          time: newTime,
          reason: rescheduleData.reason,
          notes: rescheduleData.notes
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to reschedule');

      toast.success('Appointment rescheduled successfully!');
      setRescheduleData(null);
      // Refresh appointments
      const userId = localStorage.getItem("userID");
      const appRes = await fetch(`http://localhost:5000/api/appointments/patient/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (appRes.ok) setAppointments(await appRes.json());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsRescheduling(false);
    }
  };

  const filteredDoctors = doctors.filter(doc =>
    doc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-slate-950 min-h-screen font-sans text-slate-200 pt-[80px]">
      {/* Custom Sidebar */}
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full transition-all">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
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
              <p className="text-slate-400 text-sm md:text-base">Welcome back, {medicalRecord?.username || "Patient"}.</p>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
            <div className="text-xs md:text-sm text-slate-300">
              Bills: <span className="text-amber-300 font-semibold">{invoiceStats.pending}</span> Pending / <span className="text-emerald-300 font-semibold">{invoiceStats.paid}</span> Paid
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center text-md font-bold shadow-lg shadow-green-500/20 text-white">
              {medicalRecord ? medicalRecord.username.charAt(0).toUpperCase() : "P"}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    label="Upcoming"
                    value={appointments.filter(a => a.status === 'confirmed').length}
                    icon={Calendar}
                    color="blue"
                  />
                  <StatCard
                    label="Consultations"
                    value={medicalRecord?.consultations?.length || 0}
                    icon={Stethoscope}
                    color="green"
                  />
                  <StatCard
                    label="Active Problems"
                    value={problems.filter(p => p.status === 'active').length}
                    icon={AlertCircle}
                    color="orange"
                  />
                  <StatCard
                    label="Pending"
                    value={appointments.filter(a => a.status === 'pending').length}
                    icon={Clock}
                    color="blue"
                  />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg text-white">Recent Vitals</h3>
                      <span className="text-xs text-slate-400">Last updated: Today</span>
                    </div>
                    {medicalRecord?.vitalSigns ? (
                      <div className="grid grid-cols-2 gap-4">
                        <VitalItem label="Blood Pressure" value={medicalRecord.vitalSigns.bloodPressure || "-"} unit="mmHg" icon={Activity} color="text-red-400" />
                        <VitalItem label="Heart Rate" value={medicalRecord.vitalSigns.heartRate || "-"} unit="bpm" icon={Activity} color="text-blue-400" />
                        <VitalItem label="Weight" value={medicalRecord.vitalSigns.weight || "-"} unit="kg" icon={Activity} color="text-yellow-400" />
                        <VitalItem label="Temperature" value={medicalRecord.vitalSigns.temperature || "-"} unit="°C" icon={Thermometer} color="text-orange-400" />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">No vitals recorded</div>
                    )}
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4 text-white">Bills &amp; Payment Status</h3>
                    <p className="text-slate-400 text-sm mb-4">Payment status from receptionist billing.</p>
                    {invoices.length > 0 ? (
                      <div className="space-y-2">
                        {invoices.slice(0, 5).map((inv) => (
                          <div key={inv._id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                            <span className="text-slate-300 text-sm">{new Date(inv.createdAt).toLocaleDateString()} · ${Number(inv.total || 0).toFixed(2)}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${inv.status === "paid" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                              {inv.status === "paid" ? "Paid" : "Pending"}
                            </span>
                          </div>
                        ))}
                        {invoices.length > 5 && <p className="text-slate-500 text-xs pt-1">+{invoices.length - 5} more</p>}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">No bills yet.</p>
                    )}
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-6 text-white">Next Appointment</h3>
                    {appointments.filter(a => a.status === 'confirmed').length > 0 ? (
                      (() => {
                        const nextApp = appointments.filter(a => a.status === 'confirmed')[0];
                        return (
                          <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                                <User size={24} />
                              </div>
                              <div>
                                <div className="font-bold text-white">Dr. {nextApp.doctor?.username}</div>
                                <div className="text-sm text-slate-400">{nextApp.doctor?.specialization}</div>
                              </div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400 text-sm flex items-center gap-2"> <Calendar size={14} /> {new Date(nextApp.date).toLocaleDateString()} at {nextApp.time}</span>
                              <span className="text-green-400 font-medium bg-green-500/10 px-2 py-0.5 rounded">Confirmed</span>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        No upcoming appointments.
                        <button onClick={() => setActiveTab("doctors")} className="text-green-400 ml-2 hover:underline">Book now</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DOCTORS TAB */}
            {activeTab === "doctors" && (
              <div>
                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search doctors by name or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-slate-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDoctors.map(doc => (
                    <div key={doc._id} className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/30 transition-all hover:shadow-lg hover:shadow-green-900/10 group flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold text-slate-300 mb-4 border-4 border-slate-800 shadow-md overflow-hidden">
                        {doc.profilePicture ? (
                          <img src={`http://localhost:5000${doc.profilePicture}`} alt={doc.username} className="w-full h-full object-cover" />
                        ) : (
                          doc.username.charAt(0)
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-white group-hover:text-green-400 transition-colors">Dr. {doc.username}</h3>
                      <p className="text-slate-400 text-sm mb-6">{doc.specialization}</p>

                      <div className="w-full mt-auto flex gap-3">
                        <button
                          onClick={() => { setSelectedDoctor(doc); setIsDoctorProfileOpen(true); }}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-black/20"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDoctor(doc);
                            setBookingData({ date: "", time: "", reason: "", notes: "" });
                            setBookedSlots([]);
                            setIsBookingModalOpen(true);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-green-600/20"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredDoctors.length === 0 && (
                  <div className="text-center py-20 text-slate-500">No doctors found matching your search.</div>
                )}
              </div>
            )}

            {/* APPOINTMENTS TAB */}
            {activeTab === "appointments" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-white">Your Appointment History</h2>
                </div>
                {appointments.length > 0 ? (
                  appointments.map(app => (
                    <div key={app._id} className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-slate-800/60">
                      <div className="flex items-start gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${app.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          app.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                            app.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                              'bg-slate-500/20 text-slate-400'
                          }`}>
                          <Calendar size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-white">Dr. {app.doctor?.username || "Unknown Doctor"}</h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400 mt-2">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(app.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {app.time}</span>
                          </div>
                          <p className="text-slate-500 text-sm mt-2">{app.reason}</p>
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-3 min-w-[120px]">
                        <span className={`px-4 py-2 rounded-lg text-sm font-bold capitalize text-center border ${app.status === 'confirmed' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                          app.status === 'pending' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                            app.status === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                              'bg-slate-500/10 border-slate-500/20 text-slate-400'
                          }`}>
                          {app.status}
                        </span>
                        {(app.status === 'pending' || app.status === 'confirmed') && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleOpenReschedule(app)}
                              className="text-orange-400 hover:text-orange-300 text-sm underline decoration-orange-400/30 flex items-center gap-1"
                            >
                              <RefreshCw size={14} /> Reschedule
                            </button>
                            <button
                              onClick={() => cancelAppointment(app._id)}
                              className="text-red-400 hover:text-red-300 text-sm underline decoration-red-400/30"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-slate-500">No appointments found.</div>
                )}
              </div>
            )}

            {/* HEALTH JOURNEY TAB */}
            {activeTab === "journey" && (
              <div className="space-y-8 pb-10">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Clinical Timeline</h2>
                    <p className="text-slate-400 text-sm">A chronological view of your health conditions and treatments.</p>
                  </div>
                  <button
                    onClick={() => setProblemSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
                    className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 font-medium bg-green-500/5 px-4 py-2 rounded-xl border border-green-500/10 transition-all shadow-sm"
                  >
                    {problemSortOrder === "newest" ? "Newest First" : "Oldest First"}
                    {problemSortOrder === "newest" ? <Clock size={16} /> : <Calendar size={16} />}
                  </button>
                </div>

                <div className="relative">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-800/80"></div>

                  <div className="space-y-10 relative">
                    {(problemSortOrder === "newest" ? problems : [...problems].reverse()).length > 0 ? (
                      (problemSortOrder === "newest" ? problems : [...problems].reverse()).map((problem) => (
                        <div key={problem._id} className="pl-12 relative group">
                          {/* Timeline Dot */}
                          <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-slate-950 flex items-center justify-center z-10 transition-all duration-300 group-hover:scale-110 ${problem.status === 'active' ? 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}>
                            {problem.status === 'active' ? <AlertCircle size={18} className="text-white" /> : <CheckCircle size={18} className="text-white" />}
                          </div>

                          {/* Card */}
                          <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800 hover:border-green-500/30 transition-all duration-300 shadow-xl">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-800/50 pb-4">
                              <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-1 block">
                                  {new Date(problem.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                                <h4 className="text-2xl font-bold text-white tracking-tight">{problem.diagnosis}</h4>
                              </div>
                              <div className={`text-xs px-4 py-1.5 rounded-full border-2 font-black uppercase tracking-widest ${problem.status === 'active' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                {problem.status}
                              </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                              <div className="bg-slate-800/20 p-4 rounded-xl border border-slate-700/30">
                                <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest block mb-2">Reported Symptoms</span>
                                <p className="text-slate-300 italic leading-relaxed">"{problem.symptoms}"</p>
                              </div>
                              <div className="bg-slate-800/20 p-4 rounded-xl border border-slate-700/30">
                                <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest block mb-2">Clinical Treatment</span>
                                <p className="text-slate-200 leading-relaxed">{problem.treatment}</p>
                              </div>
                              <div className="bg-slate-800/20 p-4 rounded-xl border border-slate-700/30">
                                <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest block mb-2">Managing Doctor</span>
                                <div className="flex items-center gap-3 mt-1">
                                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-xs uppercase">
                                    {problem.doctor?.username?.charAt(0) || "D"}
                                  </div>
                                  <div>
                                    <p className="text-white font-bold text-sm">Dr. {problem.doctor?.username || "Medical Staff"}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">{problem.doctor?.specialization || "Physician"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {problem.status === 'resolved' && problem.resolvedAt && (
                              <div className="mt-6 pt-4 border-t border-slate-800/50 text-[11px] text-slate-500 font-medium flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                  <CheckCircle size={10} />
                                </div>
                                RESOLVED ON {new Date(problem.resolvedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-800">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                          <Activity size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Your journey is just beginning</h3>
                        <p className="text-slate-500 max-w-xs mx-auto text-sm italic">
                          No clinical problems or health milestones have been recorded yet.
                          Your doctor will populate this timeline as you receive care.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MEDICATIONS TAB */}
            {activeTab === "medications" && (
              <div className="space-y-10 pb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Prescription Overview</h2>
                    <p className="text-slate-400 text-sm">Review your active treatment plan and historical medication data.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl">
                    <Pill className="text-emerald-400" size={20} />
                    <span className="text-emerald-400 font-bold text-sm tracking-wide">
                      {medications.filter(m => m.status === 'active').length} ACTIVE REGIMENS
                    </span>
                  </div>
                </div>

                {/* Known Allergies Banner */}
                {medicalRecord?.allergies?.length > 0 && (
                  <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 flex-shrink-0">
                      <AlertCircle size={28} />
                    </div>
                    <div>
                      <h4 className="text-red-400 font-black uppercase text-xs tracking-[0.2em] mb-1">Critical Allergy Information</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {medicalRecord.allergies.map((a, i) => (
                          <span key={i} className="px-3 py-1 bg-red-500/10 text-red-300 border border-red-500/20 rounded-lg text-sm font-bold uppercase tracking-wider">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Medications */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                      Current Treatment Plan
                    </h3>
                    <div className="h-px flex-1 bg-slate-800"></div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {medications.filter(m => m.status === 'active').length > 0 ? (
                      medications.filter(m => m.status === 'active').map((med) => (
                        <div key={med._id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300 shadow-2xl group overflow-hidden relative">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>

                          <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                                <Pill size={32} />
                              </div>
                              <div>
                                <h4 className="text-2xl font-bold text-white tracking-tight">{med.name}</h4>
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 mt-1 uppercase tracking-widest">
                                  {med.dosageAmount}{med.dosageUnit} • {med.frequency}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800 space-y-1">
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Start Date</span>
                              <p className="text-white font-bold">{new Date(med.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800 space-y-1">
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Cycle End</span>
                              <p className="text-white font-bold">{new Date(med.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                          </div>

                          {med.notes && (
                            <div className="mb-6 bg-slate-800/20 p-4 rounded-2xl border-l-4 border-emerald-500">
                              <span className="text-[10px] text-emerald-500 uppercase font-black tracking-widest block mb-1">Administration Notes</span>
                              <p className="text-slate-300 text-sm italic leading-relaxed">"{med.notes}"</p>
                            </div>
                          )}

                          <div className="flex items-center gap-3 pt-6 border-t border-slate-800/50">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400">Dr</div>
                            <div>
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Prescribed By</p>
                              <p className="text-sm text-white font-bold">Dr. {med.doctor?.username || "Medical Staff"}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-20 text-center bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-800">
                        <Pill className="mx-auto text-slate-700 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-white opacity-60">No Active Prescriptions</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">You don't have any medications listed for your current treatment cycle.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medication History */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mt-10">
                    <h3 className="text-xl font-bold text-slate-400">Treatment History</h3>
                    <div className="h-px flex-1 bg-slate-800"></div>
                  </div>

                  <div className="bg-slate-900/40 rounded-3xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        <tr>
                          <th className="p-6">Medication</th>
                          <th className="p-6">Dosage & Frequency</th>
                          <th className="p-6">Prescribed By</th>
                          <th className="p-6">Date Range</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {medications.filter(m => m.status === 'inactive').map((med) => (
                          <tr key={med._id} className="hover:bg-slate-800/20 transition-colors group">
                            <td className="p-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-emerald-500 transition-colors">
                                  <Pill size={18} />
                                </div>
                                <span className="text-white font-bold">{med.name}</span>
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="text-slate-300 text-sm font-medium">{med.dosageAmount}{med.dosageUnit}</div>
                              <div className="text-slate-500 text-xs tracking-wide">{med.frequency}</div>
                            </td>
                            <td className="p-6">
                              <div className="text-slate-300 text-sm font-bold">Dr. {med.doctor?.username || "Staff"}</div>
                            </td>
                            <td className="p-6">
                              <div className="text-slate-500 text-xs font-mono">
                                {new Date(med.startDate).toLocaleDateString()} - {new Date(med.endDate).toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {medications.filter(m => m.status === 'inactive').length === 0 && (
                          <tr>
                            <td colSpan="4" className="p-10 text-center text-slate-600 italic text-sm">No historical prescription data found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MEDICAL RECORD TAB */}
            {activeTab === "record" && medicalRecord && (
              <div className="space-y-8 pb-10">
                {/* General Medical History */}
                <Section title="Medical History" icon={Calendar}>
                  <ul className="space-y-3">
                    {medicalRecord.medicalHistory?.length > 0 ? medicalRecord.medicalHistory.map((h, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-300 p-3 bg-slate-700/30 rounded-lg border border-slate-700/50">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        {h}
                      </li>
                    )) : <div className="text-slate-500 italic">No medical history recorded</div>}
                  </ul>
                </Section>

                {/* Consultations */}
                <Section title="Consultation History" icon={FileText}>
                  {medicalRecord.consultations?.length > 0 ? (
                    <div className="space-y-4">
                      {medicalRecord.consultations.map((con, i) => (
                        <div key={i} className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/30 hover:border-slate-500/50 transition-colors">
                          <div className="flex justify-between mb-4 border-b border-slate-600/30 pb-3">
                            <div className="font-bold text-white flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs">Dr</div>
                              Dr. {con.doctor?.username || "Doctor"}
                            </div>
                            <div className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">{new Date(con.date).toLocaleDateString()}</div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <span className="text-xs text-green-400 font-bold uppercase tracking-wider block mb-2">Diagnosis</span>
                              <p className="text-slate-200 bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">{con.diagnosis}</p>
                            </div>
                            <div>
                              <span className="text-xs text-blue-400 font-bold uppercase tracking-wider block mb-2">Notes</span>
                              <p className="text-slate-300 italic">{con.notes}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (<EmptyState msg="No consultations recorded" />)}
                </Section>

                {/* Medications */}
                <Section title="Active Medications" icon={Pill}>
                  {medicalRecord.medications?.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {medicalRecord.medications.map((med, i) => (
                        <div key={i} className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30 flex items-start gap-4">
                          <div className="mt-1 p-2 bg-green-500/20 rounded-lg text-green-400">
                            <Pill size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-white text-lg mb-0.5">{med.name}</div>
                            <div className="text-sm text-slate-300 mb-2">{med.dosage} • {med.frequency}</div>
                            <div className="text-xs text-slate-500">
                              {new Date(med.startDate).toLocaleDateString()} - {new Date(med.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (<EmptyState msg="No active medications" />)}
                </Section>

                {/* Lab Results */}
                <Section title="Lab Results" icon={Activity}>
                  {medicalRecord.labResults?.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-slate-700/50">
                      <table className="w-full text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                          <tr>
                            <th className="p-4">Test Name</th>
                            <th className="p-4">Result</th>
                            <th className="p-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50 bg-slate-700/20">
                          {medicalRecord.labResults.map((lab, i) => (
                            <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                              <td className="p-4 text-white font-medium">{lab.testName}</td>
                              <td className="p-4">
                                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-600 text-green-400 text-sm">
                                  {lab.result} {lab.unit}
                                </span>
                              </td>
                              <td className="p-4 text-slate-500 text-sm">{new Date(lab.date).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (<EmptyState msg="No lab results available" />)}
                </Section>

                {/* Diagnoses & Allergies */}
                <div className="grid md:grid-cols-2 gap-8">
                  <Section title="Diagnoses History" icon={Stethoscope}>
                    <ul className="space-y-3">
                      {medicalRecord.diagnoses?.length > 0 ? medicalRecord.diagnoses.map((d, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-300 p-3 bg-slate-700/30 rounded-lg border border-slate-700/50">
                          <div className="w-2 h-2 rounded-full bg-red-400"></div>
                          {d}
                        </li>
                      )) : <div className="text-slate-500 italic">No diagnoses recorded</div>}
                    </ul>
                  </Section>
                  <Section title="Allergies" icon={AlertCircle}>
                    <div className="flex flex-wrap gap-2">
                      {medicalRecord.allergies?.length > 0 ? medicalRecord.allergies.map((a, i) => (
                        <span key={i} className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium flex items-center gap-2">
                          <AlertCircle size={14} /> {a}
                        </span>
                      )) : <span className="text-slate-500 italic">No allergies recorded</span>}
                    </div>
                  </Section>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>

      {/* Booking Modal */}
      < AnimatePresence >
        {isBookingModalOpen && selectedDoctor && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsBookingModalOpen(false)}
          >
            <motion.div
              className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative overflow-hidden"
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Book Appointment</h2>
                <button onClick={() => setIsBookingModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="mb-6 flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-lg border-2 border-slate-600 overflow-hidden">
                  {selectedDoctor.profilePicture ? (
                    <img src={`http://localhost:5000${selectedDoctor.profilePicture}`} alt={selectedDoctor.username} className="w-full h-full object-cover" />
                  ) : (
                    selectedDoctor.username.charAt(0)
                  )}
                </div>
                <div>
                  <div className="font-bold text-white text-lg">Dr. {selectedDoctor.username}</div>
                  <div className="text-green-400 text-sm font-medium">{selectedDoctor.specialization}</div>
                </div>
              </div>

              <form onSubmit={handleBookAppointment} className="s">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Select Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingData.date}
                      onChange={e => {
                        setBookingData({ ...bookingData, date: e.target.value, time: "" });
                        fetchBookedSlots(selectedDoctor._id, e.target.value);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent transition-all"
                    />
                  </div>

                  {bookingData.date && (
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Select Time Slot</label>
                      <select
                        required
                        value={bookingData.time}
                        onChange={e => setBookingData({ ...bookingData, time: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent transition-all"
                      >
                        <option value="">-- Choose a time slot --</option>
                        {availableTimes.filter(t => !bookedSlots.includes(t)).map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {availableTimes.filter(t => !bookedSlots.includes(t)).length === 0 && (
                        <p className="text-rose-400 text-sm italic mt-2">No slots available for this date.</p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Reason for Visit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Regular Checkup, Fever, etc."
                    value={bookingData.reason}
                    onChange={e => setBookingData({ ...bookingData, reason: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent transition-all placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Additional Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Any specific symptoms or questions..."
                    value={bookingData.notes}
                    onChange={e => setBookingData({ ...bookingData, notes: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent transition-all placeholder-slate-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-600/25 transition-all mt-2 transform active:scale-95"
                >
                  Confirm Appointment
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Doctor Profile Modal */}
        {isDoctorProfileOpen && selectedDoctor && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsDoctorProfileOpen(false)}
          >
            <motion.div
              className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row"
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Left Side - Image & Basic Info */}
              <div className="bg-slate-800/50 p-8 flex flex-col items-center justify-center text-center md:w-2/5 border-b md:border-b-0 md:border-r border-slate-700">
                <div className="w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center text-4xl font-bold text-slate-300 mb-6 border-4 border-slate-600 shadow-xl overflow-hidden">
                  {selectedDoctor.profilePicture ? (
                    <img src={`http://localhost:5000${selectedDoctor.profilePicture}`} alt={selectedDoctor.username} className="w-full h-full object-cover" />
                  ) : (
                    selectedDoctor.username.charAt(0)
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Dr. {selectedDoctor.username}</h2>
                <div className="text-green-400 font-medium bg-green-500/10 px-3 py-1 rounded-full text-sm mb-4">
                  {selectedDoctor.specialization}
                </div>
                <div className="flex gap-2">
                  <div className={`w-3 h-3 rounded-full ${selectedDoctor.gender === 'Male' ? 'bg-blue-400' : selectedDoctor.gender === 'Female' ? 'bg-pink-400' : 'bg-purple-400'}`}></div>
                  <span className="text-slate-400 text-sm">{selectedDoctor.gender || "Not Specified"}</span>
                </div>
              </div>

              {/* Right Side - Details */}
              <div className="p-8 md:w-3/5 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-white">Doctor Details</h3>
                  <button onClick={() => setIsDoctorProfileOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Contact Information</span>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-slate-300 bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Activity size={16} /></div>
                        <div>
                          <div className="text-xs text-slate-500">Email</div>
                          {selectedDoctor.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300 bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                        <div className="p-2 bg-green-500/20 text-green-400 rounded-lg"><Activity size={16} /></div>
                        <div>
                          <div className="text-xs text-slate-500">Phone</div>
                          {selectedDoctor.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Professional Info</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                        <div className="text-xs text-slate-500 mb-1">License No.</div>
                        <div className="text-white font-mono text-sm">{selectedDoctor.license}</div>
                      </div>
                      <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                        <div className="text-xs text-slate-500 mb-1">Experience</div>
                        <div className="text-white font-medium">5+ Years</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Clinic Address</span>
                    <div className="text-slate-300 text-sm bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 flex gap-3">
                      <div className="mt-0.5 text-orange-400"><Activity size={16} /></div>
                      {selectedDoctor.address}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-700">
                  <button
                    onClick={() => { setIsDoctorProfileOpen(false); setIsBookingModalOpen(true); }}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-600/25 transition-all"
                  >
                    Book Appointment Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Reschedule Modal */}
        <AnimatePresence>
          {rescheduleData && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRescheduleData(null)}
            >
              <motion.div
                className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/20">
                      <RefreshCw className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Reschedule Appointment</h3>
                      <p className="text-slate-400 text-sm italic">With Dr. {rescheduleData.doctor.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRescheduleData(null)}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Select New Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                          type="date"
                          value={newDate}
                          onChange={(e) => {
                            setNewDate(e.target.value);
                            fetchBookedSlots(rescheduleData.doctor._id, e.target.value);
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-orange-500 outline-none transition-all font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Selected Time</label>
                      <div className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white font-mono flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Clock size={18} className="text-slate-500" />
                          {newTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Available Time Slots</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {availableTimes.map((t) => {
                        const isTaken = bookedSlots.includes(t) && t !== rescheduleData.time;
                        const isActive = newTime === t;
                        return (
                          <button
                            key={t}
                            disabled={isTaken}
                            onClick={() => setNewTime(t)}
                            className={`py-3 rounded-xl text-sm font-bold transition-all border ${isTaken
                              ? "bg-slate-950 text-slate-700 border-slate-900 cursor-not-allowed opacity-50 line-through"
                              : isActive
                                ? "bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-600/20"
                                : "bg-slate-800 text-slate-400 border-slate-700 hover:border-orange-500/50 hover:text-white"
                              }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-800/10 flex justify-end gap-3">
                  <button
                    onClick={() => setRescheduleData(null)}
                    className="px-6 py-3 text-slate-400 font-bold hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRescheduleSubmit}
                    disabled={isRescheduling}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <Save size={20} />
                    {isRescheduling ? "Updating..." : "Confirm Reschedule"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };
  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} backdrop-blur-sm`}>
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

const VitalItem = ({ label, value, unit, icon: Icon, color }) => (
  <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 flex items-center justify-between">
    <div>
      <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">{label}</div>
      <div className="font-bold text-lg text-white">
        {value} <span className="text-xs text-slate-500 font-normal ml-0.5">{unit}</span>
      </div>
    </div>
    <div className={`${color} opacity-80`}>
      <Icon size={20} />
    </div>
  </div>
);

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
      <div className="p-2 rounded-lg bg-slate-700/50 text-green-400"><Icon size={20} /></div>
      {title}
    </h3>
    {children}
  </div>
);

const EmptyState = ({ msg }) => (
  <div className="text-center py-8 text-slate-500 italic text-sm bg-slate-800/20 rounded-xl border border-slate-700/30 border-dashed">
    {msg}
  </div>
);

export default PatientDashboard;

























