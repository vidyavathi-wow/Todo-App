import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

export default function PieChartTasks({ completed, inProgress, notStarted }) {
  const data = [
    { name: "Completed", value: completed },
    { name: "In Progress", value: inProgress },
    { name: "Not Started", value: notStarted },
  ];

  const COLORS = ["#10b981", "#3b82f6", "#f97316"];

  return (
    <div className="w-full h-64 bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-4">Task Status</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            paddingAngle={4}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#f5f5f5" }}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ color: "#f5f5f5" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
