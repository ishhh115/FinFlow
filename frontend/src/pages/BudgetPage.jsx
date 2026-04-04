import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { deleteBudget, getBudgets, setBudget } from '../services/budgetService';
import ProgressBar from '../components/common/ProgressBar';
import SectionCard from '../components/common/SectionCard';
import StatCard from '../components/common/StatCard';

const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Other'];

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(amount || 0);

const getCurrentMonth = () => new Date().getMonth() + 1;
const getCurrentYear = () => new Date().getFullYear();

const BudgetPage = () => {
    const [month, setMonth] = useState(getCurrentMonth());
    const [year, setYear] = useState(getCurrentYear());
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        category: 'Food',
        limit: '',
    });

    const loadBudgets = async () => {
        setLoading(true);
        try {
            const response = await getBudgets(month, year);
            setBudgets(response.data || []);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to load budgets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBudgets();
    }, [month, year]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await setBudget({
                category: formData.category,
                limit: Number(formData.limit),
                month: Number(month),
                year: Number(year),
            });
            toast.success('Budget saved');
            setFormData((prev) => ({ ...prev, limit: '' }));
            await loadBudgets();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save budget');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this budget?')) return;
        try {
            await deleteBudget(id);
            toast.success('Budget deleted');
            await loadBudgets();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete budget');
        }
    };

    const budgetTotals = useMemo(() => {
        const limit = budgets.reduce((sum, budget) => sum + budget.limit, 0);
        const spent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
        return {
            limit,
            spent,
            remaining: limit - spent,
        };
    }, [budgets]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Total Budget" value={formatCurrency(budgetTotals.limit)} />
                <StatCard label="Spent" value={formatCurrency(budgetTotals.spent)} tone="danger" />
                <StatCard label="Remaining" value={formatCurrency(budgetTotals.remaining)} tone="success" />
            </div>

            <SectionCard title="Set Budget">
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.limit}
                        onChange={(e) => setFormData((prev) => ({ ...prev, limit: e.target.value }))}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                        placeholder="Limit"
                        required
                    />
                    <input
                        type="number"
                        value={month}
                        min="1"
                        max="12"
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                        placeholder="Month"
                        required
                    />
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                        placeholder="Year"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-teal-700 text-white font-medium hover:bg-teal-800 disabled:opacity-60"
                >
                    {saving ? 'Saving...' : 'Save Budget'}
                </button>
                </form>
            </SectionCard>

            <SectionCard title="Category Budgets">
                {loading ? (
                    <p className="text-slate-600">Loading budgets...</p>
                ) : budgets.length ? (
                    <div className="space-y-4">
                        {budgets.map((budget) => (
                            <div key={budget._id} className="border border-slate-200 rounded-xl p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-slate-900">{budget.category}</p>
                                        <p className="text-sm text-slate-500">
                                            {formatCurrency(budget.spent)} of {formatCurrency(budget.limit)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full ${
                                                budget.status === 'exceeded'
                                                    ? 'bg-red-100 text-red-700'
                                                    : budget.status === 'danger'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : budget.status === 'warning'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                            }`}
                                        >
                                            {budget.status}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(budget._id)}
                                            className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <ProgressBar
                                        value={budget.percentage}
                                        colorClass={budget.status === 'exceeded' ? 'bg-red-500' : 'bg-teal-600'}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500">No budgets set for this month and year.</p>
                )}
            </SectionCard>
        </div>
    );
};

export default BudgetPage;