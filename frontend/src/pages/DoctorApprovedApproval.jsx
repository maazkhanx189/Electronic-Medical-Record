import React from 'react';
import { motion } from 'framer-motion';

const DoctorApprovedApproval = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold mb-4">Approved Approvals</h1>
          <p className="text-slate-300">View approved patient requests</p>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorApprovedApproval;
