import React, { useContext } from 'react';
import { FiClock } from 'react-icons/fi';
import AppContext from '../context/AppContext';
import EmptyState from './common/EmptyState';
import toast from 'react-hot-toast';
import { STATUS_COLORS as COLORS } from '../utils/Constants.jsx';
import { updateTodoStatus } from '../services/todos';

export default function TodaysTodos() {
  const { todos, fetchTodos, user } = useContext(AppContext);

  // ✅ Prevent crash: user is null while loading
  if (!user?.id) return null;
  const today = new Date().toISOString().split('T')[0];

  const todaysTodos =
    todos?.filter((todo) => {
      const todoDate = new Date(todo.date).toISOString().split('T')[0];
      const belongs =
        todo.userId === user.id || todo.assignedToUserId === user.id;

      return todoDate === today && belongs;
    }) || [];

  const handleToggleCompleted = async (todo) => {
    const allowed =
      todo.userId === user.id || todo.assignedToUserId === user.id;

    if (!allowed) {
      toast.error('You can only view this task.');
      return;
    }

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
    <div className="bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-900 rounded-lg shadow border border-gray-700 dark:border-gray-300 p-4 w-full flex flex-col transition-colors duration-300">
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

            const allowed =
              todo.userId === user.id || todo.assignedToUserId === user.id;

            const assignee =
              todo?.assignee?.name ||
              (todo?.assignedToUserId
                ? `User #${todo.assignedToUserId}`
                : 'Unassigned');

            return (
              <div
                key={todo.id}
                title={allowed ? '' : 'You can only view this task'}
                className="flex items-center justify-between bg-gray-700 dark:bg-gray-100 p-3 rounded hover:bg-gray-600 dark:hover:bg-gray-200 transition-colors duration-200"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${colorClass}`} />
                    <span
                      className={`${
                        todo.status === 'completed'
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : ''
                      }`}
                    >
                      {todo.title}
                    </span>
                  </div>

                  <span className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                    Assigned To:{' '}
                    <span className="font-medium text-gray-400 dark:text-gray-500">
                      {assignee}
                    </span>
                  </span>
                </div>

                {/* SHOW BUTTON ONLY IF USER CAN TOGGLE */}
                {allowed && (
                  <button
                    onClick={() => handleToggleCompleted(todo)}
                    className={`p-1 rounded transition-colors duration-200 ${colorClass}`}
                  >
                    ✔
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
