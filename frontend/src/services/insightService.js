import api from './api.js';

export const getInsights = async () => {
    const response = await api.get('/insights');
    return response.data;
};

export const askAi = async (query, pageContext = 'general') => {
    const response = await api.post('/insights/ask', { query, pageContext });
    return response.data;
};