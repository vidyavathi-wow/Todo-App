import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const BarChartBox = ({ title, data, barColor }) => (
  <div
    className="bg-gray-800 dark:bg-white p-4 rounded-lg shadow border border-gray-light dark:border-gray-300 
               transition-all duration-500 ease-in-out 
               hover:scale-[1.02] hover:shadow-xl text-gray-200 dark:text-gray-900"
  >
    <h3 className="text-primary font-semibold mb-4 text-center">{title}</h3>
    <div className="w-full h-64">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#444"
            className="dark:stroke-gray-300"
          />
          <XAxis
            dataKey="name"
            stroke="#ccc"
            className="dark:stroke-gray-700"
          />
          <YAxis stroke="#ccc" className="dark:stroke-gray-700" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              border: 'none',
              color: 'var(--tooltip-text)',
            }}
            wrapperStyle={{
              '--tooltip-bg': '#1f2937',
              '--tooltip-text': '#fff',
            }}
            className="dark:[--tooltip-bg:#f9fafb] dark:[--tooltip-text:#111]"
          />
          <Bar dataKey="value" fill={barColor} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);
