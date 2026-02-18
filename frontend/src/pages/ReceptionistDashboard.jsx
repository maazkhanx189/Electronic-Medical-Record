import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FileText,
  PlusCircle,
  RefreshCw,
  LogOut,
  Printer,
  DollarSign,
  Clock,
  CheckCircle,
  User,
  Stethoscope,
  Receipt,
  X,
  Activity,
  Calendar,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SIDEBAR_MENUS = [
  { id: "billing", label: "Create Bill", icon: Receipt },
  { id: "invoices", label: "All Invoices", icon: FileText },
  { id: "appointments", label: "Appointments", icon: Calendar },
];

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("billing");
  const [items, setItems] = useState([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [patientEmail, setPatientEmail] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [notes, setNotes] = useState("");
  const [tax, setTax] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [printInvoice, setPrintInvoice] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/appointments/receptionist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const raw = await res.text();
      try {
        const data = raw ? JSON.parse(raw) : [];
        setAppointments(Array.isArray(data) ? data : []);
      } catch {
        setAppointments([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load appointments");
    }
  }, [token]);

  const fetchInvoices = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/invoices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const raw = await res.text();
      try {
        const data = raw ? JSON.parse(raw) : [];
        setInvoices(Array.isArray(data) ? data : []);
      } catch {
        setInvoices([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load invoices");
    }
  }, [token]);

  useEffect(() => {
    if (!token || role !== "receptionist") {
      navigate("/login");
      return;
    }
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/doctors");
        const raw = await res.text();
        let list = [];
        try {
          list = raw ? JSON.parse(raw) : [];
        } catch { }
        if (Array.isArray(list)) setDoctors(list);
      } catch (err) {
        console.error(err);
      }
      fetchInvoices();
      fetchAppointments();
    })();
  }, [navigate, token, role, fetchInvoices, fetchAppointments]);

  const computed = useMemo(() => {
    const calcItems = items.map((it) => ({
      ...it,
      amount: Number(it.quantity || 0) * Number(it.unitPrice || 0),
    }));
    const subtotal = calcItems.reduce((s, it) => s + (it.amount || 0), 0);
    const total = subtotal + Number(tax || 0);
    return { calcItems, subtotal, total };
  }, [items, tax]);

  const addItemRow = () => setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  const updateItem = (i, field, value) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  };
  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const createInvoice = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        patientEmail,
        doctorId: doctorId || undefined,
        items: computed.calcItems,
        subtotal: computed.subtotal,
        tax: Number(tax || 0),
        total: computed.total,
        notes,
      };
      const res = await fetch("http://localhost:5000/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch { }
      if (!res.ok) throw new Error(data.msg || "Failed to create invoice");
      toast.success("Invoice created successfully");
      setPatientEmail("");
      setDoctorId("");
      setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
      setNotes("");
      setTax(0);
      fetchInvoices();
      setActiveTab("invoices");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/invoices/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch { }
      if (!res.ok) throw new Error(data.msg || "Failed to update");
      toast.success("Status updated");
      fetchInvoices();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePrint = (inv) => setPrintInvoice(inv);
  const doPrint = () => {
    window.print();
  };
  const stats = useMemo(() => ({
    total: invoices.length,
    pending: invoices.filter((i) => i.status === "pending").length,
    paid: invoices.filter((i) => i.status === "paid").length,
  }), [invoices]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userID");
    navigate("/login");
  };

  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-200 pt-[80px]">
      {/* Sidebar Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 border-r border-slate-800 h-[calc(100vh-80px)] top-[80px] flex flex-col fixed left-0 z-50 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800 md:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl">
              <Receipt className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Billing
            </span>
          </div>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          {SIDEBAR_MENUS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-medium transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-4 md:p-8 w-full transition-all overflow-x-hidden">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 md:hidden hover:bg-slate-800"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Receptionist Dashboard</h1>
              <p className="text-slate-400 text-sm md:text-base">Billing &amp; invoicing for patients</p>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 flex items-center gap-4"
          >
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <FileText className="text-emerald-400" size={28} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Invoices</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 flex items-center gap-4"
          >
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Clock className="text-amber-400" size={28} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 flex items-center gap-4"
          >
            <div className="p-3 bg-green-500/20 rounded-xl">
              <CheckCircle className="text-green-400" size={28} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Paid</p>
              <p className="text-2xl font-bold text-white">{stats.paid}</p>
            </div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "billing" && (
            <motion.section
              key="billing"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-xl"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <DollarSign className="text-emerald-400" size={24} />
                Create Patient Bill
              </h2>
              <form onSubmit={createInvoice} className="space-y-6 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Patient Email</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                        placeholder="patient@email.com"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Doctor (optional)</label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <select
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500/50"
                        value={doctorId}
                        onChange={(e) => setDoctorId(e.target.value)}
                      >
                        <option value="">Select doctor</option>
                        {doctors.map((d) => (
                          <option key={d._id} value={d._id}>{d.username}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-400">Line items</label>
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <PlusCircle size={16} /> Add line
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 font-medium px-2">
                      <div className="col-span-5">Description</div>
                      <div className="col-span-2">Qty</div>
                      <div className="col-span-2">Unit price</div>
                      <div className="col-span-2">Amount</div>
                      <div className="col-span-1" />
                    </div>
                    {items.map((it, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          className="col-span-5 px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
                          placeholder="e.g. Consultation, Lab test"
                          value={it.description}
                          onChange={(e) => updateItem(i, "description", e.target.value)}
                          required
                        />
                        <input
                          className="col-span-2 px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                        />
                        <input
                          className="col-span-2 px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
                          type="number"
                          min={0}
                          step={0.01}
                          value={it.unitPrice}
                          onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))}
                        />
                        <span className="col-span-2 text-slate-400 text-sm">${(Number(it.quantity || 0) * Number(it.unitPrice || 0)).toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="col-span-1 text-rose-400 hover:text-rose-300 text-sm"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Notes (optional)</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 resize-none"
                    rows={2}
                    placeholder="Payment terms, instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-end gap-6 pt-4 border-t border-slate-700">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Tax ($)</label>
                    <input
                      className="w-28 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      type="number"
                      min={0}
                      step={0.01}
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-8 text-lg">
                    <span className="text-slate-400">Subtotal: <strong className="text-white">${computed.subtotal.toFixed(2)}</strong></span>
                    <span className="text-slate-400">Total: <strong className="text-emerald-400">${computed.total.toFixed(2)}</strong></span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Invoice"}
                  </button>
                </div>
              </form>
            </motion.section>
          )}

          {activeTab === "invoices" && (
            <motion.section
              key="invoices"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="text-emerald-400" size={24} />
                  All Invoices
                </h2>
                <button
                  onClick={fetchInvoices}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-all"
                >
                  <RefreshCw size={16} /> Refresh
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/80 text-slate-400 text-sm font-medium">
                    <tr>
                      <th className="p-4">Patient</th>
                      <th className="p-4">Doctor</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {invoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-medium text-white">{inv.patient?.username || inv.patient?.email || "—"}</td>
                        <td className="p-4 text-slate-400">{inv.doctor?.username || "—"}</td>
                        <td className="p-4 text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 font-semibold text-emerald-400">${Number(inv.total || 0).toFixed(2)}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${inv.status === "paid"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-amber-500/20 text-amber-300"
                              }`}
                          >
                            {inv.status === "paid" ? "Paid" : "Pending"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {inv.status === "pending" ? (
                              <button
                                onClick={() => updateStatus(inv._id, "paid")}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                              >
                                Mark Paid
                              </button>
                            ) : (
                              <button
                                onClick={() => updateStatus(inv._id, "pending")}
                                className="px-3 py-1.5 rounded-lg bg-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-500 transition-colors"
                              >
                                Pending
                              </button>
                            )}
                            <button
                              onClick={() => handlePrint(inv)}
                              className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                              title="Print invoice"
                            >
                              <Printer size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {invoices.length === 0 && (
                  <div className="p-12 text-center text-slate-500">
                    <FileText className="mx-auto mb-3 text-slate-600" size={48} />
                    <p>No invoices yet. Create one from Create Bill.</p>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {activeTab === "appointments" && (
            <motion.section
              key="appointments"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="text-emerald-400" size={24} />
                  Patient Appointments
                </h2>
                <button
                  onClick={fetchAppointments}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-all"
                >
                  <RefreshCw size={16} /> Refresh
                </button>
              </div>
              <p className="text-slate-400 text-sm mb-4">Appointments sent by patients to doctors are listed here.</p>
              <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/80 text-slate-400 text-sm font-medium">
                    <tr>
                      <th className="p-4">Patient</th>
                      <th className="p-4">Doctor</th>
                      <th className="p-4">Date &amp; Time</th>
                      <th className="p-4">Reason</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {appointments.map((apt) => (
                      <tr key={apt._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-white">{apt.patient?.username || "—"}</div>
                          <div className="text-slate-500 text-xs">{apt.patient?.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-300">Dr. {apt.doctor?.username || "—"}</div>
                          <div className="text-slate-500 text-xs">{apt.doctor?.specialization}</div>
                        </td>
                        <td className="p-4 text-slate-400">
                          {new Date(apt.date).toLocaleDateString()} · {apt.time}
                        </td>
                        <td className="p-4 text-slate-400 max-w-xs truncate">{apt.reason || "—"}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${apt.status === "confirmed"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : apt.status === "pending"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : apt.status === "cancelled"
                                    ? "bg-red-500/20 text-red-300"
                                    : "bg-slate-500/20 text-slate-400"
                              }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {appointments.length === 0 && (
                  <div className="p-12 text-center text-slate-500">
                    <Calendar className="mx-auto mb-3 text-slate-600" size={48} />
                    <p>No appointments yet.</p>
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Print invoice modal */}
      <AnimatePresence>
        {printInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setPrintInvoice(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              id="invoice-print-area"
              className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <Activity className="text-white" size={28} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">EMC Healthcare</h1>
                      <p className="text-slate-500 text-sm">Invoice</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>Date: {new Date(printInvoice.createdAt).toLocaleDateString()}</p>
                    <p>Status: <span className="font-semibold text-slate-700">{printInvoice.status}</span></p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bill to</p>
                    <p className="font-semibold text-slate-900">{printInvoice.patient?.username || "Patient"}</p>
                    <p className="text-slate-600 text-sm">{printInvoice.patient?.email}</p>
                  </div>
                  {printInvoice.doctor?.username && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Doctor</p>
                      <p className="font-semibold text-slate-900">Dr. {printInvoice.doctor.username}</p>
                    </div>
                  )}
                </div>
                <table className="w-full text-sm mb-6">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 font-semibold text-slate-600">Description</th>
                      <th className="text-right py-3 font-semibold text-slate-600">Qty</th>
                      <th className="text-right py-3 font-semibold text-slate-600">Unit price</th>
                      <th className="text-right py-3 font-semibold text-slate-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {printInvoice.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="py-3 text-slate-800">{item.description}</td>
                        <td className="py-3 text-right text-slate-600">{item.quantity}</td>
                        <td className="py-3 text-right text-slate-600">${Number(item.unitPrice || 0).toFixed(2)}</td>
                        <td className="py-3 text-right font-medium">${Number(item.amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-slate-200 pt-4 space-y-2 text-right">
                  <p className="text-slate-600">Subtotal: <span className="font-semibold text-slate-900">${Number(printInvoice.subtotal || 0).toFixed(2)}</span></p>
                  {Number(printInvoice.tax || 0) > 0 && (
                    <p className="text-slate-600">Tax: <span className="font-semibold text-slate-900">${Number(printInvoice.tax || 0).toFixed(2)}</span></p>
                  )}
                  <p className="text-lg font-bold text-slate-900">Total: ${Number(printInvoice.total || 0).toFixed(2)}</p>
                </div>
                {printInvoice.notes && (
                  <p className="mt-6 pt-4 border-t border-slate-200 text-slate-600 text-sm">Notes: {printInvoice.notes}</p>
                )}
              </div>
              <div className="flex gap-3 p-6 bg-slate-50 border-t border-slate-200 no-print">
                <button
                  type="button"
                  onClick={() => setPrintInvoice(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={doPrint}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={20} /> Print Invoice
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print-only styles: hide everything except invoice when printing */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-print-area, #invoice-print-area * { visibility: visible !important; }
          #invoice-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
            box-shadow: none !important;
            z-index: 99999 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
