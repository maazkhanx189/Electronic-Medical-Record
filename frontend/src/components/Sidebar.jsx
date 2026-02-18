import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Database,
  Shield
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const Sidebar = ({
  userRole,
  onLogout,
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  setPage,
  handleLogout
}) => {
  const navigate = useNavigate();

  // If sidebarOpen is provided, it's admin style
  const isAdmin = sidebarOpen !== undefined;

  const handleLogoutClick = () => {
    if (handleLogout) handleLogout();
    else if (onLogout) onLogout();
  };

  const handleTabChange = (tab) => {
    if (setActiveTab) {
      setActiveTab(tab);
      if (setPage) setPage(1);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (isAdmin) {
    // Admin Sidebar
    const adminMenuItems = [
      { name: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { name: 'patients', label: 'Patients', icon: Users },
      { name: 'doctors', label: 'Doctors', icon: UserCheck },
      { name: 'backup', label: 'Backup & Recovery', icon: Database },
    ];

    return (
      <motion.aside
        className={`fixed top-0 left-0 h-full bg-slate-900/40 backdrop-blur-2xl text-white shadow-[20px_0_40px_rgba(0,0,0,0.3)] z-50 transition-all duration-500 border-r border-white/5 ${sidebarOpen ? 'w-72' : 'w-20'}`}
        initial={{ x: -256 }}
        animate={{ x: 0 }}
      >
        <div className="flex flex-col h-full py-8">
          <div className="px-6 mb-10 flex items-center justify-between">
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Shield className="text-white" size={20} />
                  </div>
                  <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 font-sans">EMS Admin</h1>
                </motion.div>
              )}
            </AnimatePresence>
            {!sidebarOpen && (
              <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="text-white" size={20} />
              </div>
            )}
          </div>

          <nav className="flex-1 px-4 space-y-3">
            {adminMenuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleTabChange(item.name)}
                className={`w-full group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative ${activeTab === item.name
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
              >
                <div className={`flex-shrink-0 transition-transform duration-300 ${activeTab === item.name ? 'scale-110' : 'group-hover:rotate-12'}`}>
                  <item.icon size={22} strokeWidth={activeTab === item.name ? 2.5 : 2} />
                </div>
                {sidebarOpen && (
                  <span className={`font-bold tracking-tight ${activeTab === item.name ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                    {item.label}
                  </span>
                )}
                {activeTab === item.name && (
                  <motion.div
                    layoutId="activeTabAdmin"
                    className="absolute inset-0 bg-blue-600 rounded-2xl -z-10 shadow-xl shadow-blue-600/40"
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="px-4 mt-auto">
            <button
              onClick={handleLogoutClick}
              className="w-full group flex items-center gap-4 p-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all duration-300"
            >
              <div className="group-hover:-translate-x-1 transition-transform">
                <LogOut size={22} />
              </div>
              {sidebarOpen && <span className="font-bold tracking-tight text-sm">System Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>
    );
  } else {
    // Role-based Sidebar for patients and doctors
    const menuItems = {
      patient: [
        { label: 'Book Appointments', icon: Calendar, path: '/book-appointments' },
        { label: 'My Appointments', icon: FileText, path: '/my-appointments' },
        { label: 'Profile', icon: User, path: '/profile' },
      ],
      doctor: [
        { label: 'Consultations', icon: FileText, path: '/consultations' },
        { label: 'Profile', icon: User, path: '/profile' },
      ],
    };

    const items = menuItems[userRole] || [];

    return (
      <>
        {/* Mobile Backdrop */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setSidebarOpen(false)}
        />

        <motion.aside
          className={`fixed top-0 left-0 h-full bg-slate-900 shadow-2xl z-50 transition-all duration-300 border-r border-slate-800 ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}
          initial={{ x: -256 }}
          animate={{ x: 0 }}
        >
          <div className="flex flex-col h-full py-8">
            <div className="px-6 mb-10 flex items-center justify-between">
              {sidebarOpen ? (
                <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                  {userRole.toUpperCase()} <span className="text-slate-500 font-light">EMS</span>
                </h1>
              ) : (
                <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Activity className="text-white" size={20} />
                </div>
              )}
            </div>

            <nav className="flex-1 px-4 space-y-2">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${sidebarOpen ? 'justify-start' : 'justify-center'} hover:bg-slate-800 text-slate-400 hover:text-white`}
                >
                  <item.icon size={22} className="flex-shrink-0" />
                  {sidebarOpen && <span className="font-bold tracking-tight">{item.label}</span>}
                </button>
              ))}
            </nav>

            <div className="px-4 mt-auto">
              <button
                onClick={handleLogoutClick}
                className={`w-full group flex items-center gap-4 p-4 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all duration-300 ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
              >
                <LogOut size={22} className="flex-shrink-0" />
                {sidebarOpen && <span className="font-bold tracking-tight text-sm">Logout</span>}
              </button>
            </div>
          </div>
        </motion.aside>
      </>
    );
  }
};

export default Sidebar;
