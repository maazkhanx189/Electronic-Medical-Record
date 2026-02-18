import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function ReceptionistRegistration() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    gender: "Other",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/registration/receptionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }
      if (!res.ok) throw new Error(data.msg || "Registration failed");
      toast.success("Registered successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4">Receptionist Registration</h1>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="username" value={form.username} onChange={onChange} placeholder="Username" className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700" required />
          <input type="email" name="email" value={form.email} onChange={onChange} placeholder="Email" className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700" required />
          <input type="password" name="password" value={form.password} onChange={onChange} placeholder="Password" className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700" required />
          <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone" className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700" required />
          <input name="address" value={form.address} onChange={onChange} placeholder="Address" className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 md:col-span-2" required />
          <select name="gender" value={form.gender} onChange={onChange} className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 md:col-span-2">
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <button disabled={loading} className="md:col-span-2 py-2 rounded-lg bg-emerald-500 text-slate-900 font-semibold">
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="text-sm text-slate-400 mt-4">
          Already have an account? <Link className="text-emerald-400" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

