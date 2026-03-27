import api from './api.js';

export const addExpense = async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
};

export const getExpenses = async (filters = {}) => {
    const response = await api.get('/expenses', { params: filters });
    return response.data;
};

export const updateExpense = async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
};

export const deleteExpense = async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
};

export const exportExpenses = async () => {
    const response = await api.get('/expenses/export', {
        responseType: 'blob'
    });
    return response.data;
};

export const uploadReceipt = async (formData) => {
    const response = await api.post('/expenses/upload-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};