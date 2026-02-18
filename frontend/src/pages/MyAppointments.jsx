import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { Calendar, Clock, X, Save, RefreshCw, Menu } from "lucide-react";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userID = localStorage.getItem('userID');

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token || role !== 'patient') {
      navigate('/login');
      return;
    }
    fetchAppointments();
  }, [token, role, navigate]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/patient/${userID}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch appointments');

      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentID) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${appointmentID}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!res.ok) throw new Error('Failed to cancel appointment');

      // Update the appointment status in the state
      setAppointments(appointments.map(app =>
        app._id === appointmentID ? { ...app, status: 'cancelled' } : app
      ));
      toast.success('Appointment cancelled successfully!');
    } catch (err) {
      toast.error('Failed to cancel appointment: ' + err.message);
    }
  };

  const handleSendToDoctor = (appointment) => {
    alert('Your appointment has been sent to the doctor.');
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
          Authorization: `Bearer ${token}`,
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
      fetchAppointments();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userID');
    navigate('/login');
  };

  if (loading) {
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
            <h1 className="text-4xl font-bold text-white mb-2">My Appointments</h1>
            <p className="text-green-100 text-lg">View and manage your appointments</p>
          </motion.div>

          <motion.div
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {appointments.length === 0 ? (
              <p className="text-slate-400">No appointments found.</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Dr. {appointment.doctor.username} - {appointment.doctor.specialization}
                        </h3>
                        <p className="text-slate-300">
                          Date: {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </p>
                        <p className="text-slate-300">Reason: {appointment.reason}</p>
                        {appointment.notes && <p className="text-slate-300">Notes: {appointment.notes}</p>}
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${appointment.status === 'pending' ? 'bg-yellow-600 text-yellow-100' :
                          appointment.status === 'confirmed' ? 'bg-green-600 text-green-100' :
                            appointment.status === 'completed' ? 'bg-blue-600 text-blue-100' :
                              'bg-red-600 text-red-100'
                          }`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSendToDoctor(appointment)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
                        >
                          Send to Doctor
                        </button>
                        {appointment.status === 'pending' || appointment.status === 'confirmed' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenReschedule(appointment)}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition duration-200 flex items-center gap-2"
                            >
                              <RefreshCw size={16} /> Reschedule
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(appointment._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

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
    </div>
  );
};

export default MyAppointments;
