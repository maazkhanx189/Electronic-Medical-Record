import React from "react";
import { Users, UserCheck, Clock, Activity } from "lucide-react";
import { motion } from "framer-motion";

const DashboardView = ({ totalPatients, totalDoctors, approvedDoctors, pendingDoctors }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
    >
      <StatCard
        variants={item}
        icon={Users}
        label="Total Patients"
        value={totalPatients}
        color="text-blue-400"
        bg="bg-blue-400/10"
        border="border-blue-500/20"
      />
      <StatCard
        variants={item}
        icon={UserCheck}
        label="Total Doctors"
        value={totalDoctors}
        color="text-emerald-400"
        bg="bg-emerald-400/10"
        border="border-emerald-500/20"
      />
      <StatCard
        variants={item}
        icon={Activity}
        label="Approved Doctors"
        value={approvedDoctors}
        color="text-violet-400"
        bg="bg-violet-400/10"
        border="border-violet-500/20"
      />
      <StatCard
        variants={item}
        icon={Clock}
        label="Pending Approvals"
        value={pendingDoctors}
        color="text-amber-400"
        bg="bg-amber-400/10"
        border="border-amber-500/20"
      />
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg, border, variants }) => (
  <motion.div
    variants={variants}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className={`bg-slate-800/40 backdrop-blur-xl border ${border} p-6 rounded-3xl shadow-xl flex items-center gap-5 hover:bg-slate-800/60 transition-all duration-300 group`}
  >
    <div className={`p-4 rounded-2xl ${bg} group-hover:scale-110 transition-transform duration-300`}>
      <Icon className={`w-7 h-7 ${color}`} />
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium tracking-wide mb-1 uppercase opacity-80">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-white">{value}</h3>
        <span className="text-[10px] text-green-400 font-bold bg-green-400/10 px-1.5 py-0.5 rounded tracking-tighter">LIVE</span>
      </div>
    </div>
  </motion.div>
);

export default DashboardView;
