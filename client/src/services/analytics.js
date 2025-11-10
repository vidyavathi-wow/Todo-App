import axiosInstance from '../configs/axiosInstance';
import { API } from '../configs/api';

export const getAnalytics = async () => {
  const { data } = await axiosInstance.get(API.analytics.base);
  return data;
};
