import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';
import AppContext from './context/AppContext';
import Loader from './components/common/Loader';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import AddTodo from './pages/AddTodo';
import TodoItem from './pages/TodoItem';
import Signup from './pages/auth/Signup';
import ResetPassword from './pages/auth/ResetPassword';
import ForgotPassword from './pages/auth/ForgotPassword';
import Login from './pages/auth/Login';
import LatestTodos from './pages/LatestTodos';
import Analytics from './pages/Analytics';
import UpdateProfile from './pages/auth/UpdateProfile';
import ActivityLogs from './pages/ActivityLogs';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { token, loading, user } = useContext(AppContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route path="/" element={token ? <Layout /> : <Login />}>
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
              user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
            }
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
