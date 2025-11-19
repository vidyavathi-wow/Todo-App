import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';

// Context
import AppContext from '../context/AppContext';

// Common Components
import Loader from '../components/common/Loader';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import Layout from '../layouts/MainLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Main App Pages
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
  const { token, user, loading } = useContext(AppContext);

  // 🔥 IMPORTANT: Wait for token & refresh-token restoration
  if (loading) return <Loader />;

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes */}
      <Route
        path="/"
        element={token ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="addTodo" element={<AddTodo />} />
        <Route path="latesttodos" element={<LatestTodos />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="todo/:todoId" element={<TodoItem />} />
        <Route path="profile" element={<UpdateProfile />} />
        <Route path="activity-logs" element={<ActivityLogs />} />

        {/* Admin Only Route */}
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
