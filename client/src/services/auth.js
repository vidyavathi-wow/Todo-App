import axiosInstance from '../configs/axiosInstance';
import { API } from '../configs/api';

export const registerUser = async (userData) => {
  const { data } = await axiosInstance.post(API.auth.register, userData);
  return data;
};

export const loginUser = async (credentials) => {
  const { data } = await axiosInstance.post(API.auth.login, credentials);
  return data;
};

export const sendForgotPasswordLink = async (email) => {
  const { data } = await axiosInstance.post(API.auth.forgotPassword, { email });
  return data;
};

export const resetPassword = async (token, newPassword) => {
  const { data } = await axiosInstance.post(API.auth.resetPassword, {
    token,
    password: newPassword,
  });
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await axiosInstance.get(API.auth.me);
  return data;
};
