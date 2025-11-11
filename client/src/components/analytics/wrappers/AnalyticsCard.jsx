import React from 'react';

export default function AnalyticsCard({ title, value, color }) {
  return (
    <div
      className={`rounded-lg p-5 shadow-md border border-gray-light dark:border-gray-300 
                  ${color} transition-all duration-500 ease-in-out 
                  hover:scale-[1.02] hover:shadow-xl 
                  bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-900`}
    >
      <h3 className="text-sm font-medium opacity-80">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
