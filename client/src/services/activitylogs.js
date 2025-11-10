import axiosInstance from '../configs/axiosInstance';
import { API } from '../configs/api';

export const getActivityLogs = async (page = 1, limit = 3) => {
  const { data } = await axiosInstance.get(
    `${API.admin.activityLogs}?page=${page}&limit=${limit}`
  );
  return data;
};
