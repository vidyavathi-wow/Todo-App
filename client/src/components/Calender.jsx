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
  isSameDay,
  isWithinInterval,
} from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AppContext from '../context/AppContext';
import toast from 'react-hot-toast';

import { getTodos } from '../services/todos';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allTasks, setAllTasks] = useState([]);
  const [tasksByDate, setTasksByDate] = useState({});
  const { setTodos, user, selectedFilter } = useContext(AppContext);

  const effectiveFilter = selectedFilter || 'my';

  // LOAD ALL TODOS ONCE
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTodos();
        setAllTasks(res.todos || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  // FILTER MONTH SUMMARY IN FRONTEND
  useEffect(() => {
    // ✅ if user is not ready yet, don't try to read user.id
    if (!user || !user.id) {
      setTasksByDate({});
      return;
    }

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    let filtered = allTasks;

    // Apply filters safely using user.id
    if (effectiveFilter === 'my') {
      filtered = allTasks.filter((t) => t.owner?.id === user.id);
    }

    if (effectiveFilter === 'assignedToMe') {
      filtered = allTasks.filter((t) => t.assignee?.id === user.id);
    }

    if (effectiveFilter === 'assignedByMe') {
      filtered = allTasks.filter((t) => t.owner?.id === user.id);
    }

    const summary = {};

    filtered.forEach((task) => {
      const taskDate = new Date(task.date);

      if (isWithinInterval(taskDate, { start: monthStart, end: monthEnd })) {
        const key = format(taskDate, 'yyyy-MM-dd');
        if (!summary[key]) summary[key] = [];
        summary[key].push(task);
      }
    });

    setTasksByDate(summary);
  }, [currentMonth, allTasks, effectiveFilter, user]);

  // DAY CLICK → FILTER ONLY FRONTEND
  const handleDateClick = (day) => {
    setSelectedDate(day);

    const selected = format(day, 'yyyy-MM-dd');

    let filtered = allTasks.filter(
      (t) => format(new Date(t.date), 'yyyy-MM-dd') === selected
    );

    if (effectiveFilter === 'my') {
      filtered = filtered.filter((t) => t.owner?.id === user?.id);
    }

    if (effectiveFilter === 'assignedToMe') {
      filtered = filtered.filter((t) => t.assignee?.id === user?.id);
    }

    if (effectiveFilter === 'assignedByMe') {
      filtered = filtered.filter((t) => t.owner?.id === user?.id);
    }

    setTodos(filtered);

    toast.success(`Tasks updated for ${selected}`);
  };

  // UI HEADER
  const renderHeader = () => (
    <div className="flex justify-between items-center mb-2 px-2">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
        <FiChevronLeft />
      </button>

      <span className="font-semibold text-sm">
        {format(currentMonth, 'MMMM yyyy')}
      </span>

      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
        <FiChevronRight />
      </button>
    </div>
  );

  // Week Days
  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="flex justify-between text-xs mb-1">
        {days.map((day) => (
          <div key={day} className="text-center flex-1">
            {day}
          </div>
        ))}
      </div>
    );
  };

  // CALENDAR CELLS + STATUS COLORS
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let weekIndex = 0; // ✅ for unique row keys

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(day, 'yyyy-MM-dd');

        const tasks = tasksByDate[formattedDate] || [];

        const hasTasks = tasks.length > 0;

        const statusColor = hasTasks
          ? tasks.some((t) => t.status === 'completed')
            ? 'bg-green-400'
            : tasks.some((t) => t.status === 'inProgress')
              ? 'bg-yellow-400'
              : 'bg-red-400'
          : '';

        const cellKey = day.toISOString(); // ✅ stable unique key for each cell

        days.push(
          <div
            key={cellKey}
            onClick={() => handleDateClick(cloneDay)}
            className={`p-2 text-center rounded cursor-pointer ${
              isSameDay(day, selectedDate)
                ? 'bg-primary text-white'
                : 'hover:bg-gray-300'
            }`}
          >
            <span>{format(day, 'd')}</span>

            {hasTasks && (
              <div
                className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${statusColor}`}
              />
            )}
          </div>
        );

        day = addDays(day, 1);
      }

      // ✅ give each week row a unique key
      rows.push(
        <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-0.5">
          {days}
        </div>
      );
      weekIndex += 1;

      days = [];
    }

    return <div>{rows}</div>;
  };

  return (
    <div className="bg-white rounded p-2 shadow">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
