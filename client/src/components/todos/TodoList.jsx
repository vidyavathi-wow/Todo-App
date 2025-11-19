import React, { useContext, useState, useEffect, useMemo } from 'react';
import TodoCard from './TodoCard';
import SearchTodo from './SearchTodo';
import AppContext from '../../context/AppContext';
import EmptyState from '../common/EmptyState';
import Select from '../common/Select';
import toast from 'react-hot-toast';
import Loader from '../common/Loader';
import { updateTodoStatus } from '../../services/todos';

const normalize = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

export default function TodoList() {
  const { todos, fetchTodos, user, selectedFilter, setSelectedFilter } =
    useContext(AppContext);

  const [filterStatus, setFilterStatus] = useState('');
  const [adminView, setAdminView] = useState(selectedFilter || 'my');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 🔄 Sync dropdown → global filter (AppContext)
  useEffect(() => {
    if (user?.role === 'admin') {
      setSelectedFilter(adminView);
    } else {
      setSelectedFilter('my');
    }
  }, [adminView, user, setSelectedFilter]);

  // FILTER LOGIC
  const filteredTodos = useMemo(() => {
    const statusFilter = normalize(filterStatus);
    const q = normalize(searchQuery);

    let results = Array.isArray(todos) ? todos : [];

    // ADMIN FILTER
    if (user?.role === 'admin') {
      switch (adminView) {
        case 'my':
          results = results.filter(
            (todo) =>
              todo.userId === user.id || todo.assignedToUserId === user.id
          );
          break;

        case 'assignedToMe':
          results = results.filter((todo) => todo.assignedToUserId === user.id);
          break;

        case 'assignedByMe':
          results = results.filter(
            (todo) =>
              todo.userId === user.id && todo.assignedToUserId !== user.id
          );
          break;

        case 'all':
        default:
          break;
      }
    }

    // STATUS FILTER
    if (statusFilter) {
      results = results.filter(
        (todo) => normalize(todo?.status) === statusFilter
      );
    }

    // SEARCH
    if (q) {
      results = results.filter(
        (todo) =>
          normalize(todo?.title).includes(q) ||
          normalize(todo?.description).includes(q)
      );
    }

    return results;
  }, [todos, filterStatus, searchQuery, adminView, user]);

  // LOADING
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const handleResetFilters = () => {
    setFilterStatus('');
    setSearchQuery('');
    setAdminView('my');
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
    <div className="overflow-y-auto max-h-[80vh] pr-2 transition-colors duration-300">
      {/* 🔍 SEARCH */}
      <div className="w-full mb-3">
        <SearchTodo
          value={searchQuery}
          onSearch={(val) =>
            setSearchQuery(val?.target ? val.target.value : val)
          }
          className="w-full"
        />
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4 flex-wrap">
        {/* Status Filter */}
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
          className="w-full sm:w-48 h-11 px-3 text-sm border border-gray-600 dark:border-gray-400 rounded-md bg-gray-900 dark:bg-gray-100 text-gray-200 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300"
        />

        {/* ADMIN FILTER */}
        {user?.role === 'admin' && (
          <Select
            noDefault
            value={adminView}
            onChange={(val) =>
              setAdminView(val?.target ? val.target.value : val)
            }
            options={[
              { value: 'all', label: 'All Todos' },
              { value: 'my', label: 'My Todos' },
              { value: 'assignedToMe', label: 'Assigned To Me' },
              { value: 'assignedByMe', label: 'Assigned By Me' },
            ]}
            className="w-full sm:w-56 h-11 px-3 text-sm border border-gray-600 dark:border-gray-400 rounded-md bg-gray-900 dark:bg-gray-100 text-gray-200 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300"
          />
        )}

        {/* RESET */}
        <button
          onClick={handleResetFilters}
          disabled={
            !filterStatus && !searchQuery && (!user?.role || adminView === 'my')
          }
          className={`w-full sm:w-auto px-4 h-11 text-sm rounded-md transition-all duration-300 ${
            !filterStatus && !searchQuery && (!user?.role || adminView === 'my')
              ? 'bg-gray-700 dark:bg-gray-300 text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/80'
          }`}
        >
          Reset Filters
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-4 mt-4">
        {filteredTodos.length > 0 ? (
          filteredTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              currentUser={user}
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
