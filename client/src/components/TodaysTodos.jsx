import React, { useContext } from 'react';
import { FiClock, FiCheckCircle } from 'react-icons/fi';
import AppContext from '../context/AppContext';
import EmptyState from './common/EmptyState';
import toast from 'react-hot-toast';
import { STATUS_COLORS as COLORS } from '../utils/Constants.jsx';
import { updateTodoStatus } from '../services/todos';

export default function TodaysTodos() {
  const { todos, fetchTodos } = useContext(AppContext);

  const today = new Date().toISOString().split('T')[0];

  const todaysTodos =
    todos?.filter((todo) => {
      const todoDate = new Date(todo.date).toISOString().split('T')[0];
      return todoDate === today;
    }) || [];

  const handleToggleCompleted = async (todo) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTodoStatus(todo.id, { status: newStatus });
      toast.success(
        newStatus === 'completed'
          ? 'Todo marked as completed!'
          : 'Todo marked as pending!'
      );
      fetchTodos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update todo');
    }
  };

  return (
    <div className="bg-gray-800 text-gray-200 rounded-lg shadow border border-gray-700 p-4 w-full flex flex-col">
      <h3 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
        <FiClock /> Today&apos;s Todos
      </h3>

      {todaysTodos.length === 0 ? (
        <EmptyState message="No todos for today" className="text-center" />
      ) : (
        <div className="flex-1 overflow-y-auto max-h-64 space-y-3">
          {todaysTodos.map((todo) => {
            const status = (todo.status || '').toLowerCase();
            const colorClass = COLORS[status] || 'bg-gray-500';

            return (
              <div
                key={todo.id}
                className="flex items-center justify-between bg-gray-700 p-3 rounded hover:bg-gray-600 transition"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${colorClass}`} />
                  <span
                    className={`${
                      todo.status === 'completed'
                        ? 'line-through text-gray-400'
                        : ''
                    }`}
                  >
                    {todo.title}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleCompleted(todo)}
                  className={`p-1 rounded transition ${
                    status === 'completed'
                      ? 'hover:bg-green-600'
                      : 'hover:bg-blue-600'
                  } ${colorClass}`}
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
