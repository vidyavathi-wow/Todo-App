import React, { useContext, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import AppContext from '../../context/AppContext';

export default function TodoHeader({ todo, onStatusUpdated }) {
  const { axios, fetchTodos } = useContext(AppContext);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (!todo?.id) return;
    setUpdatingStatus(true);
    try {
      const { data } = await axios.put(`/api/v1/todos/${todo.id}`, {
        ...todo,
        status: newStatus,
      });

      if (data.success) {
        toast.success('Status updated successfully!');
        if (onStatusUpdated) onStatusUpdated(data);
        fetchTodos();
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => toast.error(err.msg));
      } else {
        toast.error(error.message || 'Failed to update status');
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="bg-card border-b border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-primary hover:text-primary/80 shrink-0"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Go Back</span>
      </button>

      <div className="flex flex-wrap items-center justify-start sm:justify-end gap-4 text-sm min-w-0">
        <div className="shrink-0">
          <span className="text-white">Priority: </span>
          <span className="font-medium">{todo.priority}</span>
        </div>

        <div className="hidden sm:block h-4 w-px bg-border" />

        <div className="flex items-center gap-2 shrink-0 min-w-[140px]">
          <span className="text-white">Status: </span>
          <select
            value={todo.status}
            disabled={updatingStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-1 rounded border border-gray-500 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="inProgress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="hidden sm:block h-4 w-px bg-border" />
      </div>
    </div>
  );
}
