import axiosInstance from './axiosInstance';

export const login = (credentials) => axiosInstance.post('/auth/login', credentials);
export const resetPassword = (newPassword) =>
  axiosInstance.post('/auth/reset-password', { new_password: newPassword });
export const updateProfile = (data) => axiosInstance.patch('/auth/profile', data);
