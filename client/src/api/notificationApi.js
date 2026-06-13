import axiosInstance from './axiosInstance';

export const getMyNotifications = () => axiosInstance.get('/notifications');
export const markAsRead = (id) => axiosInstance.patch(`/notifications/${id}/read`);
export const markAllAsRead = () => axiosInstance.patch('/notifications/read-all');
