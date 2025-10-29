import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const PieChartBox = ({ title, data, colors }) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700 min-w-0 flex flex-col">
    <h3 className="text-primary font-semibold mb-4 text-center">{title}</h3>
    {/* Ensure container has a fixed height and flexible width */}
    <div className="flex-1 h-64 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', color: '#fff' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);
