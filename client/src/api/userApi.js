import axiosInstance from './axiosInstance';

export const getAllUsers = () => axiosInstance.get('/users');
export const getUserById = (id) => axiosInstance.get(`/users/${id}`);
export const createUser = (data) => axiosInstance.post('/users', data);
export const updateUser = (id, data) => axiosInstance.put(`/users/${id}`, data);
export const deactivateUser = (id) => axiosInstance.delete(`/users/${id}`);
