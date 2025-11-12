import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import AppContext from '../context/AppContext';

// Pages
import Layout from '../pages/Layout';
import Dashboard from '../pages/Dashboard';
import AddTodo from '../pages/AddTodo';
import TodoItem from '../pages/TodoItem';
import Signup from '../pages/auth/Signup';
import ResetPassword from '../pages/auth/ResetPassword';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Login from '../pages/auth/Login';
import LatestTodos from '../pages/LatestTodos';
import Analytics from '../pages/Analytics';
import UpdateProfile from '../pages/auth/UpdateProfile';
import ActivityLogs from '../pages/ActivityLogs';
import AdminDashboard from '../pages/AdminDashboard';

const ProtectedRoute = () => {
  const { token } = useContext(AppContext);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const { token } = useContext(AppContext);
  return token ? <Navigate to="/" replace /> : <Outlet />;
};

const AppRoutes = () => {
  const { user } = useContext(AppContext);

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="addTodo" element={<AddTodo />} />
          <Route path="latesttodos" element={<LatestTodos />} />
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
};

export default AppRoutes;
