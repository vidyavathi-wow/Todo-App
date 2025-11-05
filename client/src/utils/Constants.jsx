import {
  FiHome,
  FiPlusCircle,
  FiList,
  FiBarChart2,
  FiClock,
} from 'react-icons/fi';
import { User } from 'lucide-react';

export const ANALYTICS_COLORS = {
  status: ['#10b981', '#3b82f6', '#f97316'],
  priority: ['#22c55e', '#eab308', '#ef4444'],
  category: ['#8b5cf6', '#ec4899', '#facc15'],
  cards: {
    total: 'bg-blue-200 text-blue-400',
    inProgress: 'bg-yellow-200 text-yellow-400',
    highPriority: 'bg-red-200 text-red-400',
  },
};

export const STATUS_COLORS = {
  pending: 'bg-orange-900',
  inProgress: 'bg-blue-900',
  completed: 'bg-green-900',
};

export const menuItems = [
  { name: 'Dashboard', path: '/', icon: <FiHome />, end: true },
  { name: 'Add Todo', path: '/addTodo', icon: <FiPlusCircle /> },
  { name: 'Latest Todos', path: '/latesttodos', icon: <FiList /> },
  { name: 'Analytics', path: '/analytics', icon: <FiBarChart2 /> },
  { name: 'Profile', path: '/profile', icon: <User /> },
  { name: 'Activity Logs', path: '/activity-logs', icon: <FiClock /> },
];
