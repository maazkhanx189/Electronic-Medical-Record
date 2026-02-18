import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Droplets,
  BarChart3,
  LogOut,
  LayoutDashboard,
  FilePlus2,
  ClipboardList,
  ListTodo,
  Menu,
  X
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const LaboratoryDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [summary, setSummary] = useState({
    totalSamplesToday: 0,
    pendingReports: 0,
    criticalAlerts: 0,
    avgTurnaroundMinutes: 0,
    workloadByTest: [],
    recentSamples: [],
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadForm, setUploadForm] = useState({
    email: "",
    testName: "",
    type: "",
    result: "",
    unit: "",
    date: "",
  });
  const [uploadContext, setUploadContext] = useState({
    requestId: "",
    patientName: "",
    patientEmail: "",
    testName: ""
  });
  const [uploadAttachment, setUploadAttachment] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [viewEmail, setViewEmail] = useState("");
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState("");
  const [viewPatient, setViewPatient] = useState(null);
  const [viewResults, setViewResults] = useState([]);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [completedResults, setCompletedResults] = useState([]);
  const [completedLoading, setCompletedLoading] = useState(false);
  const [completedError, setCompletedError] = useState("");
  const [completedFilters, setCompletedFilters] = useState({
    test: "",
    doctorId: "",
    startDate: "",
    endDate: "",
    limit: 20,
    page: 1,
  });
  const [doctors, setDoctors] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState("");
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [fulfillForm, setFulfillForm] = useState({
    requestId: "",
    patientName: "",
    testName: "",
    result: "",
    unit: "",
  });
  const [fulfillLoading, setFulfillLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const profileRes = await fetch("http://localhost:5000/api/auth/profile", {
          headers,
        });

        if (profileRes.ok) {
          const profile = await profileRes.json();
          setUser(profile);
        } else if (profileRes.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        const summaryRes = await fetch(
          "http://localhost:5000/api/auth/laboratory/summary",
          { headers }
        );

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setSummary({
            totalSamplesToday: summaryData.totalSamplesToday ?? 0,
            pendingReports: summaryData.pendingReports ?? 0,
            criticalAlerts: summaryData.criticalAlerts ?? 0,
            avgTurnaroundMinutes: summaryData.avgTurnaroundMinutes ?? 0,
            workloadByTest: summaryData.workloadByTest || [],
            recentSamples: summaryData.recentSamples || [],
          });
        } else {
          setError("Unable to load laboratory summary");
        }
      } catch {
        setError("Unable to load laboratory summary");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleUploadChange = (e) => {
    const { name, value } = e.target;
    setUploadForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadMessage("");
    setUploadError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      let res;
      if (uploadContext.requestId) {
        res = await fetch("http://localhost:5000/api/auth/laboratory/fulfill", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requestId: uploadContext.requestId,
            result: uploadForm.result,
            unit: uploadForm.unit,
            date: uploadForm.date ? new Date(uploadForm.date).toISOString() : undefined
          }),
        });
      } else {
        const formData = new FormData();
        formData.append("email", uploadForm.email);
        formData.append("testName", uploadForm.testName);
        if (uploadForm.type) formData.append("type", uploadForm.type);
        formData.append("result", uploadForm.result);
        if (uploadForm.unit) formData.append("unit", uploadForm.unit);
        if (uploadForm.date) formData.append("date", new Date(uploadForm.date).toISOString());
        if (uploadAttachment) formData.append("attachment", uploadAttachment);
        res = await fetch("http://localhost:5000/api/auth/laboratory/results", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || data.error || "Failed to save lab result");
      }
      setUploadMessage(uploadContext.requestId ? "Result submitted and sent to the ordering doctor" : "Lab result recorded successfully");
      setUploadForm({
        email: "",
        testName: "",
        type: "",
        result: "",
        unit: "",
        date: "",
      });
      setUploadAttachment(null);
      setUploadContext({
        requestId: "",
        patientName: "",
        patientEmail: "",
        testName: ""
      });
      if (activeTab !== "pending") {
        setActiveTab("pending");
      }
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleViewSubmit = async (e) => {
    e.preventDefault();
    setViewLoading(true);
    setViewError("");
    setViewPatient(null);
    setViewResults([]);
    setShowAllCompleted(false);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const params = new URLSearchParams({ email: viewEmail });
      const res = await fetch(
        `http://localhost:5000/api/auth/laboratory/results?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || data.error || "Failed to load lab results");
      }
      const data = await res.json();
      setViewPatient(data.patient);
      setViewResults(data.labResults || []);
    } catch (err) {
      setViewError(err.message);
    } finally {
      setViewLoading(false);
    }
  };
  const handleFetchAllCompleted = async () => {
    setCompletedLoading(true);
    setCompletedError("");
    setShowAllCompleted(true);
    setViewPatient(null);
    setViewResults([]);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const params = new URLSearchParams();
      if (completedFilters.test) params.append("test", completedFilters.test);
      if (completedFilters.doctorId) params.append("doctorId", completedFilters.doctorId);
      if (completedFilters.startDate) params.append("startDate", completedFilters.startDate);
      if (completedFilters.endDate) params.append("endDate", completedFilters.endDate);
      params.append("page", String(completedFilters.page || 1));
      params.append("limit", String(completedFilters.limit || 20));
      const res = await fetch(`http://localhost:5000/api/auth/laboratory/completed?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || data.error || "Failed to load completed results");
      }
      const data = await res.json();
      setCompletedResults(data.data || []);
      setCompletedFilters((prev) => ({
        ...prev,
        page: data.page || prev.page,
        limit: prev.limit,
      }));
      setSummary((s) => ({ ...s })); // no-op to trigger re-render if needed
    } catch (err) {
      setCompletedError(err.message);
    } finally {
      setCompletedLoading(false);
    }
  };
  const fetchDoctors = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/doctors");
      if (!res.ok) return;
      const list = await res.json();
      setDoctors(list || []);
    } catch { }
  }, []);
  useEffect(() => {
    if (showAllCompleted) {
      fetchDoctors();
    }
  }, [showAllCompleted, fetchDoctors]);
  const fetchPendingRequests = useCallback(async () => {
    setPendingLoading(true);
    setPendingError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await fetch("http://localhost:5000/api/auth/laboratory/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || data.error || "Failed to load pending requests");
      }
      const data = await res.json();
      setPendingRequests(data || []);
    } catch (err) {
      setPendingError(err.message);
    } finally {
      setPendingLoading(false);
    }
  }, [navigate]);
  const openFulfillModal = (req) => {
    setUploadForm({
      email: req.patientEmail || "",
      testName: req.testName || "",
      type: "",
      result: "",
      unit: "",
      date: ""
    });
    setUploadContext({
      requestId: req._id || "",
      patientName: req.patientName || "",
      patientEmail: req.patientEmail || "",
      testName: req.testName || ""
    });
    setActiveTab("upload");
  };
  const handleFulfillSubmit = async (e) => {
    e.preventDefault();
    setFulfillLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await fetch("http://localhost:5000/api/auth/laboratory/fulfill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId: fulfillForm.requestId,
          result: fulfillForm.result,
          unit: fulfillForm.unit,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || data.error || "Failed to submit result");
      }
      setShowFulfillModal(false);
      setFulfillForm({
        requestId: "",
        patientName: "",
        testName: "",
        result: "",
        unit: "",
      });
      fetchPendingRequests();
    } catch (err) {
      setPendingError(err.message);
    } finally {
      setFulfillLoading(false);
    }
  };
  useEffect(() => {
    if (activeTab === "pending") {
      fetchPendingRequests();
    }
  }, [activeTab, fetchPendingRequests]);

  const totalToday = summary.totalSamplesToday;
  const totalPending = summary.pendingReports;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white pt-20">
      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col lg:flex-row gap-8">
        <aside
          className={`
            fixed inset-y-0 left-0 z-[70] w-72 bg-slate-950 border-r border-slate-800 p-6 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-0 lg:w-64 lg:shrink-0 lg:bg-slate-950/60 lg:border lg:rounded-3xl lg:h-fit lg:sticky lg:top-28
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex items-center justify-between lg:justify-start gap-3 mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Laboratory</p>
                <p className="text-sm font-black text-white truncate max-w-[140px]">
                  {user?.username || "Workspace Admin"}
                </p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
              { id: 'pending', label: 'Pending Requests', icon: ListTodo, badge: summary.pendingReports },
              { id: 'upload', label: 'Upload Test Result', icon: FilePlus2 },
              { id: 'view', label: 'Patient Records', icon: ClipboardList }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all border ${activeTab === item.id
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                  : "text-slate-400 hover:bg-slate-900 border-transparent hover:text-slate-200"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.id === 'pending' && item.badge > 0 && (
                  <span className="ml-auto bg-amber-500/20 text-amber-300 text-[10px] py-0.5 px-2 rounded-lg font-black tracking-tighter">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="pt-6 mt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-rose-500/5 text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-300 text-sm font-black transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>
        <div className="flex-1 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="p-3 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-500 shadow-lg shadow-emerald-500/30"
                >
                  <FlaskConical className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Laboratory Dashboard
                  </h1>
                  <p className="text-slate-400 text-sm md:text-base">
                    Overview of today&apos;s samples, workloads, and critical alerts
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm text-slate-400">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span className="text-xs text-slate-500">
                {user?.username ? `Signed in as ${user.username}` : "Laboratory workspace"}
              </span>
            </div>
          </div>

          {error && activeTab === "overview" && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          {activeTab === "pending" && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-lg font-semibold">Pending Lab Requests</h2>
                  </div>
                  <button
                    onClick={fetchPendingRequests}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Refresh List
                  </button>
                </div>
                {pendingError && (
                  <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {pendingError}
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800 text-sm">
                    <thead className="bg-slate-900/60">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Patient</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Test</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Doctor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Requested</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-950/60 divide-y divide-slate-800">
                      {pendingLoading ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-6 text-center text-slate-400">Loading...</td>
                        </tr>
                      ) : pendingRequests.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-6 text-center text-slate-400">No pending requests</td>
                        </tr>
                      ) : (
                        pendingRequests.map((req) => (
                          <tr key={req._id}>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-200 font-medium">{req.patientName}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">{req.patientEmail}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">{req.testName}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">{req.doctorName || "-"}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                              {req.requestDate ? new Date(req.requestDate).toLocaleString() : "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <button
                                onClick={() => openFulfillModal(req)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-semibold transition-all"
                              >
                                Fulfill
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {loading ? (
                <div className="h-40 flex items-center justify-center text-slate-300">
                  Loading laboratory dashboard...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="bg-slate-900/70 border border-emerald-500/30 rounded-2xl p-5 shadow-lg shadow-emerald-500/10">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-emerald-300/80">
                            Samples Today
                          </p>
                          <p className="text-2xl font-bold mt-1">{totalToday}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-500/15">
                          <Droplets className="w-5 h-5 text-emerald-300" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">
                        Includes all collected and processed samples for the current day.
                      </p>
                    </div>

                    <div className="bg-slate-900/70 border border-amber-400/30 rounded-2xl p-5 shadow-lg shadow-amber-500/10">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-amber-300/80">
                            Pending Reports
                          </p>
                          <p className="text-2xl font-bold mt-1">{totalPending}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-500/15">
                          <Clock className="w-5 h-5 text-amber-300" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">
                        Samples awaiting validation or report sign-off.
                      </p>
                    </div>

                    <div className="bg-slate-900/70 border border-rose-500/40 rounded-2xl p-5 shadow-lg shadow-rose-500/10">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-rose-300/80">
                            Critical Alerts
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            {summary.criticalAlerts ?? 0}
                          </p>
                        </div>
                        <div className="p-2 rounded-xl bg-rose-500/15">
                          <AlertTriangle className="w-5 h-5 text-rose-300" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">
                        Abnormal results that require urgent clinical attention.
                      </p>
                    </div>

                    <div className="bg-slate-900/70 border border-blue-500/30 rounded-2xl p-5 shadow-lg shadow-blue-500/10">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-blue-300/80">
                            Avg Turnaround
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            {summary.avgTurnaroundMinutes
                              ? `${summary.avgTurnaroundMinutes} min`
                              : "—"}
                          </p>
                        </div>
                        <div className="p-2 rounded-xl bg-blue-500/15">
                          <Activity className="w-5 h-5 text-blue-300" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">
                        Average time from sample collection to final report.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 lg:col-span-2 shadow-xl shadow-black/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-emerald-400" />
                          <h2 className="text-lg font-semibold">Workload by Test Type</h2>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Today
                        </span>
                      </div>

                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={summary.workloadByTest}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                            <XAxis dataKey="test" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#020617",
                                borderColor: "#1e293b",
                                borderRadius: 12,
                              }}
                            />
                            <Bar
                              dataKey="completed"
                              stackId="a"
                              fill="#22c55e"
                              radius={[6, 6, 0, 0]}
                            />
                            <Bar
                              dataKey="pending"
                              stackId="a"
                              fill="#fbbf24"
                              radius={[6, 6, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-black/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <h2 className="text-lg font-semibold">Quality Snapshot</h2>
                        </div>
                      </div>
                      <div className="space-y-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">On-time reports</span>
                          <span className="font-semibold text-emerald-400">92%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full w-[92%] bg-gradient-to-r from-emerald-500 to-emerald-300" />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Rejected samples</span>
                          <span className="font-semibold text-amber-400">3%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full w-[3%] bg-gradient-to-r from-amber-500 to-amber-300" />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Critical calls logged</span>
                          <span className="font-semibold text-rose-400">7</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Monitor these indicators to keep the laboratory workflow safe and efficient.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl shadow-black/30 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-lg font-semibold">Recent Samples</h2>
                      </div>
                      <span className="text-xs text-slate-400">
                        Showing {summary.recentSamples.length} of{" "}
                        {summary.recentSamples.length} samples
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-800 text-sm">
                        <thead className="bg-slate-900/60">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Sample ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Patient
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Test
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Priority
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Collected
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Reported
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-950/60 divide-y divide-slate-800">
                          {summary.recentSamples.map((sample) => (
                            <tr key={sample.id} className="hover:bg-slate-900/70">
                              <td className="px-4 py-3 whitespace-nowrap text-slate-200 font-medium">
                                {sample.id}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                                {sample.patient}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                                {sample.test}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${sample.priority === "Stat"
                                    ? "bg-rose-500/10 text-rose-300 border border-rose-400/40"
                                    : sample.priority === "Urgent"
                                      ? "bg-amber-500/10 text-amber-300 border border-amber-400/40"
                                      : "bg-emerald-500/10 text-emerald-300 border border-emerald-400/30"
                                    }`}
                                >
                                  {sample.priority}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${sample.status === "Completed"
                                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/40"
                                    : sample.status === "In Progress"
                                      ? "bg-blue-500/10 text-blue-300 border border-blue-400/40"
                                      : "bg-slate-700/60 text-slate-300 border border-slate-600/60"
                                    }`}
                                >
                                  {sample.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                                {sample.collectedAt}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                                {sample.reportedAt}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "upload" && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FilePlus2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold">Upload lab test result</h2>
                </div>
              </div>
              {uploadError && (
                <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {uploadError}
                </div>
              )}
              {uploadMessage && (
                <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {uploadMessage}
                </div>
              )}
              <form
                onSubmit={handleUploadSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Patient email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={uploadForm.email}
                    onChange={handleUploadChange}
                    className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                    placeholder="patient@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Test name
                  </label>
                  <select
                    name="testName"
                    required
                    value={uploadForm.testName}
                    onChange={handleUploadChange}
                    className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
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
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Test type (sample)
                  </label>
                  <select
                    name="type"
                    value={uploadForm.type}
                    onChange={handleUploadChange}
                    className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
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
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Result</label>
                  <input
                    type="text"
                    name="result"
                    required
                    value={uploadForm.result}
                    onChange={handleUploadChange}
                    className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                    placeholder="5.4"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Unit (optional)
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={uploadForm.unit}
                    onChange={handleUploadChange}
                    className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                    placeholder="g/dL"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Result date and time (optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={uploadForm.date}
                    onChange={handleUploadChange}
                    className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-slate-300">
                    Upload image (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setUploadAttachment(e.target.files?.[0] || null)}
                    className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  />
                  <p className="text-xs text-slate-500">JPEG, PNG, WebP up to 5MB</p>
                </div>
                <div className="md:col-span-2 flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {uploadLoading ? "Saving..." : "Save result"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "view" && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-lg font-semibold">View patient lab results</h2>
                  </div>
                </div>
                {viewError && (
                  <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {viewError}
                  </div>
                )}
                <form
                  onSubmit={handleViewSubmit}
                  className="flex flex-col md:flex-row gap-3 items-stretch md:items-end"
                >
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-slate-300">
                      Patient email
                    </label>
                    <input
                      type="email"
                      required
                      value={viewEmail}
                      onChange={(e) => setViewEmail(e.target.value)}
                      className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                      placeholder="patient@example.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={viewLoading}
                    className="md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {viewLoading ? "Searching..." : "Search"}
                  </button>
                  <button
                    type="button"
                    onClick={handleFetchAllCompleted}
                    disabled={completedLoading}
                    className="md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {completedLoading ? "Loading..." : "Show All Completed"}
                  </button>
                </form>
              </div>

              {showAllCompleted ? (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl shadow-black/30 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">All Completed Results</h3>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          type="text"
                          placeholder="Filter by test"
                          value={completedFilters.test}
                          onChange={(e) => setCompletedFilters({ ...completedFilters, test: e.target.value, page: 1 })}
                          className="rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                        />
                        <select
                          value={completedFilters.doctorId}
                          onChange={(e) => setCompletedFilters({ ...completedFilters, doctorId: e.target.value, page: 1 })}
                          className="rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                        >
                          <option value="">All doctors</option>
                          {doctors.map((d) => (
                            <option key={d._id} value={d._id}>{d.username}</option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={completedFilters.startDate}
                          onChange={(e) => setCompletedFilters({ ...completedFilters, startDate: e.target.value, page: 1 })}
                          className="rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                        />
                        <input
                          type="date"
                          value={completedFilters.endDate}
                          onChange={(e) => setCompletedFilters({ ...completedFilters, endDate: e.target.value, page: 1 })}
                          className="rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={handleFetchAllCompleted}
                          className="md:col-span-4 rounded-xl bg-emerald-500 text-slate-950 px-4 py-2 text-sm font-semibold"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">
                        Showing {completedResults.length} results (page {completedFilters.page})
                      </span>
                    </div>
                  </div>
                  {completedError && (
                    <div className="m-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                      {completedError}
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800 text-sm">
                      <thead className="bg-slate-900/60">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Patient</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Test</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Result</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Unit</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-slate-950/60 divide-y divide-slate-800">
                        {completedResults.map((r, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-200 font-medium">{r.patientName}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">{r.patientEmail}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">{r.testName}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">{r.result}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">{r.unit || "—"}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                              {r.date ? new Date(r.date).toLocaleString() : "—"}
                            </td>
                          </tr>
                        ))}
                        {completedResults.length === 0 && !completedLoading && (
                          <tr>
                            <td colSpan="6" className="px-4 py-6 text-center text-slate-400 text-sm">
                              No completed results found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={completedFilters.page <= 1 || completedLoading}
                        onClick={() => {
                          setCompletedFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
                          handleFetchAllCompleted();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition-all disabled:opacity-60"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        disabled={completedLoading}
                        onClick={() => {
                          setCompletedFilters((prev) => ({ ...prev, page: prev.page + 1 }));
                          handleFetchAllCompleted();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition-all disabled:opacity-60"
                      >
                        Next
                      </button>
                    </div>
                    <div className="text-xs text-slate-400">
                      Page {completedFilters.page}
                    </div>
                  </div>
                </div>
              ) : viewPatient && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl shadow-black/30 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">
                        {viewPatient.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {viewPatient.gender} • {viewPatient.age || "Age N/A"} •{" "}
                        {viewPatient.email}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {viewResults.length} lab results
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800 text-sm">
                      <thead className="bg-slate-900/60">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Test
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Result
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Unit
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-slate-950/60 divide-y divide-slate-800">
                        {viewResults.map((lab) => (
                          <tr key={lab._id || `${lab.testName}-${lab.date}`}>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-200 font-medium">
                              {lab.testName}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                              {lab.result}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                              {lab.unit || "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                              {lab.date
                                ? new Date(lab.date).toLocaleString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                                : "—"}
                            </td>
                          </tr>
                        ))}
                        {viewResults.length === 0 && (
                          <tr>
                            <td
                              colSpan="4"
                              className="px-4 py-6 text-center text-slate-400 text-sm"
                            >
                              No lab results recorded for this patient yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fulfill Modal */}
      {showFulfillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Fulfill Lab Request</h3>

            <div className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <span className="text-slate-200 font-medium">{fulfillForm.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Test:</span>
                <span className="text-slate-200 font-medium">{fulfillForm.testName}</span>
              </div>
            </div>

            <form onSubmit={handleFulfillSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Result Value</label>
                <input
                  type="text"
                  required
                  value={fulfillForm.result}
                  onChange={(e) => setFulfillForm({ ...fulfillForm, result: e.target.value })}
                  className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  placeholder="Enter test result"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Unit (Optional)</label>
                <input
                  type="text"
                  value={fulfillForm.unit}
                  onChange={(e) => setFulfillForm({ ...fulfillForm, unit: e.target.value })}
                  className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  placeholder="e.g. mg/dL"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowFulfillModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fulfillLoading}
                  className="flex-1 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-sm font-semibold transition-all disabled:opacity-60"
                >
                  {fulfillLoading ? "Submitting..." : "Submit Result"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaboratoryDashboard;
