import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FiInbox } from 'react-icons/fi';
import EmptyState from '../../common/EmptyState';

export const PieChartBox = ({ title, data = [], colors = [] }) => {
  const hasData = data.some((item) => item.value > 0);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700 w-full flex flex-col justify-between min-h-[320px] transition-transform duration-300 hover:scale-[1.01]">
      <h3 className="text-primary font-semibold mb-4 text-center">{title}</h3>

      {hasData ? (
        <div className="w-full flex-1 min-h-[240px]">
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
                isAnimationActive
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
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400 space-y-2 py-6">
          <FiInbox className="text-4xl animate-bounce" />
          <EmptyState message="No data available" />
        </div>
      )}
    </div>
  );
};
