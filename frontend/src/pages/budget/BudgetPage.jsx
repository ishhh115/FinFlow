import { useEffect, useMemo, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { deleteBudget, getBudgets, setBudget } from '../../services/budget/budgetService';
import { getExpenses } from '../../services/expenses/expenseService';
import ProgressBar from '../../components/common/ProgressBar';
import SectionCard from '../../components/common/SectionCard';
import StatCard from '../../components/common/StatCard';
import { 
    Coffee,
    Navigation,
    Flame,
    ShoppingBag,
    Activity,
    Zap,
    MoreHorizontal,
    Save,
    Trash2
} from 'lucide-react';

const getCategoryIcon = (category) => {
    switch(category) {
        case 'Food': return <Coffee size={20} />;
        case 'Transport': return <Navigation size={20} />;
        case 'Entertainment': return <Flame size={20} />;
        case 'Shopping': return <ShoppingBag size={20} />;
        case 'Health': return <Activity size={20} />;
        case 'Utilities': return <Zap size={20} />;
        default: return <MoreHorizontal size={20} />;
    }
};

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

    const loadBudgetsAndExpenses = useCallback(async () => {
        setLoading(true);
        try {
            // First/last day limits for fetching current month expenses
            const startDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);
            const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

            const [budgetsRes, expensesRes] = await Promise.all([
                getBudgets(month, year),
                getExpenses({ startDate, endDate })
            ]);

            const rawBudgets = budgetsRes.data || [];
            
            // To be extremely safe, we filter expenses on frontend by month/year just in case backend ignores filters
            const rawExpenses = (expensesRes.data || []).filter(exp => {
                const dateObj = new Date(exp.date);
                return dateObj.getMonth() + 1 === month && dateObj.getFullYear() === year;
            });

            // 1. CALCULATE CATEGORY-WISE SPENDING
            const categorySpent = {};
            rawExpenses.forEach(exp => {
                categorySpent[exp.category] = (categorySpent[exp.category] || 0) + exp.amount;
            });

            // 2. MAP SPENDING TO BUDGETS & ADD STATUS
            const processedBudgets = rawBudgets.map(budget => {
                const spent = categorySpent[budget.category] || 0;
                const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
                
                let status = 'SAFE';
                if (percentage >= 100) {
                    status = 'exceeded';
                } else if (percentage >= 70) {
                    status = 'warning';
                }

                return {
                    ...budget,
                    spent,
                    percentage,
                    status
                };
            });

            setBudgets(processedBudgets);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to load budgets and expenses');
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        loadBudgetsAndExpenses();
    }, [loadBudgetsAndExpenses]);

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
            await loadBudgetsAndExpenses();
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
            await loadBudgetsAndExpenses();
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-400 mb-1">Financial Controls</p>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white">Budget Allocation</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-slate-800/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)] border border-slate-700 flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:bg-slate-800/80">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-300 mb-2">Total Budget Configured</p>
                    <p className="text-4xl text-white font-black tracking-tight">{formatCurrency(budgetTotals.limit)}</p>
                </div>

                <div className="bg-red-900/40 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)] border border-red-700/50 flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:bg-red-900/60">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-red-300 mb-2">Gross Spendings</p>
                    <p className="text-4xl text-red-400 font-black tracking-tight">{formatCurrency(budgetTotals.spent)}</p>
                </div>

                <div className="bg-teal-900/40 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)] border border-teal-700/50 flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:bg-teal-900/60">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-teal-300 mb-2">Capital Remaining</p>
                    <p className="text-4xl text-teal-400 font-black tracking-tight">{formatCurrency(budgetTotals.remaining)}</p>
                </div>
            </div>

            <SectionCard title="Configure Allocations">
                <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row xl:items-end gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                                className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3.5 bg-slate-50/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-bold text-slate-700 outline-none cursor-pointer"
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Monthly Limit</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.limit}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, limit: e.target.value }))}
                                    className="w-full rounded-[1.25rem] border border-slate-200 pl-8 pr-4 py-3.5 bg-slate-50/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Month</label>
                                <input
                                    type="number"
                                    value={month}
                                    min="1"
                                    max="12"
                                    onChange={(e) => setMonth(Number(e.target.value))}
                                    className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3.5 bg-slate-50/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-bold text-slate-900 outline-none text-center"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Year</label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3.5 bg-slate-50/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-bold text-slate-900 outline-none text-center"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full xl:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-[1.25rem] bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all disabled:opacity-60 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] transform hover:-translate-y-0.5"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Budget'}
                    </button>
                </form>
                <p className="text-xs font-semibold text-slate-500 mt-5 ml-1">
                    Set budgets for categories to track and control your spending
                </p>
            </SectionCard>

            <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black text-white tracking-tight">Category Breakdown</h3>
                </div>

                {loading ? (
                    <p className="text-slate-800 bg-slate-100 p-6 rounded-2xl animate-pulse font-bold text-center">Scanning your active budgets...</p>
                ) : budgets.length ? (
                    <div className="space-y-5">
                        {budgets.map((budget) => {
                            const isExceeded = budget.status === 'exceeded';
                            const isWarning = budget.status === 'warning' || budget.status === 'danger';
                            const statusColor = isExceeded ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-500';
                            const statusBg = isExceeded ? 'bg-red-50/80' : isWarning ? 'bg-amber-50/80' : 'bg-emerald-50/80';
                            const progressColor = isExceeded ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500';
                            
                            let badgeText = 'SAFE';
                            if (isExceeded) badgeText = 'OVER LIMIT';
                            else if (isWarning) badgeText = 'WARNING';
                            else if (budget.percentage >= 100) badgeText = 'COMPLETE';

                            return (
                                <div key={budget._id} className="relative bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-indigo-100 hover:shadow-[0_8px_30px_-12px_rgba(79,70,229,0.15)] transition-all duration-300 group">
                                    
                                    <div className="absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center gap-3">
                                        <button
                                            onClick={() => handleDelete(budget._id)}
                                            className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Budget"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-5 md:pr-16">
                                        <div className="flex items-center gap-5">
                                            <div className="p-4 rounded-[1.25rem] bg-indigo-50 text-indigo-500 shrink-0">
                                                {getCategoryIcon(budget.category)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-xl tracking-tight">{budget.category}</p>
                                                <div className={`mt-1.5 px-2.5 py-1 rounded-lg ${statusBg} ${statusColor} text-[9px] font-black uppercase tracking-widest inline-block`}>
                                                    {badgeText}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto">
                                            <p className="font-black text-slate-900 tracking-tight text-2xl">{formatCurrency(budget.spent)}</p>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Budget: {formatCurrency(budget.limit)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden w-full relative">
                                        <div
                                            className={`h-full transition-all duration-1000 ${progressColor}`}
                                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
                        <MoreHorizontal size={36} className="text-slate-300 mx-auto mb-4" />
                        <p className="text-lg font-black text-slate-600 mb-1">No budget data yet.</p>
                        <p className="text-sm font-semibold text-slate-400">Set a budget to see breakdown.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetPage;