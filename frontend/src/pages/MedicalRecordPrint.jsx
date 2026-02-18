import React from "react";
import { X, Printer, Download, Save } from "lucide-react";

class MedicalRecordPrint extends React.Component {
    constructor(props) {
        super(props);
        // Parse query parameters
        const params = new URLSearchParams(window.location.search);
        const data = params.get("data");

        this.state = {
            record: data ? JSON.parse(decodeURIComponent(data)) : null,
            isEditing: false
        };
    }

    handlePrint = () => {
        window.print();
    };

    handleDownload = () => {
        const { record } = this.state;
        if (!record) return;

        const content = `
MEDICAL RECORD SUMMARY
----------------------
Patient: ${record.username}
Age: ${record.age || "N/A"} | Gender: ${record.gender || "N/A"}
Contact: ${record.phone || "N/A"} | ${record.email || "N/A"}
Address: ${record.address || "N/A"}
Date: ${new Date().toLocaleDateString()}

MEDICAL HISTORY
---------------
${record.medicalHistory?.length ? record.medicalHistory.map(h => `- ${h}`).join('\n') : "No history recorded."}

ACTIVE MEDICATIONS
------------------
${record.medications?.length ? record.medications.map(m => `- ${m.name} (${m.dosage})`).join('\n') : "No active medications."}

CONSULTATIONS
-------------
${record.consultations?.length ? record.consultations.map(c => `[${new Date(c.date).toLocaleDateString()}] ${c.diagnosis}\n   Notes: ${c.notes}`).join('\n\n') : "No consultations."}

LAB RESULTS
-----------
${record.labResults?.length ? record.labResults.map(l => `[${new Date(l.date).toLocaleDateString()}] ${l.testName}: ${l.result} ${l.unit}`).join('\n') : "No lab results."}
    `;

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Medical_Record_${record.username.replace(/\s+/g, "_")}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    toggleEdit = () => {
        this.setState(prev => ({ isEditing: !prev.isEditing }));
    };

    handleChange = (section, index, value) => {
        const { record } = this.state;
        // Basic implementation for editing simply in state for print purposes
        // Deep cloning or structural updates would go here
        // For simplicity, we are editing top-level strings or specific arrays
    };

    // A simplified editable content approach for "Last Minute Edits" before print
    handleContentEditable = (e, field) => {
        // This would update state based on content editable changes
    }

    render() {
        const { record, isEditing } = this.state;

        if (!record) return <div className="p-10 text-center">Loading record...</div>;

        return (
            <div className="bg-white min-h-screen text-slate-900 font-sans print:p-0">
                {/* Toolbar - Hidden in Print */}
                <div className="bg-slate-900 text-white p-3 md:p-4 flex flex-col md:flex-row justify-between items-center print:hidden sticky top-0 z-50 shadow-lg gap-4">
                    <div className="flex items-center justify-between w-full md:w-auto gap-4">
                        <button onClick={() => window.close()} className="hover:bg-slate-700 p-2 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                        <h1 className="font-bold text-lg md:text-xl">Print Preview</h1>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 w-full md:w-auto">
                        <button
                            onClick={this.toggleEdit}
                            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${isEditing ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                        >
                            {isEditing ? <Save size={18} /> : "Edit"}
                            {isEditing ? "Save" : ""}
                        </button>
                        <button onClick={this.handlePrint} className="bg-blue-600 hover:bg-blue-500 text-white px-3 md:px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm md:text-base">
                            <Printer size={18} /> Print
                        </button>
                        <button onClick={this.handleDownload} className="bg-slate-700 hover:bg-slate-600 text-white px-3 md:px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm md:text-base">
                            <Download size={18} /> Export
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="max-w-4xl mx-auto p-12 print:max-w-none print:p-8" contentEditable={isEditing} suppressContentEditableWarning={true}>

                    {/* Header */}
                    <div className="border-b-2 border-slate-900 pb-8 mb-8 flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 uppercase tracking-tight mb-2">Medical Record</h1>
                            <p className="text-slate-500">Confidential Medical Document</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-slate-900">Dr. {record.doctorName || "Doctor"}</div>
                            <div className="text-slate-500">Date: {new Date().toLocaleDateString()}</div>
                        </div>
                    </div>

                    {/* Patient Info */}
                    <div className="grid grid-cols-2 gap-8 mb-12 bg-slate-50 p-6 rounded-xl print:bg-transparent print:p-0">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Patient Name</label>
                            <div className="text-xl font-bold">{record.username}</div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Contact Info</label>
                            <div>{record.email}</div>
                            <div>{record.phone}</div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Details</label>
                            <div>{record.age} Years Old • {record.gender}</div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Address</label>
                            <div>{record.address}</div>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="space-y-10">

                        <section>
                            <h3 className="text-lg font-bold text-white bg-slate-900 px-4 py-2 rounded-lg inline-block mb-4 print:text-black print:bg-transparent print:border-b-2 print:border-black print:rounded-none print:w-full print:px-0">Medical History</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                {record.medicalHistory?.length > 0 ? record.medicalHistory.map((h, i) => (
                                    <li key={i}>{h}</li>
                                )) : <li className="italic text-slate-400">No medical history recorded.</li>}
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-white bg-slate-900 px-4 py-2 rounded-lg inline-block mb-4 print:text-black print:bg-transparent print:border-b-2 print:border-black print:rounded-none print:w-full print:px-0">Active Medications</h3>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-300">
                                        <th className="py-2 font-bold">Medication</th>
                                        <th className="py-2 font-bold">Dosage</th>
                                        <th className="py-2 font-bold">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {record.medications?.length > 0 ? record.medications.map((m, i) => (
                                        <tr key={i}>
                                            <td className="py-3 pr-4">{m.name}</td>
                                            <td className="py-3 pr-4">{m.dosage} • {m.frequency}</td>
                                            <td className="py-3">{new Date(m.startDate).toLocaleDateString()} - {new Date(m.endDate).toLocaleDateString()}</td>
                                        </tr>
                                    )) : <tr><td colSpan="3" className="py-2 italic text-slate-400">No active medications.</td></tr>}
                                </tbody>
                            </table>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-white bg-slate-900 px-4 py-2 rounded-lg inline-block mb-4 print:text-black print:bg-transparent print:border-b-2 print:border-black print:rounded-none print:w-full print:px-0">Consultation History</h3>
                            <div className="space-y-6">
                                {record.consultations?.length > 0 ? record.consultations.map((c, i) => (
                                    <div key={i} className="break-inside-avoid">
                                        <div className="font-bold mb-1">{new Date(c.date).toLocaleDateString()} - {c.diagnosis}</div>
                                        <p className="text-slate-700 whitespace-pre-wrap">{c.notes}</p>
                                    </div>
                                )) : <div className="italic text-slate-400">No past consultations.</div>}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-white bg-slate-900 px-4 py-2 rounded-lg inline-block mb-4 print:text-black print:bg-transparent print:border-b-2 print:border-black print:rounded-none print:w-full print:px-0">Lab Results</h3>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-300">
                                        <th className="py-2 font-bold">Date</th>
                                        <th className="py-2 font-bold">Test</th>
                                        <th className="py-2 font-bold">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {record.labResults?.length > 0 ? record.labResults.map((l, i) => (
                                        <tr key={i}>
                                            <td className="py-3 pr-4">{new Date(l.date).toLocaleDateString()}</td>
                                            <td className="py-3 pr-4">{l.testName}</td>
                                            <td className="py-3">{l.result} {l.unit}</td>
                                        </tr>
                                    )) : <tr><td colSpan="3" className="py-2 italic text-slate-400">No lab results.</td></tr>}
                                </tbody>
                            </table>
                        </section>

                    </div>

                    <div className="mt-16 pt-8 border-t-2 border-slate-200 flex justify-between items-end print:flex">
                        <div className="text-sm text-slate-500">
                            Generated by EMC System<br />
                            {new Date().toLocaleString()}
                        </div>
                        <div className="text-center">
                            <div className="w-48 border-b border-slate-400 mb-2"></div>
                            <div className="text-sm font-bold uppercase">Doctor's Signature</div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

export default MedicalRecordPrint;
