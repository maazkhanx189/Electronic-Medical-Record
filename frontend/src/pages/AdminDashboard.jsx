import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiSearch, FiEdit2, FiTrash2, FiUsers, FiMenu } from "react-icons/fi";

import Sidebar from "../components/Sidebar";
import ManagementPanel from "../components/Admin/ManagementPanel";
import EditModal from "../components/Admin/EditModal";
import DashboardView from "../components/Admin/DashboardView";
import BackupView from "../components/Admin/BackupView";

const AdminDashboard = () => {
    const [error, setError] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [patients, setPatients] = useState([]);
    const [doctorsAdmin, setDoctorsAdmin] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [totalPatients, setTotalPatients] = useState(0);
    const [totalDoctors, setTotalDoctors] = useState(0);
    const [approvedDoctors, setApprovedDoctors] = useState(0);
    const [pendingDoctors, setPendingDoctors] = useState(0);
    const [loadingDoctorId, setLoadingDoctorId] = useState(null);
    const [addingDoctor, setAddingDoctor] = useState(false);
    const [addFormData, setAddFormData] = useState({
        username: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        specialization: "",
        license: "",
        gender: "",
        profilePicture: null,
    });

    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    useEffect(() => {
        if (!token || role !== "admin") {
            navigate("/login");
            return;
        }

        setIsAdmin(true);
        if (activeTab === "dashboard") fetchDashboardStats();
        else if (activeTab === "patients") fetchPatients();
        else if (activeTab === "doctors") fetchDoctorsAdmin();
    }, [token, role, navigate, activeTab]);

    const displayedList =
        activeTab === "patients" ? patients : doctorsAdmin;

    //fetch patients
    const fetchPatients = async () => {
        try {
            const tokenLocal = localStorage.getItem("token");
            if (!tokenLocal) throw new Error("Not authenticated");

            const params = new URLSearchParams();
            if (searchTerm) params.append("q", searchTerm);
            params.append("page", page);
            params.append("limit", limit);

            const url = `http://localhost:5000/api/auth/patients?${params.toString()}`;
            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenLocal}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Failed to fetch patients");

            setPatients(data.data || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
            setError("");
        } catch (err) {
            toast.error('Failed to fetch doctors: ' + err.message);
            setError(err.message);
            if (err.message.toLowerCase().includes("unauthorized")) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                navigate("/login");
            }
        }
    };

    // fetch Doctors for admin
    const fetchDoctorsAdmin = async () => {
        try {
            const tokenLocal = localStorage.getItem("token");
            if (!tokenLocal) throw new Error("Not authenticated");

            const params = new URLSearchParams();
            if (searchTerm) params.append("q", searchTerm);
            params.append("page", page);
            params.append("limit", limit);

            const url = `http://localhost:5000/api/auth/doctors/manage?${params.toString()}`;
            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenLocal}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Failed to fetch doctors");

            setDoctorsAdmin(data.data || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
            setError("");
        } catch (err) {
            console.error(err);
            setError(err.message);
            if (err.message.toLowerCase().includes("unauthorized")) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                navigate("/login");
            }
        }
    };

    // fetch dashboard stats
    const fetchDashboardStats = async () => {
        try {
            const tokenLocal = localStorage.getItem("token");
            if (!tokenLocal) throw new Error("Not authenticated");

            // Fetch total patients
            const patientsRes = await fetch("http://localhost:5000/api/auth/patients?limit=1", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenLocal}`,
                },
            });
            const patientsData = await patientsRes.json();
            if (patientsRes.ok) {
                setTotalPatients(patientsData.total || 0);
            }

            // Fetch total doctors and counts
            const doctorsRes = await fetch("http://localhost:5000/api/auth/doctors/manage?limit=1000", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenLocal}`,
                },
            });
            const doctorsData = await doctorsRes.json();
            if (doctorsRes.ok) {
                const doctors = doctorsData.data || [];
                setTotalDoctors(doctors.length);
                setApprovedDoctors(doctors.filter(d => d.approvalStatus === "approved").length);
                setPendingDoctors(doctors.filter(d => d.approvalStatus === "pending").length);
            }

            setError("");
        } catch (err) {
            console.error(err);
            setError(err.message);
            if (err.message.toLowerCase().includes("unauthorized")) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                navigate("/login");
            }
        }
    };

    const deletePatient = async (id) => {
        if (!window.confirm("Are you sure you want to delete this patient?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/auth/patients/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Delete failed");

            setPatients((prev) => prev.filter((p) => p._id !== id));
            toast.success("Patient deleted successfully!");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const deleteDoctor = async (id) => {
        if (!window.confirm("Are you sure you want to delete this doctor?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/auth/doctors/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Delete failed");

            setDoctorsAdmin((prev) => prev.filter((d) => d._id !== id));
            toast.success("Doctor deleted successfully!");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const approveDoctor = async (id) => {
        setLoadingDoctorId(id);
        try {
            const res = await fetch(
                `http://localhost:5000/api/auth/doctors/${id}/approve`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Approval failed");

            const updatedDoctor = data.doctor || null;
            if (updatedDoctor) {
                setDoctorsAdmin((prev) => prev.map((doc) => (doc._id === updatedDoctor._id ? updatedDoctor : doc)));
            } else {
                setDoctorsAdmin((prev) => prev.map((doc) => (doc._id === id ? { ...doc, isApproved: true, approvalStatus: "approved" } : doc)));
            }

            toast.success("Doctor approved successfully!");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoadingDoctorId(null);
        }
    };

    const rejectDoctor = async (id) => {
        setLoadingDoctorId(id);
        try {
            const res = await fetch(
                `http://localhost:5000/api/auth/doctors/${id}/reject`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Rejection failed");

            const updatedDoctor = data.doctor || null;
            if (updatedDoctor) {
                setDoctorsAdmin((prev) => prev.map((doc) => (doc._id === updatedDoctor._id ? updatedDoctor : doc)));
            } else {
                setDoctorsAdmin((prev) => prev.map((doc) => (doc._id === id ? { ...doc, isApproved: false, approvalStatus: "rejected" } : doc)));
            }

            toast.success("Doctor rejected successfully!");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoadingDoctorId(null);
        }
    };

    const addDoctor = async () => {
        if (!addFormData.username || !addFormData.email || !addFormData.password || !addFormData.specialization || !addFormData.license || !addFormData.gender) {
            toast.error("Please fill in all required fields");
            return;
        }

        setAddingDoctor(true);
        try {
            const formData = new FormData();
            Object.keys(addFormData).forEach(key => {
                if (key === 'profilePicture' && addFormData[key]) {
                    formData.append('profilePicture', addFormData[key]);
                } else if (addFormData[key] !== null) {
                    formData.append(key, addFormData[key]);
                }
            });
            formData.append('role', 'doctor');
            formData.append('isApproved', 'true');
            formData.append('approvalStatus', 'approved');

            const res = await fetch("http://localhost:5000/api/auth/registration/doctor", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || data.error || "Add doctor failed");

            setDoctorsAdmin((prev) => [data.doctor || data.user, ...prev]);
            setAddFormData({
                username: "",
                email: "",
                password: "",
                phone: "",
                address: "",
                specialization: "",
                license: "",
                gender: "",
                profilePicture: null,
            });
            toast.success("Doctor added successfully!");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setAddingDoctor(false);
        }
    };

    const handleAddChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            setAddFormData((prev) => ({ ...prev, [name]: files[0] }));
        } else {
            setAddFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const openEditModal = (user, type = "user") => {
        setEditingUser({ ...user, __type: type });
        setEditFormData({
            username: user.username || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            role: user.role || "user",
            specialization: user.specialization || "",
            license: user.license || "",
        });
    };

    const closeEditModal = () => {
        setEditingUser(null);
        setEditFormData({});
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === "checkbox" ? checked : value;
        setEditFormData((prev) => ({ ...prev, [name]: val }));
    };

    const submitEdit = async () => {
        if (!editingUser) return;

        try {
            const type = editingUser.__type || "user";

            let url = "";
            if (type === "patient") url = `http://localhost:5000/api/auth/patients/${editingUser._id}`;
            else if (type === "doctor") url = `http://localhost:5000/api/auth/doctors/${editingUser._id}`;

            const res = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editFormData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Update failed");

            if (type === "patient") {
                setPatients((prev) => prev.map((p) => (p._id === editingUser._id ? { ...p, ...editFormData } : p)));
            } else if (type === "doctor") {
                setDoctorsAdmin((prev) => prev.map((d) => (d._id === editingUser._id ? { ...d, ...editFormData } : d)));
            }

            closeEditModal();
            toast.success("Updated successfully!");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userID");
        navigate("/login");
    };

    return (
        <div className="flex bg-slate-900 min-h-screen">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

            {/* Sidebar Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarOpen(false)}
            />

            <div className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} setPage={setPage} handleLogout={handleLogout} />
            </div>

            <div className={`flex-1 w-full p-4 md:p-8 transition-all overflow-x-hidden ${sidebarOpen ? 'md:pl-72' : 'md:pl-20'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 md:hidden hover:bg-slate-700"
                        >
                            <FiMenu size={24} />
                        </button>
                        <motion.div className="text-white" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <h1 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                                Administration
                            </h1>
                            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mt-1">System Control Center</p>
                        </motion.div>
                    </div>
                </div>

                {activeTab === "dashboard" ? (
                    <DashboardView
                        totalPatients={totalPatients}
                        totalDoctors={totalDoctors}
                        approvedDoctors={approvedDoctors}
                        pendingDoctors={pendingDoctors}
                    />
                ) : activeTab === "backup" ? (
                    <BackupView />
                ) : (
                    <ManagementPanel
                        activeTab={activeTab}
                        displayedList={displayedList}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filterRole={filterRole}
                        setFilterRole={setFilterRole}
                        approveDoctor={approveDoctor}
                        rejectDoctor={rejectDoctor}
                        loadingDoctorId={loadingDoctorId}
                        openEditModal={openEditModal}
                        deletePatient={deletePatient}
                        deleteDoctor={deleteDoctor}
                        addDoctor={addDoctor}
                        addingDoctor={addingDoctor}
                        addFormData={addFormData}
                        handleAddChange={handleAddChange}
                        page={page}
                        pages={pages}
                        setPage={setPage}
                        limit={limit}
                        setLimit={setLimit}
                        total={total}
                    />
                )}
            </div>

            <EditModal editingUser={editingUser} editFormData={editFormData} handleEditChange={handleEditChange} closeEditModal={closeEditModal} submitEdit={submitEdit} />
        </div >
    );
};

export default AdminDashboard;
