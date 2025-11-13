import React, { useEffect, useState } from 'react';
import { motion as m } from 'framer-motion';

export default function TodoContent({ todo, children }) {
  const [timeLeft, setTimeLeft] = useState('');

  const calculateTimeLeft = () => {
    if (!todo?.date) return '';
    const now = new Date();
    const due = new Date(todo.date);
    const diffMs = due - now;

    const diffMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (diffMs > 0) {
      return `Due in ${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
    } else {
      return `Overdue by ${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
    }
  };

  useEffect(() => {
    const updateTime = () => setTimeLeft(calculateTimeLeft());
    updateTime();
    const timer = setInterval(updateTime, 60 * 1000);
    return () => clearInterval(timer);
  }, [todo?.date]);

  return (
    <m.div
      className="p-4 sm:p-8 max-w-4xl mx-auto w-full relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="
        bg-gray-900 dark:bg-white 
        text-gray-100 dark:text-gray-900
        rounded-lg p-6 sm:p-8 
        shadow-lg border 
        border-gray-700/50 dark:border-gray-300
        transition-colors duration-300
      "
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white dark:text-gray-900">
              {todo.title}
            </h1>

            {/* Due date */}
            {todo.date && (
              <>
                <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">
                  Due on{' '}
                  <span className="text-gray-300 dark:text-gray-800 font-medium">
                    {new Date(todo.date).toLocaleString()}
                  </span>
                </p>

                {timeLeft && (
                  <p
                    className={`text-sm mt-1 ${
                      timeLeft.startsWith('Overdue')
                        ? 'text-red-400'
                        : 'text-green-500'
                    }`}
                  >
                    🕒 {timeLeft}
                  </p>
                )}
              </>
            )}
          </div>

          {children && <div className="shrink-0">{children}</div>}
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Category */}
          <div className="bg-gray-800 dark:bg-gray-200 p-4 rounded-lg border border-gray-700 dark:border-gray-300">
            <p className="text-xs uppercase text-gray-400 dark:text-gray-600 mb-1">
              Category
            </p>
            <p className="text-gray-200 dark:text-gray-900 font-medium">
              {todo.category || '—'}
            </p>
          </div>

          {/* Priority */}
          <div className="bg-gray-800 dark:bg-gray-200 p-4 rounded-lg border border-gray-700 dark:border-gray-300">
            <p className="text-xs uppercase text-gray-400 dark:text-gray-600 mb-1">
              Priority
            </p>
            <p
              className={`font-medium ${
                todo.priority === 'High'
                  ? 'text-red-400'
                  : todo.priority === 'Moderate'
                    ? 'text-yellow-400'
                    : 'text-green-400'
              }`}
            >
              {todo.priority}
            </p>
          </div>

          {/* Status */}
          <div className="bg-gray-800 dark:bg-gray-200 p-4 rounded-lg border border-gray-700 dark:border-gray-300">
            <p className="text-xs uppercase text-gray-400 dark:text-gray-600 mb-1">
              Status
            </p>
            <p
              className={`font-medium ${
                todo.status === 'completed'
                  ? 'text-green-400'
                  : todo.status === 'inProgress'
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-700'
              }`}
            >
              {todo.status}
            </p>
          </div>

          {/* Assigned to */}
          <div className="bg-gray-800 dark:bg-gray-200 p-4 rounded-lg border border-gray-700 dark:border-gray-300">
            <p className="text-xs uppercase text-gray-400 dark:text-gray-600 mb-1">
              Assigned To
            </p>
            <p className="text-gray-200 dark:text-gray-900 font-medium">
              {todo.assignee?.name || 'Not assigned'}
            </p>
          </div>

          {/* Created By */}
          <div className="bg-gray-800 dark:bg-gray-200 p-4 rounded-lg border border-gray-700 dark:border-gray-300">
            <p className="text-xs uppercase text-gray-400 dark:text-gray-600 mb-1">
              Created By
            </p>
            <p className="text-gray-200 dark:text-gray-900 font-medium">
              {todo.owner?.name || '—'}
            </p>
          </div>

          {/* Reminder */}
          <div className="bg-gray-800 dark:bg-gray-200 p-4 rounded-lg border border-gray-700 dark:border-gray-300">
            <p className="text-xs uppercase text-gray-400 dark:text-gray-600 mb-1">
              Reminder
            </p>
            <p className="text-gray-200 dark:text-gray-900 font-medium">
              {todo.reminderBeforeMinutes
                ? `${todo.reminderBeforeMinutes} min before`
                : 'No reminder set'}
            </p>
          </div>
        </div>

        {/* DESCRIPTION + NOTES */}
        <div className="space-y-6">
          {todo.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-100 dark:text-gray-900 mb-2">
                Description
              </h2>
              <p className="leading-relaxed text-gray-300 dark:text-gray-700">
                {todo.description}
              </p>
            </div>
          )}

          {todo.notes && (
            <div>
              <h2 className="text-lg font-semibold text-gray-100 dark:text-gray-900 mb-2">
                Notes
              </h2>
              <div
                className="
                bg-gray-800 dark:bg-gray-200 
                rounded-lg p-5 sm:p-6 
                border border-gray-700 dark:border-gray-300
              "
              >
                <p className="leading-relaxed text-gray-200 dark:text-gray-900 whitespace-pre-line">
                  {todo.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </m.div>
  );
}
