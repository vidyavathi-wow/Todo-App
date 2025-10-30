import React from 'react';

export default function AnalyticsCard({ title, value, color }) {
  return (
    <div
      className={`rounded-lg p-5 shadow-md border border-gray-light ${color} 
                  transition-transform duration-500 ease-in-out 
                  hover:scale-[1.02] hover:shadow-xl`}
    >
      <h3 className="text-sm font-medium opacity-80">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
