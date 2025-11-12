// src/pages/CalendarPage.jsx
import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addDays from 'date-fns/addDays';
import subDays from 'date-fns/subDays';
import addWeeks from 'date-fns/addWeeks';
import subWeeks from 'date-fns/subWeeks';
import addMonths from 'date-fns/addMonths';
import subMonths from 'date-fns/subMonths';
import enUS from 'date-fns/locale/en-US';
import { FiCalendar } from 'react-icons/fi';
import { getTodos } from '../services/todos';
import Loader from '../components/common/Loader';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Controlled calendar state:
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.MONTH); // 'month' | 'week' | 'day' | 'agenda'

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getTodos(); // expecting { success, todos: [...] }
        if (res?.todos) {
          const mapped = res.todos.map((t) => ({
            title: t.title || 'Untitled',
            start: new Date(t.date),
            end: new Date(t.date),
            resource: t,
          }));
          setEvents(mapped);
        }
      } catch (err) {
        console.error('Calendar fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;

  // NAVIGATION helpers that respect the active view
  const navigateBack = () => {
    if (currentView === Views.MONTH) setCurrentDate((d) => subMonths(d, 1));
    else if (currentView === Views.WEEK) setCurrentDate((d) => subWeeks(d, 1));
    else if (currentView === Views.DAY) setCurrentDate((d) => subDays(d, 1));
    else setCurrentDate((d) => subDays(d, 1)); // agenda fallback
  };

  const navigateNext = () => {
    if (currentView === Views.MONTH) setCurrentDate((d) => addMonths(d, 1));
    else if (currentView === Views.WEEK) setCurrentDate((d) => addWeeks(d, 1));
    else if (currentView === Views.DAY) setCurrentDate((d) => addDays(d, 1));
    else setCurrentDate((d) => addDays(d, 1)); // agenda fallback
  };

  const navigateToday = () => setCurrentDate(new Date());

  // view change handler
  const handleViewChange = (view) => {
    setCurrentView(view);
    // optionally adjust date when switching to month view to ensure same behaviour
  };

  // nice header label
  const label = format(currentDate, 'MMMM yyyy'); // e.g. November 2025

  return (
    <div className="flex-1 bg-gray-dark text-secondary h-full overflow-y-auto p-4 sm:p-6 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-light/50 pb-3">
        <FiCalendar className="text-2xl text-primary" />
        <h2 className="text-2xl font-bold">Task Calendar</h2>
      </div>

      {/* Custom toolbar (fully functional) */}
      <div className="bg-gray p-4 rounded-xl md:p-6 shadow-md border border-gray-light/40 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={navigateToday}
              className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
              type="button"
            >
              Today
            </button>
            <button
              onClick={navigateBack}
              className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
              type="button"
            >
              Back
            </button>
            <button
              onClick={navigateNext}
              className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
              type="button"
            >
              Next
            </button>
          </div>

          <div className="text-center text-lg font-semibold text-white">{label}</div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewChange(Views.MONTH)}
              className={`px-3 py-2 rounded-md border ${
                currentView === Views.MONTH
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-700 text-white border-gray-600'
              }`}
              type="button"
            >
              Month
            </button>
            <button
              onClick={() => handleViewChange(Views.WEEK)}
              className={`px-3 py-2 rounded-md border ${
                currentView === Views.WEEK
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-700 text-white border-gray-600'
              }`}
              type="button"
            >
              Week
            </button>
            <button
              onClick={() => handleViewChange(Views.DAY)}
              className={`px-3 py-2 rounded-md border ${
                currentView === Views.DAY
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-700 text-white border-gray-600'
              }`}
              type="button"
            >
              Day
            </button>
            <button
              onClick={() => handleViewChange(Views.AGENDA)}
              className={`px-3 py-2 rounded-md border ${
                currentView === Views.AGENDA
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-700 text-white border-gray-600'
              }`}
              type="button"
            >
              Agenda
            </button>
          </div>
        </div>
      </div>

      {/* Calendar itself */}
      <div className="bg-gray rounded-xl p-2 md:p-4 shadow-inner border border-gray-light/30">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          view={currentView}
          onNavigate={(date) => setCurrentDate(date)} // keeps controlled state synced if user interacts directly
          onView={(view) => setCurrentView(view)}
          popup
          toolbar={false}
          style={{ height: '75vh' }}
        />
      </div>

      <div className="h-10" />
    </div>
  );
}
