import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Globe, Heart, CheckCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-green-500/30 pt-20">

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">

        {/* Header */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-green-400 font-bold tracking-wider uppercase text-sm mb-4 block">Who We Are</span>
          <h1 className="text-5xl lg:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Revolutionizing Healthcare <br /> Management
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            We are a team of doctors, developers, and designers dedicated to building the future of medical care administration.
          </p>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 border-y border-slate-700/50 py-12 bg-slate-800/20 backdrop-blur-sm">
          <StatItem number="10k+" label="Active Patients" icon={Users} color="text-blue-400" />
          <StatItem number="500+" label="Specialists" icon={Award} color="text-purple-400" />
          <StatItem number="99%" label="Satisfaction" icon={Heart} color="text-red-400" />
          <StatItem number="24/7" label="Support" icon={Globe} color="text-green-400" />
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <motion.div
            className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-10 border border-slate-700/50 hover:border-green-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-green-900/20 group"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-green-500/20 transition-colors">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-white">Our Mission</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              To provide seamless healthcare management solutions that connect patients,
              doctors, and administrators in a unified, efficient platform. We strive to
              improve healthcare outcomes through technology and compassionate care, ensuring no patient is left behind.
            </p>
          </motion.div>

          <motion.div
            className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-10 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/20 group"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-500/20 transition-colors">
              <Globe className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-white">Our Vision</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              To be the leading global healthcare management platform that empowers medical
              professionals and patients. We envision a world where healthcare is accessible, data-driven, and patient-centric, powered by our innovative solutions.
            </p>
          </motion.div>
        </div>

        {/* Why Choose Us */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-12">Why Choose EMC Healthcare?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Secure & Private"
              desc="Your health data is protected with enterprise-grade security measures and end-to-end encryption."
              borderColor="hover:border-green-500/50"
            />
            <FeatureCard
              title="User-Friendly"
              desc="Intuitive interfaces designed for healthcare professionals and patients of all ages."
              borderColor="hover:border-blue-500/50"
            />
            <FeatureCard
              title="Global Access"
              desc="Access your medical records and consult with doctors from anywhere in the world."
              borderColor="hover:border-purple-500/50"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StatItem = ({ number, label, icon: Icon, color }) => (
  <div className="text-center">
    <div className={`flex justify-center mb-2 ${color}`}>
      <Icon size={28} />
    </div>
    <div className="text-3xl md:text-4xl font-bold text-white mb-1">{number}</div>
    <div className="text-slate-500 font-medium uppercase text-xs tracking-wider">{label}</div>
  </div>
);

const FeatureCard = ({ title, desc, borderColor }) => (
  <div className={`bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 transition-all duration-300 ${borderColor} hover:shadow-lg`}>
    <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>
    <p className="text-slate-400 leading-relaxed">
      {desc}
    </p>
  </div>
);

export default About;
