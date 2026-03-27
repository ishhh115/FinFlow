import api from './api.js';

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};

export const updateProfile = async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
};

export const changePassword = async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
};