import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";

const BookAppointments = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [availableTimes] = useState([
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "patient") {
      navigate("/login");
      return;
    }
    fetchDoctors();
    fetchAppointments();
  }, [token, role, navigate]);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/doctors`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch doctors");

      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      toast.error('Failed to fetch doctors: ' + err.message);
    }
  };

  const fetchAppointments = async () => {
    const userID = localStorage.getItem("userID");
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/patient/${userID}`, {
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

  const fetchBookedSlots = async (docId, selectedDate) => {
    if (!docId || !selectedDate) return;
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/booked-slots?doctorID=${docId}&date=${selectedDate}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch slots");

      const data = await res.json();
      setBookedSlots(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userID");
    navigate("/login");
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const userID = localStorage.getItem("userID");

    // Check if patient already has an appointment with this doctor
    const existingAppointment = appointments.find(
      (app) => app.doctor._id === selectedDoctor && (app.status === "pending" || app.status === "confirmed")
    );
    if (existingAppointment) {
      setError("You already have an appointment booked with this doctor.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patient: userID,
          doctor: selectedDoctor,
          date,
          time,
          reason,
          notes,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.msg || "Failed to book appointment");
        toast.error(errorData.msg || "Failed to book appointment");
      } else {
        const data = await res.json();
        toast.success("Appointment booked successfully!");
        // Reset form
        setSelectedDoctor("");
        setDate("");
        setTime("");
        setReason("");
        setNotes("");
        setError("");
        // Refresh appointments
        fetchAppointments();
      }
    } catch (err) {
      toast.error("Failed to book appointment: " + err.message);
      setError("Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  if (doctors.length === 0) {
    return (
      <motion.div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <p className="text-white text-xl">Loading...</p>
      </motion.div>
    );
  }

  return (
    <div className="flex bg-slate-900 min-h-screen">
      <Sidebar userRole="patient" onLogout={handleLogout} sidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} />

      <motion.div
        className={`flex-1 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12 transition-all ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}
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
              Book Appointments
            </h1>
            <p className="text-green-100 text-lg">
              Schedule appointments with doctors
            </p>
          </motion.div>

          <motion.div
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <form onSubmit={handleBookAppointment} className="space-y-6">
              {error && (
                <div className="bg-red-600 text-white p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Select Doctor
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => {
                    setSelectedDoctor(e.target.value);
                    fetchBookedSlots(e.target.value, date);
                  }}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  required
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.username} — {doc.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      fetchBookedSlots(selectedDoctor, e.target.value);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Selected Time
                  </label>
                  <div className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono flex items-center justify-between">
                    <span>{time || "--:--"}</span>
                    {!time && <span className="text-slate-500 text-xs italic">Please select from slots below</span>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                  Available Time Slots
                </label>
                {!selectedDoctor || !date ? (
                  <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-xl p-6 text-center text-slate-500 italic">
                    Please select a doctor and date to see available timings
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {availableTimes.map((t) => {
                      const isBooked = bookedSlots.includes(t);
                      const isSelected = time === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setTime(t)}
                          className={`py-3 rounded-xl text-sm font-bold transition-all border ${isBooked
                            ? "bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed line-through opacity-50"
                            : isSelected
                              ? "bg-green-600 text-white border-green-500 shadow-lg shadow-green-600/20 scale-105"
                              : "bg-slate-900 text-slate-300 border-white/5 hover:border-green-500/50 hover:bg-slate-800"
                            }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Reason for Appointment
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                  rows="3"
                  placeholder="Tell us what's wrong..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                  rows="2"
                  placeholder="Any other details..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
              >
                {loading ? "Booking..." : "Book Appointment"}
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookAppointments;

















