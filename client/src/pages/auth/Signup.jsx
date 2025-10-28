import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppContext from '../../context/AppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function Signup() {
  const navigate = useNavigate();
  const { axios } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post('/api/v1/auth/register', formData);
      if (data.success) {
        toast.success(data.message);
        setFormData({ name: '', email: '', password: '' });
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-dark text-gray-light px-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm">Full Name</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              noDefault
              placeholder="Enter your name"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Email Address</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              noDefault
              placeholder="Enter your email"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Password</label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              noDefault
              placeholder="Enter your password"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            noDefault
            className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary/80 transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-sm text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
