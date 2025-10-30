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
    className="bg-gray-800 p-4 rounded-lg shadow border border-gray-light 
               transition-transform duration-500 ease-in-out 
               hover:scale-[1.02] hover:shadow-xl"
  >
    <h3 className="text-primary font-semibold mb-4 text-center">{title}</h3>
    <div className="w-full h-64">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="name" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              color: '#fff',
            }}
          />
          <Bar dataKey="value" fill={barColor} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);
