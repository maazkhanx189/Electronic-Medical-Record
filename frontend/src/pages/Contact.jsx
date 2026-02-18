import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-green-500/30 pt-20">

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-green-400 font-bold tracking-wider uppercase text-sm mb-4 block">Get Support</span>
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Contact Our Team
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Have questions or need assistance? We're here to help you 24/7.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-white">Get In Touch</h2>
            <div className="space-y-8">
              <ContactInfoCard
                icon={Mail}
                title="Email Us"
                content="support@emchealthcare.com"
                subContent="We usually reply within 2 hours."
                color="text-green-400"
              />
              <ContactInfoCard
                icon={Phone}
                title="Call Us"
                content="+1 (555) 123-4567"
                subContent="Available Mon-Fri, 9am-6pm EST."
                color="text-blue-400"
              />
              <ContactInfoCard
                icon={MapPin}
                title="Visit Us"
                content="123 Healthcare Ave, Medical City"
                subContent="MC 12345, United States"
                color="text-purple-400"
              />
              <ContactInfoCard
                icon={Clock}
                title="Emergency"
                content="24/7 Urgent Care"
                subContent="Dial 911 for life-threatening emergencies."
                color="text-red-400"
              />
            </div>
          </motion.div>

          <motion.div
            className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-10 border border-slate-700/50 shadow-2xl"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold mb-8 text-white">Send us a Message</h3>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
                  <input type="text" className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-slate-500" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
                  <input type="text" className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-slate-500" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-slate-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Message
                </label>
                <textarea
                  rows="5"
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-slate-500"
                  placeholder="How can we help you today?"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-600/25 flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                Send Message <Send size={18} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ContactInfoCard = ({ icon: Icon, title, content, subContent, color }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-800/30 transition-colors">
    <div className={`p-3 rounded-xl bg-slate-800/50 border border-slate-700 ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <h4 className="font-bold text-white text-lg">{title}</h4>
      <p className="text-slate-300 font-medium">{content}</p>
      <p className="text-slate-500 text-sm mt-1">{subContent}</p>
    </div>
  </div>
);

export default Contact;
