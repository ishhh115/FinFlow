export const convertToCSV = (expenses) => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Currency', 'Note'];
    
    const rows = expenses.map(exp => [
        new Date(exp.date).toLocaleDateString(),
        exp.description,
        exp.category,
        exp.amount,
        exp.currency,
        exp.note || ''
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
};