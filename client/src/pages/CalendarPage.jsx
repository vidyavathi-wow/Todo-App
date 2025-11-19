import React, { useContext, useMemo, useState } from 'react';
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
import Loader from '../components/common/Loader';
import AppContext from '../context/AppContext';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Google event colors
const googleColors = [
  'bg-blue-600',
  'bg-red-500',
  'bg-green-600',
  'bg-purple-600',
  'bg-pink-500',
  'bg-amber-500',
  'bg-indigo-600',
];

export default function CalendarPage() {
  const { todos, loading } = useContext(AppContext);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.MONTH);

  const events = useMemo(() => {
    if (!todos) return [];

    return todos
      .filter((t) => t.deletedAt === null)
      .filter((t) => t.status !== 'completed')
      .map((t) => {
        const start = new Date(t.date);
        const end = new Date(start.getTime() + 10 * 60 * 1000); // prevent overlapping

        return {
          title: t.title || 'Untitled',
          start,
          end,
          allDay: false,
          color:
            googleColors[
              Math.abs((t.title || 'x').charCodeAt(0)) % googleColors.length
            ],
          resource: t,
        };
      });
  }, [todos]);

  if (loading) return <Loader />;

  const navigateBack = () => {
    if (currentView === Views.MONTH) setCurrentDate((d) => subMonths(d, 1));
    if (currentView === Views.WEEK) setCurrentDate((d) => subWeeks(d, 1));
    if (currentView === Views.DAY) setCurrentDate((d) => subDays(d, 1));
  };

  const navigateNext = () => {
    if (currentView === Views.MONTH) setCurrentDate((d) => addMonths(d, 1));
    if (currentView === Views.WEEK) setCurrentDate((d) => addWeeks(d, 1));
    if (currentView === Views.DAY) setCurrentDate((d) => addDays(d, 1));
  };

  const navigateToday = () => setCurrentDate(new Date());
  const handleViewChange = (view) => setCurrentView(view);

  const label = format(currentDate, 'MMMM yyyy');

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 bg-gray-dark text-secondary dark:bg-gray-100 dark:text-gray-900">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 border-b border-gray-light/50 pb-3">
        <FiCalendar className="text-2xl text-primary" />
        <h2 className="text-2xl font-bold">Task Calendar</h2>
      </div>

      {/* TOOLBAR */}
      <div className="p-4 rounded-xl md:p-6 shadow-md mb-4 bg-gray dark:bg-gray-100 border border-gray-light/40 dark:border-gray-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <button
              onClick={navigateToday}
              className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
            >
              Today
            </button>
            <button
              onClick={navigateBack}
              className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
            >
              Back
            </button>
            <button
              onClick={navigateNext}
              className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
            >
              Next
            </button>
          </div>

          <div className="text-center text-lg font-semibold text-white dark:text-gray-900 md:flex-1">
            {label}
          </div>

          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            {['month', 'week', 'day', 'agenda'].map((v) => (
              <button
                key={v}
                onClick={() => handleViewChange(v)}
                className={`px-3 py-2 rounded-md border ${
                  currentView === v
                    ? 'bg-primary text-white border-primary'
                    : 'bg-gray-700 text-white border-gray-600'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="rounded-xl p-2 md:p-4 shadow-inner bg-gray dark:bg-gray-100 border border-gray-light/30 dark:border-gray-300">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          view={currentView}
          onNavigate={(date) => setCurrentDate(date)}
          onView={(view) => setCurrentView(view)}
          popup
          toolbar={false}
          className="
            bg-slate-50 dark:bg-slate-900
            text-gray-900 dark:text-gray-100 
            rounded-xl overflow-hidden

            [&_.rbc-header]:bg-indigo-200
            [&_.rbc-header]:text-slate-800
            [&_.rbc-header]:font-semibold
            [&_.rbc-header]:uppercase
            [&_.rbc-header]:text-xs
            [&_.rbc-header]:py-3
            [&_.rbc-header]:border-b-2 border-indigo-200
            [&_.rbc-header]:dark:bg-slate-600
            [&_.rbc-header]:dark:text-indigo-200
            [&_.rbc-header]:dark:border-slate-700

            [&_.rbc-month-row]:border-b border-slate-300 dark:border-slate-700
            [&_.rbc-date-cell]:border-l border-slate-300 dark:border-slate-700
            [&_.rbc-month-view]:border-slate-300 dark:border-slate-700

            [&_.rbc-day-bg]:bg-white 
            [&_.rbc-day-bg]:dark:bg-slate-700

            [&_.rbc-date-cell]:text-xs 
            [&_.rbc-date-cell]:p-1 
            [&_.rbc-date-cell]:text-right
            [&_.rbc-date-cell]:text-slate-700
            [&_.rbc-date-cell]:font-medium
            [&_.rbc-date-cell]:dark:text-slate-300

            [&_.rbc-off-range-bg]:bg-amber-50 
            [&_.rbc-off-range-bg]:dark:bg-slate-950 
            [&_.rbc-off-range .rbc-date-cell]:text-amber-600 
            [&_.rbc-off-range .rbc-date-cell]:dark:text-slate-600

            [&_.rbc-today]:!bg-fuchsia-400/20 
            [&_.rbc-today]:!dark:bg-fuchsia-950
            [&_.rbc-today]:!border-l-4
            [&_.rbc-today]:!border-fuchsia-500
            [&_.rbc-today .rbc-date-cell]:!text-fuchsia-700
            [&_.rbc-today .rbc-date-cell]:!dark:text-fuchsia-400
            [&_.rbc-today .rbc-date-cell]:!font-bold

            [&_.rbc-show-more]:text-indigo-600 
            [&_.rbc-show-more]:dark:text-black
            [&_.rbc-show-more]:text-xs
            [&_.rbc-show-more]:font-semibold
            [&_.rbc-show-more]:hover:underline
          "
          formats={{
            eventTimeRangeFormat: ({ start }) => format(start, 'p'),
            agendaTimeRangeFormat: ({ start }) => format(start, 'p'),
          }}
          components={{
            event: ({ event }) => (
              <div
                className={`
                  ${event.color}
                  text-white px-2 py-[3px] text-[11px]
                  rounded-md shadow-sm font-medium
                  hover:brightness-110 cursor-pointer
                  whitespace-nowrap overflow-hidden text-ellipsis
                `}
              >
                {event.title}
              </div>
            ),
            agenda: {
              event: ({ event }) => (
                <span className="font-medium">{event.title}</span>
              ),
            },
          }}
          style={{ height: '75vh' }}
        />
      </div>

      <div className="h-10" />
    </div>
  );
}
