import React from "react";

export default function AnalyticsCard({ title, value, color }) {
  return (
    <div className={`rounded-lg p-5 shadow-md border border-gray-light ${color}`}>
      <h3 className="text-sm font-medium opacity-80">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
