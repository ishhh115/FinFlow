import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Filter, Plus, Search, CalendarDays } from 'lucide-react';
import {
    addExpense,
    deleteExpense,
    exportExpenses,
    getExpenses,
    updateExpense,
} from '../services/expenseService';
import SectionCard from '../components/common/SectionCard';
import StatCard from '../components/common/StatCard';

const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Other'];

const getDefaultFormState = () => ({
    amount: '',
    description: '',
    category: 'Food',
    date: new Date().toISOString().slice(0, 10),
    currency: 'INR',
    note: '',
});

const formatCurrency = (amount, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(amount || 0);

const ExpensesPage = () => {
    const [expenses, setExpenses] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        search: '',
        startDate: '',
        endDate: '',
        sort: '',
    });
    const [formData, setFormData] = useState(getDefaultFormState());

    const loadExpenses = async () => {
        setLoading(true);
        try {
            const appliedFilters = Object.fromEntries(
                Object.entries(filters).filter(([, value]) => value)
            );
            const response = await getExpenses(appliedFilters);
            setExpenses(response.data || []);
            setTotal(response.total || 0);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExpenses();
    }, []);

    const clearForm = () => {
        setFormData(getDefaultFormState());
        setEditingId('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            ...formData,
            amount: Number(formData.amount),
        };

        try {
            if (editingId) {
                await updateExpense(editingId, payload);
                toast.success('Expense updated');
            } else {
                await addExpense(payload);
                toast.success('Expense added');
            }
            clearForm();
            await loadExpenses();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save expense');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (expense) => {
        setEditingId(expense._id);
        setFormData({
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            date: new Date(expense.date).toISOString().slice(0, 10),
            currency: expense.currency || 'INR',
            note: expense.note || '',
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this expense?')) return;
        try {
            await deleteExpense(id);
            toast.success('Expense deleted');
            await loadExpenses();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete expense');
        }
    };

    const handleExport = async () => {
        try {
            const blobData = await exportExpenses();
            const blob = new Blob([blobData], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'finflow-expenses.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('CSV downloaded');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Export failed');
        }
    };

    const averageExpense = useMemo(() => {
        if (!expenses.length) return 0;
        return total / expenses.length;
    }, [expenses, total]);

    const monthlyOverview = useMemo(() => {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        const currentMonthExpenses = expenses.filter((expense) => {
            const date = new Date(expense.date);
            return date.getMonth() === month && date.getFullYear() === year;
        });

        const previousMonthExpenses = expenses.filter((expense) => {
            const date = new Date(expense.date);
            const previous = new Date(year, month - 1, 1);
            return date.getMonth() === previous.getMonth() && date.getFullYear() === previous.getFullYear();
        });

        const currentTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const previousTotal = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

        const categoryMap = currentMonthExpenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});

        const largestCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];

        return {
            currentTotal,
            change,
            largestCategoryName: largestCategory?.[0] || 'No category yet',
            largestCategoryAmount: largestCategory?.[1] || 0,
        };
    }, [expenses]);

    const quickSetLast30Days = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        setFilters((prev) => ({
            ...prev,
            startDate: start.toISOString().slice(0, 10),
            endDate: end.toISOString().slice(0, 10),
        }));
    };

    return (
        <div className="space-y-6">
            <SectionCard className="bg-gradient-to-br from-white via-slate-50 to-teal-50/40 border-slate-200">
                <p className="text-sm text-slate-500">Financial Overview</p>
                <h2 className="text-3xl font-bold text-slate-900 mt-1">Manage Spending</h2>
                <button
                    onClick={() => document.getElementById('expense-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-700 text-white font-semibold hover:bg-teal-800 shadow-sm"
                >
                    <Plus size={18} />
                    Add Expense
                </button>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <Search size={18} className="text-slate-400" />
                        <input
                            value={filters.search}
                            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                            className="w-full text-sm bg-transparent outline-none"
                            placeholder="Search merchant or category"
                        />
                    </div>

                    <button
                        onClick={quickSetLast30Days}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >
                        <span className="inline-flex items-center gap-2">
                            <CalendarDays size={16} className="text-teal-700" />
                            Last 30 Days
                        </span>
                        <span className="text-slate-400">▼</span>
                    </button>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                        <span className="inline-flex items-center gap-2">
                            <Filter size={16} className="text-teal-700" />
                            {filters.category || 'All Categories'}
                        </span>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                            className="text-sm bg-transparent outline-none"
                        >
                            <option value="">All</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </SectionCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SectionCard className="bg-slate-50/70">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Total Monthly Outflow</p>
                    <div className="mt-3 flex items-end justify-between gap-3">
                        <p className="text-4xl font-bold text-slate-900">{formatCurrency(monthlyOverview.currentTotal)}</p>
                        <p className={`text-sm font-semibold ${monthlyOverview.change > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {monthlyOverview.change >= 0 ? '+' : ''}{monthlyOverview.change.toFixed(1)}%
                        </p>
                    </div>
                </SectionCard>

                <SectionCard className="bg-slate-50/70">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Largest Category</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{monthlyOverview.largestCategoryName}</p>
                    <p className="text-sm text-slate-500 mt-1">{formatCurrency(monthlyOverview.largestCategoryAmount)} this month</p>
                </SectionCard>

                <SectionCard className="bg-teal-50/40 border-teal-100">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-teal-700">Budget Status</p>
                    <div className="h-2 rounded-full bg-slate-200 mt-4 overflow-hidden">
                        <div
                            className="h-full bg-teal-600"
                            style={{ width: `${Math.min(total ? (monthlyOverview.currentTotal / Math.max(total, 1)) * 100 : 0, 100)}%` }}
                        />
                    </div>
                    <p className="text-sm text-slate-700 mt-3">Track progress with monthly budget in Budget page</p>
                </SectionCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Total" value={formatCurrency(total)} />
                <StatCard label="Transactions" value={expenses.length} />
                <StatCard label="Average" value={formatCurrency(averageExpense)} />
            </div>

            <SectionCard id="expense-form" title={editingId ? 'Edit Expense' : 'Add Expense'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                    {editingId ? (
                        <button
                            type="button"
                            onClick={clearForm}
                            className="text-sm text-slate-600 hover:text-slate-900"
                        >
                            Cancel Edit
                        </button>
                    ) : null}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                        placeholder="Description"
                        required
                    />
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                        placeholder="Amount"
                        required
                    />
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                        required
                    />
                    <input
                        type="text"
                        value={formData.currency}
                        onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                        maxLength={3}
                        placeholder="Currency"
                    />
                    <input
                        type="text"
                        value={formData.note}
                        onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                        placeholder="Note (optional)"
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-teal-700 text-white font-medium hover:bg-teal-800 disabled:opacity-60"
                >
                    {saving ? 'Saving...' : editingId ? 'Update Expense' : 'Add Expense'}
                </button>
                </form>
            </SectionCard>

            <SectionCard
                title="Recent Transactions"
                className="space-y-4"
                action={
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100 text-sm font-medium"
                    >
                        <Download size={16} />
                        Download Statement
                    </button>
                }
            >
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                            className="rounded-lg border border-slate-300 px-3 py-2"
                        />
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                            className="rounded-lg border border-slate-300 px-3 py-2"
                        />
                        <select
                            value={filters.sort}
                            onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                            className="rounded-lg border border-slate-300 px-3 py-2"
                        >
                            <option value="">Sort by Date</option>
                            <option value="amount">Sort by Amount</option>
                            <option value="category">Sort by Category</option>
                        </select>
                        <button
                            onClick={loadExpenses}
                            className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900"
                        >
                            Apply
                        </button>
                        <button
                            onClick={() => {
                                setFilters({ category: '', search: '', startDate: '', endDate: '', sort: '' });
                                setTimeout(loadExpenses, 0);
                            }}
                            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p className="text-slate-600">Loading expenses...</p>
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                            <thead className="border-b border-slate-200 text-slate-500">
                                <tr>
                                    <th className="py-2 text-left">Description</th>
                                    <th className="py-2 text-left">Category</th>
                                    <th className="py-2 text-left">Date</th>
                                    <th className="py-2 text-right">Amount</th>
                                    <th className="py-2 text-left">Note</th>
                                    <th className="py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense._id} className="border-b border-slate-100">
                                        <td className="py-3">{expense.description}</td>
                                        <td className="py-3">{expense.category}</td>
                                        <td className="py-3">{new Date(expense.date).toLocaleDateString()}</td>
                                        <td className="py-3 text-right font-medium">
                                            {formatCurrency(expense.amount, expense.currency || 'INR')}
                                        </td>
                                        <td className="py-3">{expense.note || '-'}</td>
                                        <td className="py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(expense)}
                                                    className="px-3 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense._id)}
                                                    className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>

                        <div className="md:hidden divide-y divide-slate-100">
                            {expenses.map((expense) => (
                                <div key={expense._id} className="py-4 flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-slate-900">{expense.description}</p>
                                        <p className="text-sm text-slate-500">{expense.category}</p>
                                        <p className="text-sm text-slate-500">{new Date(expense.date).toLocaleDateString()}</p>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => handleEdit(expense)}
                                                className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(expense._id)}
                                                className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-slate-900 whitespace-nowrap">
                                        {formatCurrency(expense.amount, expense.currency || 'INR')}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {!expenses.length ? <p className="text-slate-500 py-4">No expenses found.</p> : null}
                    </>
                )}
            </SectionCard>
        </div>
    );
};

export default ExpensesPage;