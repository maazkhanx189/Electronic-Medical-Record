import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const EditModal = ({ editingUser, editFormData, handleEditChange, closeEditModal, submitEdit }) => {
    return (
        <AnimatePresence>
            {editingUser && (
                <motion.div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[999]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeEditModal}
                >
                    <motion.div
                        className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-6 text-white">
                            Edit {editingUser.__type === "doctor" ? "Doctor" : editingUser.__type === "patient" ? "Patient" : "User"}
                        </h2>

                        <div className="space-y-4">
                            <input
                                type="text"
                                name="username"
                                value={editFormData.username || ""}
                                onChange={handleEditChange}
                                placeholder="Username"
                                className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                            <input
                                type="email"
                                name="email"
                                value={editFormData.email || ""}
                                onChange={handleEditChange}
                                placeholder="Email"
                                className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                            <input
                                type="text"
                                name="phone"
                                value={editFormData.phone || ""}
                                onChange={handleEditChange}
                                placeholder="Phone"
                                className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                            <input
                                type="text"
                                name="address"
                                value={editFormData.address || ""}
                                onChange={handleEditChange}
                                placeholder="Address"
                                className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />

                            <div className="flex gap-4 p-2">
                                <label className="flex gap-2 items-center text-slate-300 cursor-pointer hover:text-white transition-colors">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="user"
                                        checked={editFormData.role === "user"}
                                        onChange={handleEditChange}
                                        className="accent-indigo-500 w-4 h-4"
                                    />
                                    User
                                </label>
                                <label className="flex gap-2 items-center text-slate-300 cursor-pointer hover:text-white transition-colors">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="admin"
                                        checked={editFormData.role === "admin"}
                                        onChange={handleEditChange}
                                        className="accent-indigo-500 w-4 h-4"
                                    />
                                    Admin
                                </label>
                            </div>

                            {editingUser.__type === "doctor" && (
                                <>
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={editFormData.specialization || ""}
                                        onChange={handleEditChange}
                                        placeholder="Specialization"
                                        className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    />
                                    <input
                                        type="text"
                                        name="license"
                                        value={editFormData.license || ""}
                                        onChange={handleEditChange}
                                        placeholder="License Number"
                                        className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    />
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={closeEditModal}
                                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitEdit}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all font-medium transform hover:scale-[1.02]"
                            >
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditModal;
