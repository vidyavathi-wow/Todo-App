import axiosInstance from '../configs/axiosInstance';
import { API } from '../configs/api';

export const getProfile = async () => {
  const { data } = await axiosInstance.get(API.profile.base);
  return data;
};

export const updateProfile = async (formData) => {
  const { data } = await axiosInstance.put(API.profile.base, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
