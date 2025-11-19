import axios from 'axios';
import axiosInstance from '../configs/axiosInstance';
import { API } from '../configs/api';

export const registerUser = async (userData) => {
  const { data } = await axios.post(
    import.meta.env.VITE_BASE_URL + API.auth.register,
    userData
  );
  return data;
};

export const loginUser = async (credentials) => {
  const { data } = await axios.post(
    import.meta.env.VITE_BASE_URL + API.auth.login,
    credentials
  );
  return data;
};

export const sendForgotPasswordLink = async (email) => {
  const { data } = await axios.post(
    import.meta.env.VITE_BASE_URL + API.auth.forgotPassword,
    { email }
  );
  return data;
};

export const resetPassword = async (token, newPassword) => {
  const { data } = await axios.post(
    import.meta.env.VITE_BASE_URL +
      `${API.auth.resetPassword}?token=${encodeURIComponent(token)}`,
    { password: newPassword }
  );
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await axiosInstance.get(API.auth.me);
  return data;
};

export const logout = async () => {
  const { data } = await axiosInstance.post(API.auth.logout);
  return data;
};
