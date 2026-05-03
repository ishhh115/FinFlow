import api from '../core/api.js';

export const getDashboard = async () => {
    const response = await api.get('/dashboard');
    return response.data;
};

export const getSpendingStreak = async () => {
    const response = await api.get('/dashboard/streak');
    return response.data;
};