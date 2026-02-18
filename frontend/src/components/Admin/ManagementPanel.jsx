import React, { useState } from "react";
import {
    Search,
    Edit3,
    Trash2,
    Plus,
    Filter,
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Award,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Check,
    X,
    Shield,
    Circle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ManagementPanel = ({
    activeTab,
    displayedList,
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    approveDoctor,
    rejectDoctor,
    loadingDoctorId,
    openEditModal,
    deletePatient,
    deleteDoctor,
    addDoctor,
    addingDoctor,
    addFormData,
    handleAddChange,
    page,
    pages,
    setPage,
    limit,
    setLimit,
    total,
}) => {
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1 }
    };

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-[2rem] shadow-xl flex flex-col lg:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full lg:w-auto overflow-hidden rounded-2xl border border-slate-700/50 focus-within:border-blue-500/50 transition-colors group bg-slate-900/40">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'patients' ? 'patients' : 'doctors'} by name...`}
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-slate-500 focus:outline-none"
                    />
                </div>

                <div className="flex gap-4 w-full lg:w-auto">
                    <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-700/50 p-2 rounded-2xl w-full lg:w-auto">
                        <Filter className="text-slate-500 ml-2" size={18} />
                        <select
                            value={filterRole}
                            onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
                            className="bg-transparent text-white px-3 py-2 focus:outline-none cursor-pointer text-sm font-medium"
                        >
                            <option value="all">Display All</option>
                            <option value="admin">System Admins</option>
                            <option value="user">Standard Users</option>
                        </select>
                    </div>

                    {activeTab === "doctors" && (
                        <button
                            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 font-bold whitespace-nowrap min-w-[140px]"
                        >
                            {isAddFormOpen ? <X size={20} /> : <Plus size={20} />}
                            {isAddFormOpen ? "Cancel" : "Add Doctor"}
                        </button>
                    )}
                </div>
            </div>

            {/* Expandable Add Form */}
            <AnimatePresence>
                {isAddFormOpen && activeTab === "doctors" && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-emerald-500/20 rounded-[2rem] p-8 mb-6 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <Plus className="text-emerald-400" /> Specialist Registration Form
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {['username', 'email', 'password', 'phone', 'address', 'specialization', 'license'].map((field) => (
                                    <div key={field} className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                                            {field === 'username' ? 'Full Name' : field}
                                        </label>
                                        <input
                                            type={field === 'password' ? 'password' : 'text'}
                                            name={field}
                                            value={addFormData[field]}
                                            onChange={handleAddChange}
                                            className="w-full bg-slate-900 border border-slate-700/50 px-5 py-3 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                            placeholder={`Enter ${field}...`}
                                        />
                                    </div>
                                ))}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Gender</label>
                                    <select
                                        name="gender"
                                        value={addFormData.gender}
                                        onChange={handleAddChange}
                                        className="w-full bg-slate-900 border border-slate-700/50 px-5 py-3 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Profile Image</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            name="profilePicture"
                                            onChange={handleAddChange}
                                            accept="image/*"
                                            className="w-full bg-slate-900 border border-slate-700/50 px-5 py-3 rounded-2xl text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={addDoctor}
                                    disabled={addingDoctor}
                                    className={`px-10 py-4 rounded-2xl font-black text-white transition-all shadow-xl shadow-emerald-600/20 ${addingDoctor ? "bg-emerald-600/50 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98]"}`}
                                >
                                    {addingDoctor ? (
                                        <div className="flex items-center gap-2">
                                            <Circle className="animate-pulse w-4 h-4" /> Processing...
                                        </div>
                                    ) : "Generate Provider Account"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List View */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden xl:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em] border-b border-slate-700/50">
                                <th className="px-8 py-6">Identity</th>
                                <th className="px-8 py-6">Communication</th>
                                <th className="px-8 py-6">Specialization / Role</th>
                                <th className="px-8 py-6">Verification</th>
                                <th className="px-8 py-6 text-right">Settings</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-700/30">
                            {displayedList.map((user, idx) => (
                                <motion.tr
                                    variants={item}
                                    initial="hidden"
                                    animate="show"
                                    key={user._id}
                                    className="hover:bg-slate-700/20 transition-colors group"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-800 p-[1px] group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-500">
                                                <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden">
                                                    {user.profilePicture ? (
                                                        <img src={`http://localhost:5000${user.profilePicture}`} alt={user.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-black text-slate-500 group-hover:text-blue-400 transition-colors">
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{user.username}</div>
                                                <div className="text-slate-500 text-xs flex items-center gap-1">
                                                    <MapPin size={10} /> {user.address || "Remote"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="space-y-1">
                                            <div className="text-slate-300 text-xs flex items-center gap-2">
                                                <Mail size={12} className="text-slate-500" /> {user.email}
                                            </div>
                                            <div className="text-slate-400 text-xs flex items-center gap-2">
                                                <Phone size={12} className="text-slate-500" /> {user.phone || "-"}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {activeTab === "doctors" ? (
                                            <div className="space-y-1">
                                                <div className="text-blue-400 font-bold text-sm tracking-tight flex items-center gap-2">
                                                    <Briefcase size={14} /> {user.specialization || "General"}
                                                </div>
                                                <div className="text-[10px] text-slate-500 flex items-center gap-2 uppercase font-bold">
                                                    <Award size={12} /> License: {user.license || "N/A"}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${user.role === "admin" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-slate-700/30 text-slate-400 border border-slate-700"}`}>
                                                {user.role || "Patient"}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        {activeTab === "doctors" ? (
                                            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${user.approvalStatus === "approved"
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                : user.approvalStatus === "rejected"
                                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                }`}>
                                                <Circle size={8} className="fill-current" />
                                                {user.approvalStatus}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-slate-600 italic">User Verified</div>
                                        )}
                                    </td>

                                    <td className="px-8 py-5">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                            {activeTab === "doctors" && user.approvalStatus === "pending" && (
                                                <div className="flex gap-2 mr-2 pr-2 border-r border-slate-700/50">
                                                    <button onClick={() => approveDoctor(user._id)} disabled={loadingDoctorId === user._id} className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10"><Check size={18} /></button>
                                                    <button onClick={() => rejectDoctor(user._id)} disabled={loadingDoctorId === user._id} className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10"><X size={18} /></button>
                                                </div>
                                            )}
                                            <button onClick={() => openEditModal(user, activeTab === "patients" ? "patient" : "doctor")} className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/10"><Edit3 size={18} /></button>
                                            <button onClick={() => (activeTab === "patients" ? deletePatient(user._id) : deleteDoctor(user._id))} className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Small Screens Card View */}
                <div className="xl:hidden p-6 space-y-4">
                    {displayedList.map((user) => (
                        <motion.div
                            key={user._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-6 space-y-6"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 shadow-inner">
                                        {user.profilePicture ? (
                                            <img src={`http://localhost:5000${user.profilePicture}`} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="text-slate-500" size={24} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-lg">{user.username}</h3>
                                        <div className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'doctors' ? (user.approvalStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400') : 'bg-purple-500/10 text-purple-400'}`}>
                                            {activeTab === 'doctors' ? user.approvalStatus : user.role || 'Patient'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-slate-600">
                                    <MoreVertical size={20} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-800/50">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</span>
                                    <p className="text-white text-xs truncate max-w-full">{user.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone</span>
                                    <p className="text-white text-xs">{user.phone || "N/A"}</p>
                                </div>
                                {activeTab === 'doctors' && (
                                    <>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Specialty</span>
                                            <p className="text-blue-400 text-xs font-bold">{user.specialization || "General"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">License</span>
                                            <p className="text-white text-xs">{user.license || "N/A"}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {activeTab === "doctors" && user.approvalStatus === "pending" && (
                                    <>
                                        <button onClick={() => approveDoctor(user._id)} className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-2xl">Verify</button>
                                        <button onClick={() => rejectDoctor(user._id)} className="flex-1 bg-rose-600/20 text-rose-400 font-bold py-3 rounded-2xl">Reject</button>
                                    </>
                                )}
                                <button onClick={() => openEditModal(user, activeTab === "patients" ? "patient" : "doctor")} className="flex-1 bg-blue-600/10 text-blue-400 font-bold py-3 rounded-2xl border border-blue-600/20">Edit</button>
                                <button onClick={() => (activeTab === "patients" ? deletePatient(user._id) : deleteDoctor(user._id))} className="w-14 bg-rose-600/10 text-rose-500 flex items-center justify-center rounded-2xl border border-rose-500/20"><Trash2 size={18} /></button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Modern Pagination */}
                <div className="px-8 py-6 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-700/50">
                    <div className="text-slate-500 text-xs font-medium">
                        Showing results <span className="text-white font-black">{displayedList.length}</span> of <span className="text-white font-black">{total}</span> records
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Per Page</span>
                            <select
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 outline-none cursor-pointer hover:border-slate-500 focus:border-blue-500 transition-all"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="p-2 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-slate-700"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="px-4 py-2 bg-slate-900/80 rounded-xl text-xs font-black text-white border border-slate-700/50">
                                {page} <span className="text-slate-500 mx-1">/</span> {pages}
                            </div>
                            <button
                                disabled={page >= pages}
                                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                                className="p-2 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-slate-700"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagementPanel;
