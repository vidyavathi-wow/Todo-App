import React, { useState, useEffect, useContext } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AppContext from '../context/AppContext';
import toast from 'react-hot-toast';
import axiosInstance from '../configs/axiosInstance';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasksByDate, setTasksByDate] = useState({});
  const { setTodos, user } = useContext(AppContext);

  // ✅ Fetch monthly task summary
  const fetchMonthTasks = async () => {
    try {
      const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const { data } = await axiosInstance.get(
        `/api/v1/todos/by-date-range?start=${monthStart}&end=${monthEnd}`
      );

      if (data.success && data.taskSummary) {
        setTasksByDate(data.taskSummary);
      }
    } catch (error) {
      console.error('Month tasks fetch error:', error);
    }
  };

  // ✅ Fetch todos when user clicks a specific date
  const fetchTodosByDate = async (date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const { data } = await axiosInstance.get(
        `/api/v1/todos/by-date?date=${formattedDate}`
      );

      if (data.success) {
        setTodos(data.todos || []);
        toast.success(
          user?.role === 'admin'
            ? `Showing all tasks for ${formattedDate}`
            : `Showing your tasks for ${formattedDate}`
        );
      }
    } catch (error) {
      toast.error(`Failed to fetch month tasks: ${error.message}`);
    }
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
    fetchTodosByDate(day);
  };

  // ✅ Re-fetch summary when month changes
  useEffect(() => {
    fetchMonthTasks();
  }, [currentMonth]);

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-2 px-2 text-secondary dark:text-gray-800">
      <button
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="p-1 rounded hover:bg-gray-700 dark:hover:bg-gray-300 transition"
      >
        <FiChevronLeft />
      </button>

      <span className="font-semibold text-sm text-secondary dark:text-gray-900">
        {format(currentMonth, 'MMMM yyyy')}
      </span>

      <button
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="p-1 rounded hover:bg-gray-700 dark:hover:bg-gray-300 transition"
      >
        <FiChevronRight />
      </button>
    </div>
  );

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="flex justify-between text-xs text-gray-light dark:text-gray-500 mb-1">
        {days.map((day) => (
          <div key={day} className="text-center flex-1">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const inactive = !isSameMonth(day, monthStart);
        const selected = isSameDay(day, selectedDate);
        const formattedDate = format(day, 'yyyy-MM-dd');

        // ✅ Get tasks for this day (if any)
        const tasks = tasksByDate[formattedDate] || [];
        const hasTasks = tasks.length > 0;

        // Optional: color dot by task status
        const statusColor = hasTasks
          ? tasks.some((t) => t.status === 'completed')
            ? 'bg-green-400'
            : tasks.some((t) => t.status === 'inProgress')
              ? 'bg-yellow-400'
              : 'bg-red-400'
          : '';

        days.push(
          <div
            key={day}
            onClick={() => handleDateClick(cloneDay)}
            className={`flex flex-col items-center justify-center cursor-pointer rounded-full transition-colors 
              ${
                inactive
                  ? 'text-gray-light dark:text-gray-400'
                  : 'text-secondary dark:text-gray-900'
              } 
              ${
                selected
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-700 dark:hover:bg-gray-300'
              }
            `}
            style={{ aspectRatio: '1 / 1' }}
          >
            <span>{format(day, 'd')}</span>
            {hasTasks && (
              <span
                className={`mt-0.5 w-1.5 h-1.5 rounded-full ${statusColor}`}
              ></span>
            )}
          </div>
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div key={day} className="flex justify-between mb-1 gap-1">
          {days.map((d, idx) => (
            <div key={idx} className="flex-1">
              {d}
            </div>
          ))}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  return (
    <div className="bg-gray dark:bg-white rounded-lg shadow p-2 mb-4 w-full border border-gray-light dark:border-gray-300 transition-colors duration-300">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
