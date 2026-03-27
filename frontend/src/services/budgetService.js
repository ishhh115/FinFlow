import api from './api.js';

export const setBudget = async (budgetData) => {
    const response = await api.post('/budgets', budgetData);
    return response.data;
};

export const getBudgets = async (month, year) => {
    const response = await api.get('/budgets', { params: { month, year } });
    return response.data;
};

export const deleteBudget = async (id) => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
};