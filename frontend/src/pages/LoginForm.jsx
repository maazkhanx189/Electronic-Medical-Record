import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";

const LoginForm = () => {
    const [formData, setFormData] = useState({ email: "", password: "", role: "patient" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let endpoint = "http://localhost:5000/api/auth/login";
            const { role, ...loginData } = formData;

            if (role === "patient") {
                endpoint += "/patient";
            } else if (role === "doctor") {
                endpoint += "/doctor";
            } else if (role === "receptionist") {
                endpoint += "/receptionist";
            }

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            });

            const raw = await res.text();
            let data = {};
            try {
                data = raw ? JSON.parse(raw) : {};
            } catch {
                data = {};
            }

            if (!res.ok) {
                throw new Error(data.msg || data.error || "Login failed");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("userID", data.userID);

            toast.success("Login successful!");

            if (data.role === "admin") {
                navigate("/admin");
            } else if (data.role === "doctor") {
                navigate("/doctor-dashboard");
            } else if (data.role === "patient") {
                navigate("/patient-dashboard");
            } else if (data.role === "receptionist") {
                navigate("/receptionist-dashboard");
            } else if (data.role === "user") {
                if (role === "laboratory") {
                    navigate("/laboratory-dashboard");
                } else {
                    navigate("/user");
                }
            } else {
                navigate("/");
            }
        } catch (err) {
            toast.error(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-green-600/30"
                        >
                            <FiLogIn className="text-white text-3xl" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-slate-400">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-center space-x-2 mb-6">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: "patient" })}
                                className={`flex-1 py-2 rounded-lg font-semibold transition-all ${formData.role === "patient"
                                    ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                            >
                                Patient
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: "doctor" })}
                                className={`flex-1 py-2 rounded-lg font-semibold transition-all ${formData.role === "doctor"
                                    ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                            >
                                Doctor
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: "receptionist" })}
                                className={`flex-1 py-2 rounded-lg font-semibold transition-all ${formData.role === "receptionist"
                                    ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                            >
                                Receptionist
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: "admin" })}
                                className={`flex-1 py-2 rounded-lg font-semibold transition-all ${formData.role === "admin"
                                    ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                            >
                                Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: "laboratory" })}
                                className={`flex-1 py-2 rounded-lg font-semibold transition-all ${formData.role === "laboratory"
                                    ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                            >
                                Laboratory
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>



                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-600/30 hover:shadow-green-600/50 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-400 text-sm">
                            Don't have an account?{" "}
                            <button
                                onClick={() => navigate("/registration")}
                                className="text-green-500 hover:text-green-400 font-semibold transition-colors"
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginForm;
