import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
    Download, 
    Filter, 
    Plus, 
    Search, 
    CalendarDays, 
    PieChart as PieChartIcon,
    Coffee,
    Navigation,
    Flame,
    ShoppingBag,
    Activity,
    Zap,
    MoreHorizontal,
    Pencil,
    Trash2,
    UploadCloud,
    X,
    Scan
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import {
    addExpense,
    deleteExpense,
    exportExpenses,
    getExpenses,
    updateExpense,
} from '../services/expenseService';
import SectionCard from '../components/common/SectionCard';
import StatCard from '../components/common/StatCard';

const getCategoryIcon = (category) => {
    switch(category) {
        case 'Food': return <Coffee size={16} />;
        case 'Transport': return <Navigation size={16} />;
        case 'Entertainment': return <Flame size={16} />;
        case 'Shopping': return <ShoppingBag size={16} />;
        case 'Health': return <Activity size={16} />;
        case 'Utilities': return <Zap size={16} />;
        default: return <MoreHorizontal size={16} />;
    }
};

const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Other'];
const DONUT_COLORS = ['#14b8a6', '#8b5cf6', '#f97316', '#3b82f6', '#f43f5e', '#eab308', '#64748b'];

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
        endDate: '',
        sort: '',
    });
    const [formData, setFormData] = useState(getDefaultFormState());

    const [receiptPreview, setReceiptPreview] = useState(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const fileInputRef = useRef(null);

    const loadExpenses = useCallback(async () => {
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
    }, [filters]);

    useEffect(() => {
        loadExpenses();
    }, [loadExpenses]);

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
            toast.error(error.response?.data?.error || 'Failed to delete expense');
        }
    };

    const handleReceiptChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setReceiptPreview(URL.createObjectURL(file));
        }
    };

    const handleExtractDetails = () => {
        setIsExtracting(true);
        toast.success('Scanning receipt using AI (Mock)...');
        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                amount: '1250',
                description: 'Lunch at Cafe',
                category: 'Food'
            }));
            setReceiptPreview(null);
            setIsExtracting(false);
            toast.success('Details extracted successfully!');
            if (fileInputRef.current) fileInputRef.current.value = "";
        }, 1500);
    };

    const clearReceipt = () => {
        setReceiptPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
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

    const categoryDonutData = useMemo(() => {
        const map = {};
        let currentMonthTotal = 0;
        
        // Let's filter expenses to only show the "current" view (or all based on filters if desired)
        // Usually, breakdowns respect the active list of expenses filtered in state.
        expenses.forEach((expense) => {
            map[expense.category] = (map[expense.category] || 0) + expense.amount;
            currentMonthTotal += expense.amount;
        });
        
        return Object.entries(map)
            .map(([name, value]) => ({ 
                name, 
                value,
                percentage: currentMonthTotal ? ((value / currentMonthTotal) * 100).toFixed(1) : 0
            }))
            .sort((a,b) => b.value - a.value);
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-600 mb-1">Financial Overview</p>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">Manage Spending</h1>
                </div>
                <button
                    onClick={() => document.getElementById('expense-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-[1.25rem] bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] transform hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    Add Expense
                </button>
            </div>

            <div className="bg-white p-2 sm:p-3 rounded-[1.5rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col xl:flex-row items-center gap-3">
                <div className="flex-1 flex items-center gap-3 px-5 py-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all w-full">
                    <Search size={18} className="text-slate-400" />
                    <input
                        value={filters.search}
                        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                        className="w-full text-sm bg-transparent outline-none text-slate-700 font-semibold placeholder:text-slate-400 placeholder:font-medium"
                        placeholder="Search merchant or category..."
                    />
                </div>

                <div className="flex w-full xl:w-auto flex-col sm:flex-row items-center gap-3">
                    <button
                        onClick={quickSetLast30Days}
                        className="w-full sm:w-auto flex items-center justify-center sm:justify-between gap-3 px-5 py-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                            <CalendarDays size={18} className="text-teal-600" />
                            Last 30 Days
                        </span>
                    </button>

                    <div className="w-full sm:w-auto flex items-center gap-2 px-5 py-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                        <Filter size={18} className="text-teal-600 shrink-0" />
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                            className="w-full sm:w-auto text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center relative overflow-hidden group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-500">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2">Total Monthly Outflow</p>
                    <div className="flex items-end justify-between gap-3">
                        <p className="text-4xl text-slate-900 font-black tracking-tight">{formatCurrency(monthlyOverview.currentTotal)}</p>
                        <p className={`text-sm font-bold flex items-center mb-1 ${monthlyOverview.change > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {monthlyOverview.change >= 0 ? '+' : ''}{monthlyOverview.change.toFixed(1)}%
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center relative overflow-hidden group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-500">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-3">Largest Category</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tight truncate">{monthlyOverview.largestCategoryName}</p>
                    <p className="text-sm font-semibold text-slate-400 mt-1">{formatCurrency(monthlyOverview.largestCategoryAmount)} this month</p>
                </div>

                <div className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/80 via-white to-teal-50/30 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-indigo-50 flex flex-col justify-center relative overflow-hidden group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-500">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-500 mb-4">Budget Status</p>
                    <div className="h-2 rounded-full bg-slate-200/60 overflow-hidden mb-3">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-1000"
                            style={{ width: `${Math.min(total ? (monthlyOverview.currentTotal / Math.max(total, 1)) * 100 : 0, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs font-semibold text-slate-500 mt-2">Track progress and configure budget allocations in Budget page</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Total" value={formatCurrency(total)} />
                <StatCard label="Transactions" value={expenses.length} />
                <StatCard label="Average" value={formatCurrency(averageExpense)} />
            </div>

            <SectionCard 
                id="expense-form" 
                title={editingId ? 'Edit Expense' : 'Add Expense'}
                action={
                    !editingId && (
                        <div>
                            <input type="file" ref={fileInputRef} onChange={handleReceiptChange} className="hidden" accept="image/*" />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 text-sm font-bold transition-colors shadow-sm"
                            >
                                <UploadCloud size={16} />
                                Upload Receipt
                            </button>
                        </div>
                    )
                }
            >
                {receiptPreview && (
                    <div className="mb-6 p-4 bg-slate-50 border-2 border-dashed border-indigo-200 rounded-2xl relative animate-in fade-in zoom-in duration-300">
                        <button 
                            onClick={clearReceipt}
                            className="absolute top-2 right-2 p-1.5 bg-white text-slate-400 hover:text-rose-500 rounded-lg shadow-sm transition-colors border border-slate-100"
                        >
                            <X size={16} />
                        </button>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-full sm:w-32 h-40 bg-slate-200 rounded-xl overflow-hidden shrink-0 shadow-inner">
                                <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h4 className="text-sm font-black text-slate-800 mb-2">Receipt Uploaded</h4>
                                <p className="text-xs font-semibold text-slate-500 mb-4 max-w-sm">Tap extract details to automatically scan and populate the expense fields below using OCR.</p>
                                <button 
                                    onClick={handleExtractDetails} 
                                    disabled={isExtracting}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60"
                                >
                                    <Scan size={16} />
                                    {isExtracting ? 'Extracting Data...' : 'Extract Details'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
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

            <SectionCard title="Spending Breakdown" className="bg-white">
                {categoryDonutData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                        <PieChartIcon size={32} className="text-slate-300 mb-3" />
                        <p className="text-sm font-bold text-slate-500">No spending data yet.</p>
                        <p className="text-xs font-semibold mt-1">Add expenses to see your breakdown.</p>
                    </div>
                ) : (
                    <div className="h-[320px] w-full relative mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryDonutData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={85}
                                    outerRadius={120}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryDonutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Legend 
                                    layout="vertical" 
                                    verticalAlign="middle" 
                                    align="right"
                                    formatter={(value) => {
                                        const dt = categoryDonutData.find(d => d.name === value);
                                        return <span className="text-sm font-bold text-slate-700 ml-1">{value} <span className="text-slate-400 ml-2 font-semibold text-xs">{dt?.percentage}%</span></span>;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -ml-[120px] sm:-ml-[160px] md:-ml[200px] lg:-ml-[250px] xl:-ml-[120px]">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Total</span>
                            <span className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(categoryDonutData.reduce((acc, curr) => acc + curr.value, 0))}</span>
                        </div>
                    </div>
                )}
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
                            <table className="w-full text-sm border-separate border-spacing-y-3">
                            <thead className="text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                <tr>
                                    <th className="pb-3 text-left pl-4">Description</th>
                                    <th className="pb-3 text-left">Category</th>
                                    <th className="pb-3 text-left">Date</th>
                                    <th className="pb-3 text-left">Note</th>
                                    <th className="pb-3 text-right">Amount</th>
                                    <th className="pb-3 text-right pr-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense._id} className="bg-white hover:bg-slate-50/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] transition-colors group rounded-xl">
                                        <td className="py-4 pl-4 rounded-l-xl">
                                            <p className="font-bold text-slate-800">{expense.description}</p>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                                                    {getCategoryIcon(expense.category)}
                                                </div>
                                                <span className="font-semibold text-slate-600">{expense.category}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-slate-500 font-medium">
                                            {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="py-4 text-slate-500 truncate max-w-[150px]">
                                            {expense.note || <span className="text-slate-300">-</span>}
                                        </td>
                                        <td className="py-4 text-right font-black text-slate-900 text-base">
                                            {formatCurrency(expense.amount, expense.currency || 'INR')}
                                        </td>
                                        <td className="py-4 pr-4 rounded-r-xl">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(expense)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense._id)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>

                        <div className="md:hidden space-y-3">
                            {expenses.map((expense) => (
                                <div key={expense._id} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-xl bg-teal-50 text-teal-600 shrink-0">
                                                {getCategoryIcon(expense.category)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{expense.description}</p>
                                                <p className="text-xs font-semibold text-slate-500 mt-0.5">{expense.category}</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-slate-900 text-lg whitespace-nowrap">
                                            {formatCurrency(expense.amount, expense.currency || 'INR')}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                        <p className="text-xs font-medium text-slate-400">
                                            {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleEdit(expense)}
                                                className="text-xs font-bold text-teal-600 hover:text-teal-700 uppercase tracking-wide"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(expense._id)}
                                                className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wide"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {!expenses.length ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-slate-500 font-semibold mb-1">No expenses found.</p>
                                <p className="text-xs text-slate-400">Try adjusting your filters or adding a new one.</p>
                            </div>
                        ) : null}
                    </>
                )}
            </SectionCard>
        </div>
    );
};

export default ExpensesPage;