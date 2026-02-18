import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, FileText, Users, Shield, Clock, Heart, ArrowRight } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Calendar,
      title: 'Instant Scheduling',
      description: 'Book appointments with specialists in real-time. No waiting on hold, just instant confirmation.',
      color: 'blue'
    },
    {
      icon: FileText,
      title: 'Digital Records',
      description: 'Secure, centralized access to your complete medical history, prescriptions, and lab results.',
      color: 'green'
    },
    {
      icon: Users,
      title: 'Telemedicine',
      description: 'Connect with doctors via high-quality video calls from the comfort of your home.',
      color: 'purple'
    },
    {
      icon: Shield,
      title: 'Secure Data',
      description: 'Your health data is encrypted with bank-level security protocols for maximum privacy.',
      color: 'indigo'
    },
    {
      icon: Clock,
      title: '24/7 Access',
      description: 'Our platform never sleeps. Access your health information and support whenever you need it.',
      color: 'orange'
    },
    {
      icon: Heart,
      title: 'Specialized Care',
      description: 'Access a wide network of specialists dedicated to providing top-tier medical attention.',
      color: 'red'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-green-500/30 pt-20">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-green-400 font-bold tracking-wider uppercase text-sm mb-4 block">World Class Care</span>
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Our Medical Services
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            We combine advanced technology with compassionate care to provide a comprehensive healthcare ecosystem.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {services.map((service, index) => (
            <FeatureCard key={index} {...service} variants={itemVariants} />
          ))}
        </motion.div>

        <motion.div
          className="mt-24 text-center bg-gradient-to-br from-slate-800 to-slate-900 p-12 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-700/[0.1] -z-0" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6 text-white">Ready to prioritize your health?</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto text-lg">
              Join thousands of patients who have already transformed their healthcare experience with EMC.
            </p>
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-green-600/25 hover:shadow-green-600/40 transform hover:-translate-y-1">
              Get Started Today
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, color, variants }) => {
  const colorMap = {
    blue: "text-blue-400 bg-blue-500/10 group-hover:bg-blue-500/20",
    green: "text-green-400 bg-green-500/10 group-hover:bg-green-500/20",
    purple: "text-purple-400 bg-purple-500/10 group-hover:bg-purple-500/20",
    indigo: "text-indigo-400 bg-indigo-500/10 group-hover:bg-indigo-500/20",
    orange: "text-orange-400 bg-orange-500/10 group-hover:bg-orange-500/20",
    red: "text-red-400 bg-red-500/10 group-hover:bg-red-500/20",
  };

  return (
    <motion.div
      variants={variants}
      className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 transition-all duration-300 hover:border-slate-600"
    >
      <div className={`p-4 rounded-xl w-fit mb-6 transition-colors ${colorMap[color]}`}>
        <Icon size={32} />
      </div>
      <h3 className="text-2xl font-bold mb-4 text-slate-100 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
        {description}
      </p>
      <div className="mt-6 flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 text-white">
        Learn more <ArrowRight size={16} />
      </div>
    </motion.div>
  );
};

export default Services;
