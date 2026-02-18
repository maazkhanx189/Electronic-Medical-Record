import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, Shield, Users, ArrowRight, Calendar, UserCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative selection:bg-green-500/30">

      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-24">
          <motion.div
            className="lg:w-1/2 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-green-400 text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              The Future of Healthcare Management
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Modern Care <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                Simplified.
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Experience seamless healthcare coordination. Connect with top specialists, manage records, and book appointments with just a few clicks.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                to="/registration"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-lg shadow-lg shadow-green-600/25 hover:shadow-green-600/40 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Get Started Now <ArrowRight size={20} />
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 border border-slate-700 hover:bg-slate-800 rounded-xl font-bold text-lg text-slate-300 hover:text-white transition-all backdrop-blur-sm"
              >
                Learn More
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-slate-500">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-green-500" />
                <span className="text-sm font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-blue-500" />
                <span className="text-sm font-medium">10k+ Patients</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Abstract UI Representation */}
            <div className="relative w-full aspect-square max-w-[500px] mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />

              {/* Floating Cards Effect */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute top-10 right-10 z-20 bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 shadow-2xl max-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className="h-2 w-16 bg-slate-600 rounded mb-1"></div>
                    <div className="h-2 w-10 bg-slate-700 rounded"></div>
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-700/50 rounded"></div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 left-10 z-20 bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 shadow-2xl max-w-[220px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                    <Activity size={20} />
                  </div>
                  <div className="font-bold text-lg">Health Score</div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">98%</div>
                <div className="text-xs text-green-400">+2.4% from last month</div>
              </motion.div>

              <div className="absolute inset-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] border border-slate-700/50 shadow-2xl flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Activity className="text-white w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
                  <p className="text-slate-400">Manage your health journey with confidence.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <FeatureCard
            title="Patient Portal"
            desc="Book appointments, view medical records, and manage your health journey."
            icon={UserCheck}
            link="/login"
            action="Access Portal"
            color="green"
          />
          <FeatureCard
            title="Doctor Dashboard"
            desc="Manage consultations, patient records, and appointments efficiently."
            icon={Activity}
            link="/login"
            action="Doctor Login"
            color="blue"
          />
          <FeatureCard
            title="Admin Control"
            desc="Oversee system operations, manage users, and maintain platform integrity."
            icon={Shield}
            link="/login"
            action="Admin Access"
            color="purple"
          />
        </motion.div>

      </div>
    </div>
  );
};

const FeatureCard = ({ title, desc, icon: Icon, link, action, color }) => {
  const colorClasses = {
    green: "text-green-400 group-hover:text-green-300 bg-green-500/10 group-hover:bg-green-500/20",
    blue: "text-blue-400 group-hover:text-blue-300 bg-blue-500/10 group-hover:bg-blue-500/20",
    purple: "text-purple-400 group-hover:text-purple-300 bg-purple-500/10 group-hover:bg-purple-500/20",
  };

  return (
    <Link to={link} className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl transform transition-transform group-hover:scale-[1.02] duration-300 shadow-xl border border-slate-700/50"></div>
      <div className="relative p-8 h-full flex flex-col items-center text-center">
        <div className={`p-4 rounded-2xl mb-6 transition-colors ${colorClasses[color]}`}>
          <Icon size={32} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 mb-8 leading-relaxed">{desc}</p>
        <div className="mt-auto flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all">
          {action} <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
};

export default Home;
