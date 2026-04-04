import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    CalendarDays,
    Wallet,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Receipt,
} from 'lucide-react';
import { getDashboard, getSpendingStreak } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import SectionCard from '../components/common/SectionCard';
import StatCard from '../components/common/StatCard';
import ProgressBar from '../components/common/ProgressBar';

const CATEGORY_COLORS = [
    'bg-teal-400', 
    'bg-emerald-400', 
    'bg-cyan-400', 
    'bg-sky-400', 
    'bg-indigo-400', 
    'bg-violet-400', 
    'bg-fuchsia-400'
];

const CATEGORY_TEXT_COLORS = [
    'text-teal-700', 
    'text-emerald-700', 
    'text-cyan-700', 
    'text-sky-700', 
    'text-indigo-700', 
    'text-violet-700', 
    'text-fuchsia-700'
];

const CATEGORY_BG_COLORS = [
    'bg-teal-50', 
    'bg-emerald-50', 
    'bg-cyan-50', 
    'bg-sky-50', 
    'bg-indigo-50', 
    'bg-violet-50', 
    'bg-fuchsia-50'
];

const currencyFormatter = (amount, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(amount || 0);

const DashboardPage = () => {
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const [dashboardResponse, streakResponse] = await Promise.all([
                getDashboard(),
                getSpendingStreak(),
            ]);
            setDashboard(dashboardResponse.data);
            setStreak(streakResponse.data.streak || 0);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const monthlyBarData = useMemo(() => {
        if (!dashboard?.monthlySpending) return [];
        return dashboard.monthlySpending.map((item) => ({
            name: `${item._id.month}/${item._id.year}`,
            total: item.total,
        }));
    }, [dashboard]);

    const categoryPieData = useMemo(() => {
        if (!dashboard?.categorySpending) return [];
        return dashboard.categorySpending.map((item) => ({
            name: item._id,
            value: item.total,
        }));
    }, [dashboard]);



    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-teal-600 font-bold tracking-widest uppercase text-sm animate-pulse">Loading dashboard...</div>
            </div>
        );
    }

    if (!dashboard) {
        return <div className="text-rose-500 font-medium p-6 bg-rose-50 rounded-2xl">Unable to load dashboard data.</div>;
    }

    const activeCurrency = user?.currency || 'INR';

    return (
        <div className="space-y-10 relative">
            {/* Ambient Background Grid Effect for the whole dashboard body */}
            <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4 }}></div>
            
            {/* 1. SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative z-10">
                <StatCard 
                    label="This Month" 
                    value={currencyFormatter(dashboard.totalThisMonth, activeCurrency)} 
                    icon={Wallet} 
                />
                <StatCard 
                    label="Last Month" 
                    value={currencyFormatter(dashboard.totalLastMonth, activeCurrency)} 
                    icon={CalendarDays} 
                />
                <StatCard
                    label="Difference"
                    value={dashboard.difference > 0 ? `+${currencyFormatter(dashboard.difference, activeCurrency)}` : currencyFormatter(dashboard.difference, activeCurrency)}
                    tone={dashboard.difference > 0 ? 'danger' : 'success'}
                    icon={dashboard.difference > 0 ? ArrowDownRight : ArrowUpRight}
                />
                <StatCard 
                    label="Smart Streak" 
                    value={`${streak} days`} 
                    icon={Zap} 
                    tone="accent" 
                />
            </div>

            {/* 3 & 4. CHARTS & CATEGORY BREAKDOWN */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
                <SectionCard title="Category Spending" subtitle="Current month breakdown" className="xl:col-span-1">
                    <div className="h-[360px] flex flex-col justify-start pt-4 space-y-7 overflow-y-auto pr-3 custom-scrollbar">
                        {categoryPieData.map((item, index) => {
                            const percent = dashboard.totalThisMonth ? (item.value / dashboard.totalThisMonth) * 100 : 0;
                            const colorIdx = index % CATEGORY_COLORS.length;
                            return (
                                <div key={item.name} className="w-full group">
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[colorIdx]} shadow-sm`}></span>
                                            <span className="font-bold text-slate-800 tracking-tight text-base">{item.name}</span>
                                        </div>
                                        <div className="text-right flex items-baseline gap-2">
                                            <span className="text-slate-900 font-bold text-lg">
                                                {currencyFormatter(item.value, activeCurrency)}
                                            </span>
                                            <span className="text-slate-400 font-semibold text-xs bg-slate-50 px-2 py-0.5 rounded-md">
                                                {percent.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                                        <div
                                            className={`h-full ${CATEGORY_COLORS[colorIdx]} rounded-full transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:brightness-110`}
                                            style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {categoryPieData.length === 0 && (
                            <div className="flex flex-col items-center justify-center text-slate-400 h-full">
                                <span className="text-sm font-bold uppercase tracking-widest mt-4">No Data</span>
                            </div>
                        )}
                    </div>
                </SectionCard>

                <SectionCard title="6-Month Trend" subtitle="Visualize your cash flow direction" className="xl:col-span-2">
                    <div className="h-[360px] pt-6 relative group w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 600}} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 600}} dx={-10} />
                                <Tooltip 
                                    formatter={(value) => currencyFormatter(value, activeCurrency)}
                                    cursor={{fill: '#f8fafc', opacity: 0.6}}
                                    contentStyle={{borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px 16px', fontWeight: 'bold', color: '#0f172a'}}
                                />
                                <Bar dataKey="total" fill="url(#tealGradient)" radius={[8, 8, 8, 8]} maxBarSize={48} className="transition-all duration-300 hover:brightness-110" />
                                <defs>
                                    <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#2dd4bf" />
                                        <stop offset="100%" stopColor="#0f766e" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>
            </div>

            {/* 5. TABLES & 6. BUDGET HEALTH */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
                <div className="xl:col-span-2 space-y-8">
                    <SectionCard
                        title="Recent Expenses"
                        subtitle="Your latest transactions detailed"
                        action={
                            <button
                                onClick={loadDashboard}
                                className="px-6 py-2.5 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-900 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all duration-300 hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] transform hover:-translate-y-0.5"
                            >
                                Refresh
                            </button>
                        }
                    >
                    <div className="overflow-x-auto mt-4 px-1 pb-4">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr>
                                    <th className="pb-4 pt-2 font-bold uppercase tracking-widest text-[10px] text-slate-400">Description</th>
                                    <th className="pb-4 pt-2 font-bold uppercase tracking-widest text-[10px] text-slate-400">Category</th>
                                    <th className="pb-4 pt-2 font-bold uppercase tracking-widest text-[10px] text-slate-400">Date</th>
                                    <th className="pb-4 pt-2 font-bold uppercase tracking-widest text-[10px] text-slate-400 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="space-y-3 block mt-2" style={{ display: 'table-row-group' }}>
                                {dashboard.recentExpenses.map((expense) => {
                                    // Generate a deterministic color mapping for badging
                                    const categoryHash = expense.category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                    const colorIdx = categoryHash % CATEGORY_COLORS.length;
                                    
                                    return (
                                        <tr key={expense._id} className="group relative border-b border-transparent hover:bg-slate-50/80 transition-all duration-300 rounded-xl">
                                            {/* We use wrapper div in cells to simulate row gap/rounding securely */}
                                            <td className="py-4 px-3 first:rounded-l-2xl font-bold text-slate-800 text-sm">{expense.description}</td>
                                            <td className="py-4 px-3">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${CATEGORY_BG_COLORS[colorIdx]} ${CATEGORY_TEXT_COLORS[colorIdx]}`}>
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="py-4 px-3 text-slate-500 font-semibold text-sm">{new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                            <td className="py-4 px-3 text-right last:rounded-r-2xl">
                                                <span className="font-black text-slate-900 tracking-tight text-base">
                                                    {currencyFormatter(expense.amount, expense.currency || activeCurrency)}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {dashboard.recentExpenses.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-16 text-center bg-slate-50/50 rounded-3xl border-2 border-slate-100 border-dashed">
                                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                                    <Receipt className="text-slate-300 w-8 h-8" />
                                                </div>
                                                <h4 className="text-slate-900 font-bold text-lg mb-1">No expenses yet</h4>
                                                <p className="text-slate-500 font-medium text-sm mb-6">Looks like you haven't recorded any expenses. Start tracking to see insights.</p>
                                                <Link to="/expenses" className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/20">
                                                    Add First Expense
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
                </div>

                <div className="space-y-8">
                    {/* INVERTED DARK THEME BUDGET SECTION */}
                    <div className="rounded-[2.5rem] bg-slate-950 text-white p-8 lg:p-10 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -m-24 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-teal-400/30 transition-all duration-700"></div>
                        
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black text-white tracking-tight">Budget Health</h2>
                            <p className="text-sm font-bold text-slate-400 mt-1.5 uppercase tracking-wider mb-8">Monthly utilization pulse</p>

                            <div className="flex flex-col mt-6 relative">
                                <div className="flex justify-between items-baseline mb-6">
                                    <span className="text-7xl font-black tracking-tighter text-white">{dashboard.budgetPercentage}<span className="text-3xl text-slate-500 ml-1">%</span></span>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-2xl ${dashboard.budgetPercentage > 90 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                                        {dashboard.budgetPercentage > 90 ? 'Warning' : 'Healthy'}
                                    </span>
                                </div>
                            
                                {/* Rich structured modern Progress Bar */}
                                <div className="relative h-5 w-full bg-slate-900 rounded-full overflow-hidden mb-10 border border-white/5">
                                    <div
                                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${dashboard.budgetPercentage > 90 ? 'bg-gradient-to-r from-rose-600 to-rose-400' : 'bg-gradient-to-r from-teal-500 to-emerald-400'}`}
                                        style={{ width: `${Math.min(Math.max(dashboard.budgetPercentage, 0), 100)}%` }}
                                    >
                                        <div className="w-full h-full opacity-40 right-0 absolute bg-[length:1rem_1rem] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuNSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')] animate-[slide_1s_linear_infinite]"></div>
                                    </div>
                                </div>
                                
                                <div className="bg-slate-900 rounded-3xl p-7 border border-white/5 flex flex-col gap-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3"><TargetIcon /> Total Budget</span>
                                        <span className="text-xl font-black text-white">{currencyFormatter(dashboard.totalBudget, activeCurrency)}</span>
                                    </div>
                                    <div className="h-px bg-white/5 w-full"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3"><FlameIcon /> Top Spend</span>
                                        {dashboard.biggestCategory ? (
                                            <span className="text-[11px] font-black text-slate-900 bg-white px-3 py-1.5 rounded-xl uppercase tracking-widest">{dashboard.biggestCategory._id}</span>
                                        ) : (
                                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">N/A</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insight Discovery */}
            <div className="grid grid-cols-1 relative z-10 pb-8">
                <div className="rounded-[2.5rem] bg-gradient-to-r from-slate-900 to-indigo-950 p-8 lg:p-10 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-400 relative overflow-hidden group flex items-center justify-between">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between w-full gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-4">
                                <Zap className="text-amber-400" size={14} />
                                <span className="text-xs font-bold uppercase tracking-widest text-indigo-50">Brain</span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight text-white mb-2">Automated Financial Insights</h3>
                            <p className="text-sm font-semibold text-indigo-200/80 max-w-md">Our AI analyzes your spending behavior to find savings opportunities and track financial anomalies instantly.</p>
                        </div>
                        
                        <Link to="/insights" className="shrink-0 group/btn bg-white text-indigo-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)]">
                            Unlock AI Insights
                            <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
            
            {/* Inject minimal custom keyframes natively */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slide {
                    0% { background-position: 0 0; }
                    100% { background-position: 1rem 0; }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
            `}} />
        </div>
    );
};

/* Mini Icons for Budget Health explicitly */
const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);
const FlameIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
);

export default DashboardPage;