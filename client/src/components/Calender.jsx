import React, { useState } from 'react';
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

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="flex justify-between text-xs text-gray-400 mb-1">
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
        days.push(
          <div
            key={day}
            onClick={() => setSelectedDate(cloneDay)}
            className={`flex items-center justify-center cursor-pointer rounded-full transition-colors
              ${!isSameMonth(day, monthStart) ? 'text-gray-500' : 'text-gray-200'}
              ${isSameDay(day, selectedDate) ? 'bg-primary text-white' : 'hover:bg-gray-700'}`}
            style={{ aspectRatio: '1 / 1' }} // make square
          >
            {format(day, 'd')}
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

    // Ensure 6 rows
    while (rows.length < 6) {
      const emptyRow = Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="flex-1 aspect-square"></div>
      ));
      rows.push(
        <div
          key={`empty-${rows.length}`}
          className="flex justify-between mb-1 gap-1"
        >
          {emptyRow}
        </div>
      );
    }

    return <div>{rows}</div>;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow p-2 mb-4 w-full">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
