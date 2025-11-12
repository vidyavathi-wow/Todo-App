import { useState, useEffect, useContext } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css'; // We will create this file for custom styling

import AppContext from '../context/AppContext';
import { getTodos } from '../services/todos'; // We assume you'll create this
import Loader from '../components/common/Loader';

// Setup the localizer by telling it to use date-fns
const locales = {
  'en-US': (await import('date-fns/locale/en-US')).default,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday start
  getDay,
  locales,
});

const CalendarPage = () => {
  const { fetchTodos } = useContext(AppContext); // From AppContext, like in LatestTodos
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // This is the data-fetching logic, just like in LatestTodos.jsx
  const fetchAllUserTodos = async () => {
    setLoading(true);
    try {
      // IMPORTANT: You need to create this API service function
      // It should fetch ALL todos, not just recent ones
      const data = await getTodos(); 
      console.log("MY REAL API DATA:", data);
      
      if (data.success) {
        // This is the CRITICAL step:
        // We map your 'todo' objects to the 'event' objects the calendar needs
        const formattedEvents = data.todos.map((todo) => {
          
          // --- YOU MUST EDIT THIS PART ---
          // I am GUESSING your todo object properties. 
          // Check your backend and change 'todo.title' and 'todo.dueDate'
          // to match your actual data model.
          
          return {
            id: todo.id,
            title: todo.title, // e.g., 'Refactor API'
            start: new Date(todo.date), // Must be a JavaScript Date object
            end: new Date(todo.date), // For a todo, start and end are the same
            allDay: true,
            resource: todo, // Store the original todo object
          };
        });

        setEvents(formattedEvents);
        fetchTodos(); // This updates the global context, like you do in LatestTodos
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUserTodos();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-10 bg-gray-900 text-gray-200 h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    // This wrapper div uses the *exact* same styling as your LatestTodos.jsx
    // This ensures it "blends" with the layout
    <div className="flex-1 p-4 md:p-10 bg-gray-900 text-gray-200 h-[calc(100vh-80px)]">
      <h1 className="text-2xl font-semibold mb-6 text-white">Task Calendar</h1>
      <div className="h-[90%] bg-gray-800 p-4 rounded-lg shadow">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', width: '100%' }}
          className="text-white"
          // This will be editable in the future.
          // To fetch "assigned" todos, you just change the
          // API call in fetchAllUserTodos()
        />
      </div>
    </div>
  );
};

export default CalendarPage;