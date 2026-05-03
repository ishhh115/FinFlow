import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { askAi } from '../../services/insights/insightService';
import { getExpenses } from '../../services/expenses/expenseService';
import { getBudgets } from '../../services/budget/budgetService';
import { generateInsights, calculateSpendingVelocity, calculateMonthlyProjection } from '../../utils/financialInsights';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import {
    Download,
    Share2,
    BrainCircuit,
    TrendingUp,
    Sparkles,
    Send,
    Lightbulb,
    Target,
    Loader2,
    CalendarDays,
    Flame,
    Coffee,
    PieChart,
    Scissors,
    ShieldCheck,
    ZapOff,
    Activity,
    Search,
    List
} from 'lucide-react';

const SUGGESTED_QUERIES = [
    { 
        category: 'Spending Patterns',
        queries: [
            { text: "Compare my April spending to March", icon: CalendarDays },
            { text: "Identify my most expensive habits", icon: Flame },
            { text: "Show my weekend vs weekday spending", icon: Coffee },
            { text: "What category did I spend the most on?", icon: PieChart }
        ]
    },
    { 
        category: 'Savings & Strategy', 
        queries: [
            { text: "Where can I cut ₹5,000 immediately?", icon: Scissors },
            { text: "Suggest a budget for next month", icon: Target },
            { text: "How much should I save for an emergency?", icon: ShieldCheck },
            { text: "Find unused subscriptions to cancel", icon: ZapOff }
        ]
    },
    { 
        category: 'Deep Analysis', 
        queries: [
            { text: "Analyze my overall financial health", icon: Activity },
            { text: "Are there any anomalies in my spending?", icon: Search },
            { text: "Predict my end-of-month balance", icon: TrendingUp },
            { text: "Summarize my top 5 transactions", icon: List }
        ]
    }
];

const InsightsPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [chatInput, setChatInput] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleAskAi = async (e) => {
        if (e) e.preventDefault();
        const query = chatInput.trim();
        if (!query || isAiLoading) return;

        setIsAiLoading(true);
        setAiResponse('');
        // We will purposely not clear the input box yet, until success or user changes it manually, 
        // to match AI assistant standards or we can clear it and show the query in the results.
        // The prompt asks to "Display response below input section". Let's clear it since it feels clean.
        setChatInput('');

        try {
            const res = await askAi(query, 'insights');
            setAiResponse(res.answer);
        } catch (error) {
            console.error("AI Error:", error);
            toast.error("Failed to connect to AI");
            setAiResponse("I'm sorry, I couldn't process that right now. Please try again.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const [insightData, setInsightData] = useState({ behavior: '', risk: 'UNKNOWN', suggestions: [] });
    const [stats, setStats] = useState({ totalSpent: 0, projectedSpend: 0 });

    const loadInsights = async () => {
        setLoading(true);
        try {
            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            
            const startDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);
            const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

            const [budgetsRes, expensesRes] = await Promise.all([
                getBudgets(month, year),
                getExpenses({ startDate, endDate })
            ]);

            const budgets = budgetsRes.data || [];
            const expenses = (expensesRes.data || []).filter(exp => {
                const dateObj = new Date(exp.date);
                return dateObj.getMonth() + 1 === month && dateObj.getFullYear() === year;
            });

            // Calculate Dynamic View Variables
            const smartInsights = generateInsights(expenses, budgets, date);
            const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
            const velocity = calculateSpendingVelocity(totalSpent, date);
            const projectedSpend = calculateMonthlyProjection(velocity, date);

            setInsightData(smartInsights);
            setStats({ totalSpent, projectedSpend });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to load smart insights');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInsights();
    }, []);

    // Derived mocks from actual data for FinHealth
    const finHealthScore = insightData.risk === 'LOW' ? 92 : insightData.risk === 'MEDIUM' ? 68 : 42;
    const projectedSpend = stats.projectedSpend;

    // Circular Progress Math
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (finHealthScore / 100) * circumference;

    return (
        <div className="space-y-8 max-w-6xl mx-auto relative relative z-10 pb-10">
            {/* Ambient Background Grid */}
            <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4, zIndex: -1 }}></div>

            {/* 1. TOP HERO SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-950 text-white rounded-[2.5rem] p-8 lg:p-10 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-teal-400/30 transition-all duration-700"></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-5">
                        <BrainCircuit className="text-teal-400" size={14} />
                        <span className="text-xs font-bold uppercase tracking-widest text-teal-50">Intelligence Engine</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white mb-2">AI Intelligence Report</h1>
                    <p className="text-sm font-semibold text-slate-400 max-w-xl">Deep behavioral analysis of {user?.name}'s recent financial activities, identifying hidden saving opportunities and forecasting spend.</p>
                </div>

                <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest transition-all duration-300">
                        <Share2 size={16} />
                        Share
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white text-xs font-black uppercase tracking-widest shadow-[0_0_20px_-5px_rgba(20,184,166,0.4)] transition-all duration-300 hover:scale-105">
                        <Download size={16} />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* 2. GRID LAYOUT (ROW 1 & ROW 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* ROW 1: LEFT - FinHealth Score */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center items-center relative overflow-hidden group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 text-center">
                    <h3 className="text-lg font-black tracking-tight text-slate-900 absolute top-8 left-8">FinHealth Score</h3>
                    <div className="absolute top-8 right-8 px-2.5 py-1 bg-emerald-50 text-emerald-600 font-bold text-[10px] uppercase tracking-widest rounded-lg">Top 12%</div>

                    <div className="relative flex items-center justify-center mt-12 mb-6 w-48 h-48 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
                        {/* Background Ring */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r={radius} className="stroke-slate-100" strokeWidth="16" fill="transparent" />
                            {/* Foreground Ring */}
                            <circle
                                cx="96" cy="96" r={radius}
                                className="stroke-teal-500 drop-shadow-[0_0_15px_rgba(20,184,166,0.5)] transition-all duration-1000 ease-out"
                                strokeWidth="16" fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-black text-slate-900 tracking-tighter">{finHealthScore}</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600 mt-1">Excellent</span>
                        </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-500 px-6">Your financial foundation is robust. You carry a <span className="text-slate-800 font-bold">14% lower liability</span> than similar profiles in your demographic block.</p>
                </div>

                {/* ROW 1: RIGHT - Projected Spending */}
                <div className="bg-slate-50 rounded-[2.5rem] p-8 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/60 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-slate-900">Projected Spending</h3>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">End of month forecast</p>
                        </div>
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <TrendingUp className="text-emerald-500" size={20} />
                        </div>
                    </div>

                    <div className="my-auto">
                        <span className="text-6xl font-black tracking-tighter text-slate-900">
                            <span className="text-3xl text-slate-400 font-bold mr-1">₹</span>
                            {projectedSpend.toLocaleString()}
                        </span>

                        <div className="mt-8 space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold text-slate-600 bg-white p-4 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                                <span>Current Spend</span>
                                <span className="text-slate-900">₹{insightData?.summary?.totalSpent?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-600 bg-white p-4 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                                <span>Velocity Limit</span>
                                <span className="text-rose-500 px-2 py-1 bg-rose-50 rounded-lg">High risk • +15.0%</span>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed mt-2 text-center px-2">Based on historical velocity, you will breach your limit by <span className="text-slate-800 font-bold">Day 26</span>. Avoid non-essential retail targeting immediately.</p>
                        </div>
                    </div>
                </div>

                {/* ROW 2: LEFT - Monthly Analysis */}
                <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-slate-100 relative h-full">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Sparkles size={18} />
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-slate-900">Monthly Analysis</h3>
                    </div>

                    {loading ? (
                        <div className="animate-pulse space-y-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                                <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Querying ML Nodes...</p>
                            </div>
                            <div className="h-4 bg-slate-100/80 rounded-full w-3/4"></div>
                            <div className="h-4 bg-slate-100/80 rounded-full w-full"></div>
                        </div>
                    ) : (
                        <div className="prose prose-slate prose-sm max-w-none text-slate-600 font-medium leading-relaxed">
                            <div className="space-y-4">
                                <p className="text-slate-800 font-bold text-lg">Smart Behavior Analysis</p>
                                <p className="text-base text-slate-600 leading-loose">{insightData.behavior}</p>
                                
                                <div className="mt-8 pt-6 border-t border-slate-100">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Overall Risk Protocol</p>
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 ${
                                        insightData.risk === 'HIGH' ? 'bg-rose-50 text-rose-600' :
                                        insightData.risk === 'MEDIUM' ? 'bg-amber-50 text-amber-600' :
                                        'bg-emerald-50 text-emerald-600'
                                    } rounded-xl shadow-sm border border-transparent`}>
                                        <ShieldCheck size={18} />
                                        <span className="font-black text-xs uppercase tracking-widest">{insightData.risk}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ROW 2: RIGHT - Savings Opportunities */}
                <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-slate-100 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl">
                            <Lightbulb size={18} />
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-slate-900">Savings Opportunities</h3>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                        {loading ? (
                            <div className="h-16 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse"></div>
                        ) : insightData.suggestions.length > 0 ? (
                            insightData.suggestions.map((suggestion, idx) => {
                                const isCritical = suggestion.toLowerCase().includes("high alert") || suggestion.toLowerCase().includes("exceed");
                                return (
                                    <div key={idx} className={`p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-${isCritical ? 'rose' : 'amber'}-400 transition-colors group flex gap-4 relative overflow-hidden`}>
                                        {isCritical && (
                                            <div className="absolute top-0 right-0 px-2 py-0.5 bg-rose-500 text-white font-black text-[9px] uppercase tracking-widest rounded-bl-lg">CRITICAL</div>
                                        )}
                                        <div className={`w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-${isCritical ? 'rose' : 'amber'}-500 transition-colors`}>
                                            <Target size={20} />
                                        </div>
                                        <div className="flex-1 my-auto">
                                            <p className="text-sm text-slate-600 font-semibold leading-relaxed">{suggestion}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-bold flex gap-4 items-center">
                                <Sparkles size={24} />
                                You're doing excellent! No adjustments needed.
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* 3. BOTTOM SECTION - Ask FinFlow Anything */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-rose-500 opacity-80"></div>

                <h3 className="text-2xl font-black text-white tracking-tight mb-2">Ask FinFlow Anything</h3>
                <p className="text-sm font-semibold text-slate-400 mb-8">Get instant answers about your financial trends, specific transactions, or budgeting strategies directly from our AI.</p>

                <form
                    onSubmit={handleAskAi}
                    className="relative flex items-center"
                >
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="e.g. How much did I spend on food this weekend vs last weekend?"
                        className="w-full bg-slate-950 text-white rounded-2xl placeholder-slate-500 font-medium px-6 py-5 pr-16 border-2 border-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300"
                        disabled={isAiLoading}
                    />
                    <button
                        type="submit"
                        disabled={!chatInput.trim() || isAiLoading}
                        className="absolute right-3 p-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-teal-500 flex items-center justify-center"
                    >
                        {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="transform -ml-0.5 mt-0.5" />}
                    </button>
                </form>

                {/* AI Response Display Area */}
                {(isAiLoading || aiResponse) && (
                    <div className="mt-6 p-6 rounded-2xl bg-white text-slate-900 shadow-sm border border-slate-100 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Response</span>
                        </div>
                        {isAiLoading ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="animate-spin text-teal-500" size={20} />
                                <span className="text-sm font-bold text-slate-500">Scanning financial parameters...</span>
                            </div>
                        ) : (
                            <div className="prose prose-sm max-w-none prose-slate font-medium text-slate-700 marker:text-indigo-500">
                                <ReactMarkdown>{aiResponse}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-10">
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles size={16} className="text-teal-500" />
                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Suggested AI Queries</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {SUGGESTED_QUERIES.map((group, groupIdx) => (
                            <div key={groupIdx} className="space-y-4">
                                <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-500">{group.category}</h5>
                                <div className="space-y-3">
                                    {group.queries.map((q, qIdx) => {
                                        const Icon = q.icon;
                                        return (
                                            <button
                                                key={qIdx}
                                                onClick={() => { 
                                                    setChatInput(q.text); 
                                                    // Trigger form submission
                                                    setTimeout(() => document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 0); 
                                                }}
                                                className="w-full text-left p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-teal-500/40 hover:shadow-[0_4px_20px_-5px_rgba(20,184,166,0.15)] transition-all duration-300 group flex items-start gap-3"
                                            >
                                                <div className="p-2 rounded-xl bg-slate-900 text-slate-400 group-hover:text-teal-400 group-hover:bg-teal-500/10 transition-colors shrink-0">
                                                    <Icon size={16} />
                                                </div>
                                                <span className="text-xs font-semibold text-slate-300 group-hover:text-white leading-relaxed mt-0.5">{q.text}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default InsightsPage;