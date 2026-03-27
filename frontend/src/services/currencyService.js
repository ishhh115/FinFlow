import api from './api.js';

export const getExchangeRates = async (base = 'INR') => {
    const response = await api.get('/currency/rates', { params: { base } });
    return response.data;
};

export const convertCurrency = async (amount, from, to) => {
    const response = await api.get('/currency/convert', {
        params: { amount, from, to }
    });
    return response.data;
};