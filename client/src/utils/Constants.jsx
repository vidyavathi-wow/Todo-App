import {
  ANALYTICS_COLORS,
  STATUS_COLORS,
  googleColors,
  CHART_COLORS,
} from '../theme/colors';

import {
  FiHome,
  FiPlusCircle,
  FiList,
  FiBarChart2,
  FiClock,
} from 'react-icons/fi';
import { User } from 'lucide-react';

export { ANALYTICS_COLORS, STATUS_COLORS, googleColors, CHART_COLORS };

export const menuItems = [
  { name: 'Dashboard', path: '/', icon: <FiHome />, end: true },
  { name: 'Add Todo', path: '/addTodo', icon: <FiPlusCircle /> },
  { name: 'Latest Todos', path: '/latesttodos', icon: <FiList /> },
  { name: 'Analytics', path: '/analytics', icon: <FiBarChart2 /> },
  { name: 'Profile', path: '/profile', icon: <User /> },
  { name: 'Activity Logs', path: '/activity-logs', icon: <FiClock /> },
];
