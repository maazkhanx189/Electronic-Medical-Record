import EMRLayout from "../components/EMRLayout";
import { Card, CardContent } from "../components/ui/card";
import { HeartPulse, Pill, Activity, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

export default function EMRDashboard() {
  const stats = [
    { icon: HeartPulse, label: "Heart Rate", value: "78 bpm" },
    { icon: Activity, label: "Blood Pressure", value: "120/80" },
    { icon: Pill, label: "Medications", value: "4 Active" },
    { icon: CalendarDays, label: "Appointments", value: "2 Upcoming" }
  ];

  return (
    <EMRLayout>
      <h2 className="text-3xl font-semibold mb-6">Welcome, Patient</h2>

      {/* Vital Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-4 rounded-2xl hover:shadow-xl transition bg-white">
              <CardContent className="flex items-center gap-4">
                <item.icon className="w-10 h-10 text-blue-600" />
                <div>
                  <p className="text-gray-500">{item.label}</p>
                  <p className="text-xl font-bold">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="mt-10">
        <h3 className="text-2xl font-semibold mb-4">Upcoming Appointments</h3>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Doctor</th>
                <th className="pb-2">Department</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Dr. Ahmed", "Cardiology", "Dec 12, 2025", "Confirmed"],
                ["Dr. Sara", "Neurology", "Dec 18, 2025", "Pending"]
              ].map((row, i) => (
                <tr key={i} className="border-b text-gray-700">
                  <td className="py-3">{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td className="text-blue-600">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Medical Records */}
      <div className="mt-10">
        <h3 className="text-2xl font-semibold mb-4">Recent Medical Records</h3>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <ul className="space-y-3">
            {[
              "Blood Test - Normal",
              "X-Ray Chest - Mild Infection",
              "Prescription Updated",
              "Follow-up Visit Scheduled"
            ].map((item, i) => (
              <li key={i} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

    </EMRLayout>
  );
}
