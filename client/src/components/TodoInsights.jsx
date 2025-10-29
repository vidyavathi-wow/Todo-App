import React, { useContext, useMemo } from 'react';
import AppContext from '../context/AppContext';

const TodoInsights = () => {
  const { todos } = useContext(AppContext);

  const insights = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(
      (t) => t.status?.toLowerCase() === 'completed'
    ).length;
    const pending = todos.filter(
      (t) => t.status?.toLowerCase() === 'pending'
    ).length;
    const inProgress = todos.filter(
      (t) =>
        t.status?.toLowerCase() === 'inprogress' || t.status === 'In Progress'
    ).length;

    const highPriority = todos.filter(
      (t) => t.priority?.toLowerCase() === 'high'
    );

    const todayLocal = new Date().toLocaleDateString('en-CA');
    const todayTasks = todos.filter((t) => {
      const dueRaw = t.dueDate || t.due_date;
      if (!dueRaw) return false;
      const dueLocal = new Date(dueRaw).toLocaleDateString('en-CA');
      return dueLocal === todayLocal;
    });

    return {
      total,
      completed,
      pending,
      inProgress,
      highPriority,
      todayTasks,
    };
  }, [todos]);

  return (
    <div className="space-y-6">
      <div className="bg-gray border border-gray-light rounded-xl p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-primary">Quick Stats</h3>
        <div className="space-y-2 text-sm">
          <p>
            Total Tasks:{' '}
            <span className="text-primary font-medium">{insights.total}</span>
          </p>
          <p>
            Completed:{' '}
            <span className="text-green-400 font-medium">
              {insights.completed}
            </span>
          </p>
          <p>
            In Progress:{' '}
            <span className="text-blue-400 font-medium">
              {insights.inProgress}
            </span>
          </p>
          <p>
            Pending:{' '}
            <span className="text-yellow-400 font-medium">
              {insights.pending}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-gray border border-gray-light rounded-xl p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-3 text-red-400">
          ⚡ High Priority
        </h3>
        {insights.highPriority.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {insights.highPriority.slice(0, 4).map((t) => (
              <li key={t.id} className="truncate flex items-center">
                <span className="mr-2 text-red-400">•</span> {t.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-light text-sm">No high priority tasks</p>
        )}
      </div>
    </div>
  );
};

export default TodoInsights;
