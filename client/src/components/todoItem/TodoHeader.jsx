import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function TodoHeader({ todo }) {
  return (
    <div
      className="
        bg-gray-900 dark:bg-white
        border-b border-gray-700 dark:border-gray-300
        px-4 sm:px-6 py-4
        flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4
        transition-colors duration-300
      "
    >
      <button
        onClick={() => window.history.back()}
        className="
          flex items-center gap-2 
          text-primary dark:text-primary 
          hover:text-primary/80 dark:hover:text-primary/70 
          shrink-0
        "
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Go Back</span>
      </button>

      {/* Right section */}
      <div className="flex flex-wrap items-center justify-start sm:justify-end gap-4 text-sm min-w-0">
        {/* Priority */}
        <div className="shrink-0">
          <span className="text-gray-300 dark:text-gray-700">Priority: </span>
          <span className="font-medium text-white dark:text-gray-900">
            {todo.priority}
          </span>
        </div>
      </div>
    </div>
  );
}
