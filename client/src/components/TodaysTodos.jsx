import React, { useContext } from 'react';
import AppContext from '../context/AppContext';
import { FiClock, FiCheckCircle } from 'react-icons/fi';
import EmptyState from './common/EmptyState';
import toast from 'react-hot-toast';
import { STATUS_COLORS as COLORS } from '../utils/Constants';

export default function TodaysTodos() {
  const { todos, axios, fetchTodos } = useContext(AppContext);

  const today = new Date().toISOString().split('T')[0];

  const todaysTodos =
    todos?.filter((todo) => {
      const todoDate = new Date(todo.date).toISOString().split('T')[0];
      return todoDate === today;
    }) || [];

  const handleToggleCompleted = async (todo) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    try {
      await axios.put(`/api/v1/todos/${todo.id}`, {
        ...todo,
        status: newStatus,
      });
      toast.success(
        newStatus === 'completed' ? 'Todo completed!' : 'Todo marked pending!'
      );
      fetchTodos();
    } catch (error) {
      toast.error(error.message || 'Failed to update todo');
    }
  };

  // Map statuses to Tailwind classes using your STATUS_COLORS
  const statusClasses = {
    pending: 'bg-orange-500 text-orange-500',
    inProgress: 'bg-blue-500 text-blue-500',
    completed: 'bg-green-500 text-green-500',
    ...COLORS, // in case COLORS has custom class names
  };

  return (
    <div className="bg-gray-800 text-gray-200 rounded-lg shadow border border-gray-700 p-4 w-full flex flex-col">
      <h3 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
        <FiClock /> Today&apos;s Todos
      </h3>

      {todaysTodos.length === 0 ? (
        <EmptyState message="No todos" className="text-center" />
      ) : (
        <div className="flex-1 overflow-y-auto max-h-64 space-y-3">
          {todaysTodos.map((todo) => {
            const colorClass =
              statusClasses[todo.status] || statusClasses.pending;
            return (
              <div
                key={todo.id}
                className="flex items-center justify-between bg-gray-700 p-3 rounded hover:bg-gray-600 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${colorClass}`} />
                  <span
                    className={
                      todo.status === 'completed'
                        ? 'line-through text-gray-400'
                        : ''
                    }
                  >
                    {todo.title}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleCompleted(todo)}
                  className={`p-1 rounded hover:bg-gray-600 transition ${colorClass}`}
                  title={
                    todo.status === 'completed'
                      ? 'Mark as pending'
                      : 'Mark as completed'
                  }
                >
                  <FiCheckCircle />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
