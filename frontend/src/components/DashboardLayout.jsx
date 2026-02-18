import { motion } from "framer-motion";
import { LayoutDashboard, Users, Settings, BarChart3 } from "lucide-react";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 space-y-8">
        <h1 className="text-2xl font-bold text-blue-600">Admin Panel</h1>

        <nav className="space-y-4">
          {[
            { name: "Dashboard", icon: LayoutDashboard },
            { name: "Users", icon: Users },
            { name: "Analytics", icon: BarChart3 },
            { name: "Settings", icon: Settings },
          ].map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
            >
              <item.icon size={20} />
              <span className="text-lg">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
