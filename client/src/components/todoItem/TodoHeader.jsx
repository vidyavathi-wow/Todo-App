import React, { useContext, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import AppContext from '../../context/AppContext';
import { updateTodo } from '../../services/todos';

export default function TodoHeader({ todo, onStatusUpdated }) {
  const { fetchTodos } = useContext(AppContext);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (!todo?.id) return;
    setUpdatingStatus(true);

    try {
      const data = await updateTodo(todo.id, { status: newStatus });

      if (data.success) {
        toast.success('Status updated successfully!');
        if (onStatusUpdated) onStatusUpdated(data);
        fetchTodos();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => toast.error(err.msg));
      } else {
        toast.error(error.response?.data?.message || 'Failed to update status');
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

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
      {/* Go Back */}
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

        <div className="hidden sm:block h-4 w-px bg-gray-700 dark:bg-gray-300" />

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 shrink-0 min-w-[140px]">
          <span className="text-gray-300 dark:text-gray-700">Status: </span>

          <select
            value={todo.status}
            disabled={updatingStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="
              w-full px-3 py-1 rounded
              border border-gray-600 dark:border-gray-300
              bg-gray-800 dark:bg-gray-100
              text-white dark:text-gray-900
              focus:outline-none focus:ring-2 focus:ring-primary
              cursor-pointer
              transition-colors duration-300
            "
          >
            <option value="pending">Pending</option>
            <option value="inProgress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="hidden sm:block h-4 w-px bg-gray-700 dark:bg-gray-300" />
      </div>
    </div>
  );
}
