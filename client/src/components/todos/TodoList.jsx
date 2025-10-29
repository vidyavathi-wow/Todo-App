import React, { useContext, useState, useEffect, useRef } from 'react';
import TodoCard from './TodoCard';
import SearchTodo from './SearchTodo';
import AppContext from '../../context/AppContext';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import Select from '../common/Select';
import toast from 'react-hot-toast';

export default function TodoList() {
  const { todos, axios } = useContext(AppContext);
  const [filteredTodos, setFilteredTodos] = useState(todos || []);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const prevStatusRef = useRef({});

  useEffect(() => {
    applyFilters();
  }, [todos, filterStatus, searchQuery]);

  const applyFilters = () => {
    let results = todos || [];

    if (filterStatus !== 'All') {
      results = results.filter(
        (todo) =>
          (todo.status || '').toLowerCase() === filterStatus.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      results = results.filter(
        (todo) =>
          (todo.title || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (todo.description || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTodos(results);
  };

  const handleResetFilters = () => {
    setFilterStatus('All');
    setSearchQuery('');
    setFilteredTodos(todos || []);
  };

  const handleToggleCompleted = async (todo) => {
    try {
      const isCompleted = (todo.status || '').toLowerCase() === 'completed';
      const newStatus = isCompleted
        ? prevStatusRef.current[todo.id] || 'In Progress'
        : 'completed';

      if (!isCompleted)
        prevStatusRef.current[todo.id] = todo.status || 'Pending';

      await axios.put(`/api/v1/todos/${todo.id}`, {
        ...todo,
        status: newStatus,
      });

      setFilteredTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error(err.response || err);
      toast.error(
        err.response?.status === 404 ? 'Todo not found' : err.message
      );
    }
  };

  return (
    <div className="overflow-y-auto max-h-[80vh] pr-2">
      <div className="w-full mb-3">
        <SearchTodo
          value={searchQuery}
          onSearch={(q) => setSearchQuery(q)}
          className="w-full"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
        <div className="w-full sm:w-auto">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'All', label: 'All' },
              { value: 'Pending', label: 'Pending' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
            className="w-full sm:w-48"
          />
        </div>

        <Button
          variant="secondary"
          onClick={handleResetFilters}
          disabled={filterStatus === 'All' && !searchQuery}
          className={`w-full sm:w-auto px-4 ${
            filterStatus === 'All' && !searchQuery
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : ''
          }`}
        >
          Reset Filters
        </Button>
      </div>

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
