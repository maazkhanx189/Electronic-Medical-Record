import { LayoutDashboard, Users, Settings, LogOut, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-blue-600 mb-8">Admin Panel</h1>

        <nav className="space-y-4 flex-1">
          <Link
            to="/admin"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600"
          >
            <LayoutDashboard size={20} /> Dashboard
          </Link>

          <Link
            to="/admin/users"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600"
          >
            <Users size={20} /> Manage Users
          </Link>

          <Link
            to="/admin/stats"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600"
          >
            <BarChart3 size={20} /> Analytics
          </Link>

          <Link
            to="/admin/settings"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600"
          >
            <Settings size={20} /> Settings
          </Link>
        </nav>

        <button className="flex items-center gap-3 p-3 rounded-lg text-red-500 hover:bg-red-50 mt-4">
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
