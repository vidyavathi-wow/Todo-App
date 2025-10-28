import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const PieChartBox = ({ title, data, colors }) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-light">
    <h3 className="text-primary font-semibold mb-4 text-center">{title}</h3>
    <div className="w-full h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);
