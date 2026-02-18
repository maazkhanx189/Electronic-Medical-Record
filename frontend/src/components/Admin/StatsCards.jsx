import React from "react";

const StatsCards = ({ users }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" >
      <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg">
        <p>Total Users</p>
        <h3 className="text-3xl font-bold">{users.length}</h3>
      </div>

      <div className="bg-purple-600 rounded-xl p-6 text-white shadow-lg">
        <p>Total Admins</p>
        <h3 className="text-3xl font-bold">{users.filter((u) => u.role === "admin").length}</h3>
      </div>

      <div className="bg-green-600 rounded-xl p-6 text-white shadow-lg">
        <p>Regular Users</p>
        <h3 className="text-3xl font-bold">{users.filter((u) => u.role !== "admin").length}</h3>
      </div>
    </div>
  );
};

export default StatsCards;
