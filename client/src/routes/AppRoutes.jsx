import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import AppContext from '../context/AppContext';

import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

import Dashboard from '../pages/Dashboard';
import AddTodo from '../pages/AddTodo';
import LatestTodos from '../pages/LatestTodos';
import CalendarPage from '../pages/CalendarPage';
import Analytics from '../pages/Analytics';
import TodoItem from '../pages/TodoItem';
import UpdateProfile from '../pages/auth/UpdateProfile';
import ActivityLogs from '../pages/ActivityLogs';
import AdminDashboard from '../pages/AdminDashboard';

const ProtectedRoute = () => {
  const { token, authLoading } = useContext(AppContext);
  if (authLoading) return null; // MUST WAIT
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const { token, authLoading } = useContext(AppContext);
  if (authLoading) return null;
  return token ? <Navigate to="/" replace /> : <Outlet />;
};

export default function AppRoutes() {
  const { user } = useContext(AppContext);

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="addTodo" element={<AddTodo />} />
          <Route path="latesttodos" element={<LatestTodos />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="todo/:todoId" element={<TodoItem />} />
          <Route path="profile" element={<UpdateProfile />} />
          <Route path="activity-logs" element={<ActivityLogs />} />
          <Route
            path="admin"
            element={
              user?.role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
