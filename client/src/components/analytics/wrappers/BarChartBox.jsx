import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const BarChartBox = ({ title, data, barColor }) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-light">
    <h3 className="text-primary font-semibold mb-4 text-center">{title}</h3>
    <div className="w-full h-64">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="name" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Bar dataKey="value" fill={barColor} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);
