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

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const { todos, loading, user } = useContext(AppContext);

  const events = useMemo(() => {
    if (!todos || !user) return [];
    return todos
      .filter((t) => t.userId === user.id)
      .filter((t) => t.deletedAt === null)
      .filter((t) => t.status !== 'completed')
      .map((t) => ({
        title: t.title || 'Untitled',
        start: new Date(t.date),
        end: new Date(new Date(t.date).getTime() + 60 * 1000),
        resource: t,
      }));
  }, [todos, user]);

  if (loading) return <Loader />;

  const navigateBack = () => {
    if (currentView === Views.MONTH) setCurrentDate((d) => subMonths(d, 1));
    else if (currentView === Views.WEEK) setCurrentDate((d) => subWeeks(d, 1));
    else if (currentView === Views.DAY) setCurrentDate((d) => subDays(d, 1));
  };

  const navigateNext = () => {
    if (currentView === Views.MONTH) setCurrentDate((d) => addMonths(d, 1));
    else if (currentView === Views.WEEK) setCurrentDate((d) => addWeeks(d, 1));
    else if (currentView === Views.DAY) setCurrentDate((d) => addDays(d, 1));
  };

  const label = format(currentDate, 'MMMM yyyy');

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 bg-gray-dark text-secondary dark:bg-gray-100 dark:text-gray-900">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-light/50 pb-3">
        <FiCalendar className="text-2xl text-primary" />
        <h2 className="text-2xl font-bold">Task Calendar</h2>
      </div>

      <div className="p-4 rounded-xl md:p-6 shadow-md mb-4 bg-gray dark:bg-gray-100 border border-gray-light/40 dark:border-gray-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentDate(new Date())}
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

          <div className="text-lg font-semibold text-white dark:text-gray-900">
            {label}
          </div>

          <div className="flex flex-wrap gap-2">
            {['month', 'week', 'day', 'agenda'].map((v) => (
              <button
                key={v}
                onClick={() => setCurrentView(v)}
                className={`px-3 py-2 rounded-md border ${
                  currentView === v
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-700 text-white border-gray-600'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl p-2 md:p-4 shadow-inner bg-gray dark:bg-gray-100 border border-gray-light/30 dark:border-gray-300">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          view={currentView}
          popup
          toolbar={false}
          onNavigate={(d) => setCurrentDate(d)}
          onView={(v) => setCurrentView(v)}
          formats={{
            eventTimeRangeFormat: () => '',
          }}
          components={{
            event: ({ event }) => (
              <div className="flex items-center bg-primary text-white px-2 py-1 rounded-md text-xs font-medium h-full">
                {event.title}
              </div>
            ),
            header: ({ label }) => (
              <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 text-xs uppercase font-semibold border-b border-gray-300 dark:border-gray-600">
                {label}
              </div>
            ),
          }}
          className="
            rbc-calendar 
            [&_.rbc-month-view]:border-gray-300 
            [&_.rbc-day-bg]:border-gray-300 
            dark:[&_.rbc-month-view]:border-gray-600
            dark:[&_.rbc-day-bg]:border-gray-600
          "
          style={{ height: '75vh' }}
        />
      </div>

      <div className="h-10" />
    </div>
  );
}
