import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const VisitForm = ({ appointment, visit, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    chiefComplaint: '',
    diagnosis: '',
    treatment: '',
    prescriptions: [],
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    labResults: '',
    clinicalNotes: '',
    progressNotes: '',
    visitSummary: '',
    recommendations: '',
    followUpDate: '',
    visitTime: '',
    status: 'ongoing'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visit) {
      setFormData({
        chiefComplaint: visit.chiefComplaint || '',
        diagnosis: visit.diagnosis || '',
        treatment: visit.treatment || '',
        prescriptions: visit.prescriptions || [],
        vitalSigns: visit.vitalSigns || {
          bloodPressure: '',
          heartRate: '',
          temperature: '',
          weight: '',
          height: ''
        },
        labResults: visit.labResults || '',
        clinicalNotes: visit.clinicalNotes || '',
        progressNotes: visit.progressNotes || '',
        visitSummary: visit.visitSummary || '',
        recommendations: visit.recommendations || '',
        followUpDate: visit.followUpDate ? new Date(visit.followUpDate).toISOString().split('T')[0] : '',
        visitTime: visit.visitTime || '',
        status: visit.status || 'ongoing'
      });
    }
  }, [visit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVitalSignsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [name]: value
      }
    }));
  };

  const addPrescription = () => {
    setFormData(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, {
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }]
    }));
  };

  const updatePrescription = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.map((prescription, i) =>
        i === index ? { ...prescription, [field]: value } : prescription
      )
    }));
  };

  const removePrescription = (index) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const url = visit
        ? `http://localhost:5000/api/visits/appointment/${appointment._id}`
        : `http://localhost:5000/api/visits/appointment/${appointment._id}`;

      const method = visit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save visit");

      const data = await res.json();
      toast.success(visit ? "Visit updated successfully" : "Visit created successfully");
      onSave(data.visit || data);
      onClose();
    } catch (err) {
      toast.error('Failed to save visit: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {visit ? 'Edit Visit' : 'Add Visit Details'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-700/50 rounded-lg"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Chief Complaint */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Chief Complaint
              </label>
              <textarea
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Patient's main complaint..."
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Diagnosis
              </label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Diagnosis..."
              />
            </div>

            {/* Treatment */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Treatment
              </label>
              <textarea
                name="treatment"
                value={formData.treatment}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Treatment plan..."
              />
            </div>

            {/* Vital Signs */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Vital Signs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Blood Pressure
                  </label>
                  <input
                    type="text"
                    name="bloodPressure"
                    value={formData.vitalSigns.bloodPressure}
                    onChange={handleVitalSignsChange}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Heart Rate
                  </label>
                  <input
                    type="text"
                    name="heartRate"
                    value={formData.vitalSigns.heartRate}
                    onChange={handleVitalSignsChange}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="72 bpm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Temperature
                  </label>
                  <input
                    type="text"
                    name="temperature"
                    value={formData.vitalSigns.temperature}
                    onChange={handleVitalSignsChange}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="98.6°F"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Weight
                  </label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.vitalSigns.weight}
                    onChange={handleVitalSignsChange}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="150 lbs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Height
                  </label>
                  <input
                    type="text"
                    name="height"
                    value={formData.vitalSigns.height}
                    onChange={handleVitalSignsChange}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={`5'10"`}
                  />
                </div>
              </div>
            </div>

            {/* Lab Results */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Lab Results
              </label>
              <textarea
                name="labResults"
                value={formData.labResults}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Lab test results..."
              />
            </div>

            {/* Prescriptions */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-white">Prescriptions</h3>
                <button
                  type="button"
                  onClick={addPrescription}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Prescription
                </button>
              </div>
              <div className="space-y-4">
                {formData.prescriptions.map((prescription, index) => (
                  <div key={index} className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Medication
                        </label>
                        <input
                          type="text"
                          value={prescription.medication}
                          onChange={(e) => updatePrescription(index, 'medication', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Medication name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Dosage
                        </label>
                        <input
                          type="text"
                          value={prescription.dosage}
                          onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="e.g., 500mg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Frequency
                        </label>
                        <input
                          type="text"
                          value={prescription.frequency}
                          onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="e.g., twice daily"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={prescription.duration}
                          onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="e.g., 7 days"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Instructions
                        </label>
                        <input
                          type="text"
                          value={prescription.instructions}
                          onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Special instructions"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePrescription(index)}
                      className="mt-3 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Visit Time */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Time of Visit
              </label>
              <input
                type="time"
                name="visitTime"
                value={formData.visitTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Clinical Notes */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Clinical Notes
              </label>
              <textarea
                name="clinicalNotes"
                value={formData.clinicalNotes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
                placeholder="Additional clinical notes..."
              />
            </div>

            {/* Progress Notes */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Progress Notes
              </label>
              <textarea
                name="progressNotes"
                value={formData.progressNotes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
                placeholder="Patient's progress and observations..."
              />
            </div>

            {/* Visit Summary */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Visit Summary
              </label>
              <textarea
                name="visitSummary"
                value={formData.visitSummary}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
                placeholder="Summary of the visit..."
              />
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Recommendations
              </label>
              <textarea
                name="recommendations"
                value={formData.recommendations}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
                placeholder="Recommendations for patient care..."
              />
            </div>

            {/* Follow-up Date */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Follow-up Date
              </label>
              <input
                type="date"
                name="followUpDate"
                value={formData.followUpDate}
                onChange={handleInputChange}
                className="px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Visit Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="follow-up">Follow-up Required</option>
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (visit ? 'Update Visit' : 'Save Visit')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default VisitForm;
