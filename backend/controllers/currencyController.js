export const getExchangeRates = async (req, res, next) => {
    try {
        const base = req.query.base || 'INR';
        
        const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
        const data = await response.json();

        if (data.result !== 'success') {
            return res.status(400).json({
                success: false,
                error: 'Failed to fetch exchange rates'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                base: data.base_code,
                rates: data.rates,
                lastUpdated: data.time_last_update_utc
            }
        });
    } catch (error) {
        next(error);
    }
};

export const convertCurrency = async (req, res, next) => {
    try {
        const { amount, from, to } = req.query;

        if (!amount || !from || !to) {
            return res.status(400).json({
                success: false,
                error: 'Please provide amount, from and to currencies'
            });
        }

        const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
        const data = await response.json();

        const rate = data.rates[to];
        const converted = (parseFloat(amount) * rate).toFixed(2);

        res.status(200).json({
            success: true,
            data: {
                from,
                to,
                amount: parseFloat(amount),
                rate,
                converted: parseFloat(converted)
            }
        });
    } catch (error) {
        next(error);
    }
};