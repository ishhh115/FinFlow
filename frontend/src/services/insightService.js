import api from './api.js';

export const getInsights = async () => {
    const response = await api.get('/insights');
    return response.data;
};