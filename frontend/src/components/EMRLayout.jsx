import { User, ClipboardList, Calendar, FilePlus, Settings, LogOut } from "lucide-react";

export default function EMRLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-10">EMR System</h1>

        <nav className="space-y-4">
          {[
            { name: "Dashboard", icon: User },
            { name: "Appointments", icon: Calendar },
            { name: "Medical Records", icon: ClipboardList },
            { name: "Create Record", icon: FilePlus },
            { name: "Settings", icon: Settings }
          ].map((item, i) => (
            <button
              key={i}
              className="flex items-center w-full gap-3 p-3 text-lg rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
            >
              <item.icon size={20} />
              {item.name}
            </button>
          ))}

          <button className="flex items-center w-full gap-3 p-3 text-lg rounded-lg text-red-500 hover:bg-red-50 transition mt-10">
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
