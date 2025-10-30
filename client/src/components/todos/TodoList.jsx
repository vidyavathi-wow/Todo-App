import React, { useContext, useState, useEffect } from 'react';
import TodoCard from './TodoCard';
import SearchTodo from './SearchTodo';
import AppContext from '../../context/AppContext';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import Select from '../common/Select';
import toast from 'react-hot-toast';
import Loader from '../common/Loader'; // Add your Loader component

export default function TodoList() {
  const { todos, axios } = useContext(AppContext);
  const [filteredTodos, setFilteredTodos] = useState(todos || []);
  const [filterStatus, setFilterStatus] = useState(''); // '' represents All
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading initially
    setLoading(true);
    const timeout = setTimeout(() => {
      applyFilters();
      setLoading(false);
    }, 300); // small delay to show loader

    return () => clearTimeout(timeout);
  }, [todos, filterStatus, searchQuery]);

  const applyFilters = () => {
    let results = todos || [];

    // Filter by status
    if (filterStatus) {
      results = results.filter(
        (todo) =>
          (todo.status || '').toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Filter by search query
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
    setFilterStatus('');
    setSearchQuery('');
    setFilteredTodos(todos || []);
  };

  const handleToggleCompleted = async (todo) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    try {
      await axios.put(`/api/v1/todos/${todo.id}`, {
        ...todo,
        status: newStatus,
      });

      setFilteredTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, status: newStatus } : t))
      );

      toast.success(
        newStatus === 'completed'
          ? 'Todo marked as completed'
          : 'Todo status changed'
      );
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => toast.error(err.msg));
      } else {
        toast.error(error.message || 'Failed to update todo');
      }
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
      {/* Search */}
      <div className="w-full mb-3">
        <SearchTodo
          value={searchQuery}
          onSearch={(q) => setSearchQuery(q)}
          className="w-full"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
        <div className="w-full sm:w-auto flex items-center">
          <Select
            noDefault
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: '', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'inProgress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
            className="w-full h-10 px-3 py-0 border border-gray-600 rounded bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary appearance-none box-border sm:w-48"
          />
        </div>

        <Button
          onClick={handleResetFilters}
          noDefault
          disabled={!filterStatus && !searchQuery}
          className={`w-full sm:w-auto px-4 h-10 bg-primary text-white rounded text-sm hover:bg-primary/80 transition ${
            !filterStatus && !searchQuery
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : ''
          }`}
        >
          Reset Filters
        </Button>
      </div>

      {/* Todo List */}
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
