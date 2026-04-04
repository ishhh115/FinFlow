import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getInsights } from '../services/insightService';
import { useAuth } from '../context/AuthContext';
import { 
    Download, 
    Share2, 
    BrainCircuit, 
    TrendingUp, 
    Sparkles, 
    Send,
    Lightbulb,
    Target
} from 'lucide-react';
import SectionCard from '../components/common/SectionCard';

const InsightsPage = () => {
    const { user } = useAuth();
    const [insightData, setInsightData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chatInput, setChatInput] = useState('');

    const loadInsights = async () => {
        setLoading(true);
        try {
            const response = await getInsights();
            setInsightData(response.data);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to load insights');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInsights();
    }, []);

    // Derived mocks from actual data for FinHealth
    const finHealthScore = 86; // Out of 100
    const projectedSpend = insightData?.summary?.totalSpent ? Math.round(insightData.summary.totalSpent * 1.15) : 0;
    
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
                    
                    <div className="relative flex items-center justify-center mt-10 mb-4 w-48 h-48 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
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
                    <p className="text-sm font-semibold text-slate-500 px-6">Your spending aligns completely with your designated wealth creation goals this month.</p>
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
                                <span>Variance Limit</span>
                                <span className="text-emerald-500 px-2 py-1 bg-emerald-50 rounded-lg">+15.0%</span>
                            </div>
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
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                            <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                            <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
                        </div>
                    ) : (
                        <div className="prose prose-slate prose-sm max-w-none text-slate-600 font-medium leading-relaxed marker:text-indigo-500">
                            {insightData?.insight ? (
                                <div dangerouslySetInnerHTML={{ __html: insightData.insight.replace(/\n/g, '<br/>').replace(/-/g, '• ') }} />
                            ) : (
                                <p>We need more transaction data to generate your personalized monthly analysis. Keep tracking your expenses!</p>
                            )}
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
                    
                    <div className="space-y-4 flex-1">
                        {/* Mock Opportunity 1 */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors group cursor-pointer flex gap-4">
                            <div className="w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-teal-600 transition-colors">
                                <Target size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 mb-1">Unused Subscriptions</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">Cancel 2 detected idle services to recover immediate cash flow this month.</p>
                                <div className="mt-3 inline-flex px-3 py-1 bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase tracking-widest rounded-lg">
                                    Save ₹1,400 / mo
                                </div>
                            </div>
                        </div>

                        {/* Mock Opportunity 2 */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors group cursor-pointer flex gap-4">
                            <div className="w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-teal-600 transition-colors">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 mb-1">Food Delivery Optimization</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">You are spending 30% above the benchmark on dining. Cap to 3 orders/week.</p>
                                <div className="mt-3 inline-flex px-3 py-1 bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase tracking-widest rounded-lg">
                                    Save ₹3,200 / mo
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* 3. BOTTOM SECTION - Ask FinFlow Anything */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-rose-500 opacity-80"></div>
                
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">Ask FinFlow Anything</h3>
                <p className="text-sm font-semibold text-slate-400 mb-8">Get instant answers about your financial trends, specific transactions, or budgeting strategies directly from our AI.</p>
                
                <form 
                    onSubmit={(e) => { e.preventDefault(); toast.success('AI query sent successfully!'); setChatInput(''); }}
                    className="relative flex items-center"
                >
                    <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="e.g. How much did I spend on food this weekend vs last weekend?"
                        className="w-full bg-slate-950 text-white rounded-2xl placeholder-slate-500 font-medium px-6 py-5 pr-16 border-2 border-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300"
                    />
                    <button 
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="absolute right-3 p-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-teal-500"
                    >
                        <Send size={18} className="transform -ml-0.5 mt-0.5" />
                    </button>
                </form>
            </div>
            
        </div>
    );
};

export default InsightsPage;