import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppContext from '../../context/AppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function Login() {
  const { navigate, axios, setToken } = useContext(AppContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post('/api/v1/auth/login', formData);
      if (data.success) {
        setToken(data.accessToken);
        localStorage.setItem('token', data.accessToken);
        axios.defaults.headers.common['Authorization'] = data.accessToken;
        toast.success(data.message);
        setFormData({ email: '', password: '' });
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-dark text-gray-light px-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6 text-white">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm">Email Address</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              noDefault
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Password</label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              noDefault
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-primary outline-none"
            />

            <div className="text-right mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            noDefault
            className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary/80 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-sm text-center mt-6">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
