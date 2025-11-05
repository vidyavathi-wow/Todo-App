import React from 'react';
import { useNavigate } from 'react-router-dom';
import { STATUS_COLORS } from '../../utils/Constants';

export default function TodoCard({ todo, onToggleCompleted }) {
  const navigate = useNavigate();
  const status = (todo.status || '').toLowerCase();
  const isCompleted = status === 'completed';

  return (
    <div
      className={`bg-gray border border-gray-light rounded-lg p-4 hover:shadow-lg transition-shadow ${
        isCompleted ? 'opacity-75' : ''
      }`}
    >
      <div className="flex justify-between items-center gap-3 mb-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => onToggleCompleted(todo)}
            className="mt-1 w-4 h-4 accent-primary cursor-pointer"
          />
          <div>
            <h3
              className={`text-lg font-semibold cursor-pointer ${
                isCompleted
                  ? 'line-through text-gray-500'
                  : 'text-primary hover:underline'
              }`}
              onClick={() => navigate(`/todo/${todo.id}`)}
            >
              {todo.title}
            </h3>
            {todo.description && (
              <p
                className={`text-sm mt-1 ${
                  isCompleted
                    ? 'text-secondary/50 line-through'
                    : 'text-secondary/70'
                }`}
              >
                {todo.description}
              </p>
            )}
          </div>
        </div>

        {/* ✅ Use STATUS_COLORS constant here */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
            STATUS_COLORS[status] || 'bg-gray-light text-secondary/70'
          }`}
        >
          {todo.status}
        </span>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-secondary/70 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <span>Priority: {todo.priority}</span>
          <span>
            Created At:{' '}
            {todo.createdAt
              ? new Date(todo.createdAt).toLocaleDateString()
              : '-'}
          </span>
        </div>
        {isCompleted && <span className="text-xs text-success">✅ Done</span>}
      </div>
    </div>
  );
}
