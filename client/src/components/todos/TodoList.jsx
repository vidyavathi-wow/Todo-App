import React, { useContext, useState, useEffect, useMemo } from 'react';
import TodoCard from './TodoCard';
import SearchTodo from './SearchTodo';
import AppContext from '../../context/AppContext';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import Select from '../common/Select';
import toast from 'react-hot-toast';
import Loader from '../common/Loader';
import { updateTodoStatus } from '../../services/todos';

const normalize = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

export default function TodoList() {
  const { todos, fetchTodos } = useContext(AppContext);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const filteredTodos = useMemo(() => {
    const statusFilter = normalize(filterStatus);
    const q = normalize(searchQuery);

    let results = Array.isArray(todos) ? todos : [];

    if (statusFilter) {
      results = results.filter(
        (todo) => normalize(todo?.status) === statusFilter
      );
    }

    if (q) {
      results = results.filter((todo) => {
        const title = normalize(todo?.title);
        const desc = normalize(todo?.description);
        return title.includes(q) || desc.includes(q);
      });
    }

    return results;
  }, [todos, filterStatus, searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const handleResetFilters = () => {
    setFilterStatus('');
    setSearchQuery('');
  };

  const handleToggleCompleted = async (todo) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTodoStatus(todo.id, { status: newStatus });
      toast.success(
        newStatus === 'completed'
          ? 'Todo marked as completed'
          : 'Todo marked as pending'
      );
      fetchTodos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update todo');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[80vh] pr-2">
      {/* 🔍 Search */}
      <div className="w-full mb-3">
        <SearchTodo
          value={searchQuery}
          onSearch={(val) =>
            setSearchQuery(val?.target ? val.target.value : val)
          }
          className="w-full"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
        <Select
          noDefault
          value={filterStatus}
          onChange={(val) =>
            setFilterStatus(val?.target ? val.target.value : val)
          }
          options={[
            { value: '', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'inProgress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
          ]}
          className="w-full sm:w-48 h-11 px-3 text-sm border border-gray-600 rounded-md bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary appearance-none leading-tight truncate"
          style={{
            lineHeight: '1.5rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        />

        <Button
          onClick={handleResetFilters}
          noDefault
          disabled={!normalize(filterStatus) && !normalize(searchQuery)}
          className={`w-full sm:w-auto px-4 h-11 text-sm rounded-md transition ${
            !normalize(filterStatus) && !normalize(searchQuery)
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/80'
          }`}
        >
          Reset Filters
        </Button>
      </div>

      {/* 🧾 Todo List */}
      <div className="space-y-4 mt-4">
        {filteredTodos.length > 0 ? (
          filteredTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggleCompleted={handleToggleCompleted}
            />
          ))
        ) : (
          <EmptyState message="No todos found" />
        )}
      </div>
    </div>
  );
}
