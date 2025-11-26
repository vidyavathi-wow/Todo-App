import axiosInstance from '../configs/axiosInstance';
import { API } from '../configs/api';

export const getUsers = async (page = 1, limit = 10) => {
  const { data } = await axiosInstance.get(
    `${API.users.base}?page=${page}&limit=${limit}`
  );
  return data;
};
