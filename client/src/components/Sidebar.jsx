import { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AppContext from '../context/AppContext';
import {
  FiHome,
  FiPlusCircle,
  FiList,
  FiBarChart2,
  FiClock,
  FiUsers,
} from 'react-icons/fi';
import { User } from 'lucide-react';

const Sidebar = () => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const { user } = useContext(AppContext);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <FiHome />, end: true },
    { name: 'Add Todo', path: '/addTodo', icon: <FiPlusCircle /> },
    { name: 'Latest Todos', path: '/latesttodos', icon: <FiList /> },
    { name: 'Analytics', path: '/analytics', icon: <FiBarChart2 /> },
    { name: 'Activity Logs', path: '/activity-logs', icon: <FiClock /> },
  ];

  if (user?.role === 'admin') {
    menuItems.unshift({
      name: 'Admin Hub',
      path: '/admin',
      icon: <FiUsers />,
    });
  }

  return (
    <div
      className="flex flex-col min-h-full pt-6 
                    bg-gray-dark dark:bg-gray-100 
                    text-secondary dark:text-gray-900 
                    font-semibold border-r border-gray-light dark:border-gray-300 
                    transition-colors duration-300"
    >
      {menuItems.map(({ name, path, icon, end }) => (
        <div key={name} className="relative">
          <NavLink
            to={path}
            end={end || false}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer rounded-l-lg transition-all duration-200 
              ${
                isActive
                  ? 'bg-primary/20 border-r-4 border-primary text-primary'
                  : 'hover:bg-gray/80 dark:hover:bg-gray-200 text-secondary/80 dark:text-gray-700 hover:text-secondary dark:hover:text-gray-900'
              }`
            }
            onClick={() =>
              setActiveTooltip(activeTooltip === name ? null : name)
            }
          >
            <span className="text-xl">{icon}</span>
            <p className="hidden md:inline-block">{name}</p>
          </NavLink>

          <span
            className={`absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1 rounded 
                        bg-gray-700 dark:bg-gray-300 
                        text-white dark:text-gray-900 text-sm whitespace-nowrap 
                        pointer-events-none transition-all duration-300
                        ${
                          activeTooltip === name
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-90'
                        }
                        md:hidden`}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
