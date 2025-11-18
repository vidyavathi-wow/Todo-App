// src/components/admin/UserCard.jsx
import React from 'react';

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
      active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}
  >
    {active ? 'Active' : 'Inactive'}
  </span>
);

export default function UserCard({ user, onClick }) {
  const active = !user.deletedAt;
  return (
    <div
      onClick={() => onClick(user)}
      role="button"
      tabIndex={0}
      className="cursor-pointer bg-gray-800 dark:bg-white border border-gray-700 dark:border-gray-300 p-4 rounded-xl hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm sm:text-base font-semibold text-white dark:text-gray-900 truncate">
            {user.name || user.email}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-700 mt-1 break-all">
            {user.email}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-700 mt-2">
            Role: {user.role}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusBadge active={active} />
          <p className="text-xs text-gray-400 dark:text-gray-700">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
