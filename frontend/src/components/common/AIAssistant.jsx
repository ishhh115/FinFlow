import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Send, Sparkles, Loader2, Maximize2, Minimize2, Trash2, Plus, MessageCircle, Menu, PanelLeftClose } from 'lucide-react';
import { askAi } from '../../services/insights/insightService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { TrendingDown, PiggyBank, PieChart as PieChartIcon, Activity, Target, Coffee } from 'lucide-react';

const SUGGESTED_PROMPTS = [
    { text: "Where am I overspending?", icon: TrendingDown, color: "text-rose-500", bg: "bg-rose-50" },
    { text: "How can I save ₹2000 this month?", icon: PiggyBank, color: "text-emerald-500", bg: "bg-emerald-50" },
    { text: "What is my biggest expense?", icon: PieChartIcon, color: "text-indigo-500", bg: "bg-indigo-50" },
    { text: "Show my spending trends", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
    { text: "Am I within budget?", icon: Target, color: "text-amber-500", bg: "bg-amber-50" },
    { text: "How much did I spend on food?", icon: Coffee, color: "text-orange-500", bg: "bg-orange-50" }
];

const AIAssistant = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    const [chats, setChats] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`finflow_ai_chats_${user._id}`);
        if (saved) return JSON.parse(saved);
        
        // Backward compatibility
        const oldHistory = localStorage.getItem(`finflow_ai_history_${user._id}`);
        if (oldHistory) {
            const parsed = JSON.parse(oldHistory);
            if (parsed.length > 0) {
                return [{
                    id: Date.now().toString(),
                    title: 'Previous Chat',
                    messages: parsed,
                    updatedAt: new Date().toISOString()
                }];
            }
        }
        return [];
    });
    const [activeChatId, setActiveChatId] = useState(chats.length > 0 ? chats[0].id : null);
    
    // Derived messages
    const activeChat = chats.find(c => c.id === activeChatId);
    const messages = activeChat ? activeChat.messages : [];

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Synchronize to localStorage whenever chats change
    useEffect(() => {
        if (user && chats.length > 0) {
            localStorage.setItem(`finflow_ai_chats_${user._id}`, JSON.stringify(chats));
        }
    }, [chats, user]);

    const startNewChat = useCallback(() => {
        const hour = new Date().getHours();
        let timeGreeting = "Good evening";
        if (hour < 12) timeGreeting = "Good morning";
        else if (hour < 17) timeGreeting = "Good afternoon";

        const userName = user?.name ? user.name.split(' ')[0] : '';
        const greetingStr = userName 
            ? `${timeGreeting}, ${userName}! 👋 How can I help you optimize your finances today?`
            : `Hi there! 👋 How can I help you today?`;

        const newChat = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [{ role: 'ai', content: greetingStr, timestamp: new Date().toISOString() }],
            updatedAt: new Date().toISOString()
        };
        
        setChats(prev => [newChat, ...prev]);
        setActiveChatId(newChat.id);
    }, [user]);

    // Initialization check
    useEffect(() => {
        if (!user) return;
        if (chats.length === 0) {
            startNewChat();
        } else if (!activeChatId) {
            setActiveChatId(chats[0].id);
        }
    }, [user, chats.length, activeChatId, startNewChat]);

    const updateChatMessages = (updater) => {
        setChats(prev => prev.map(c => {
            if (c.id === activeChatId) {
                const newMessages = typeof updater === 'function' ? updater(c.messages) : updater;
                
                let newTitle = c.title;
                if (c.title === 'New Chat') {
                    const firstUserMsg = newMessages.find(m => m.role === 'user');
                    if (firstUserMsg && firstUserMsg.content) {
                        const cleanText = firstUserMsg.content.replace(/[^\w\s-]/g, '').trim();
                        const words = cleanText.split(/\s+/);
                        if (words.length > 0 && words[0] !== "") {
                            newTitle = words.slice(0, 5).join(' ');
                            newTitle = newTitle.charAt(0).toUpperCase() + newTitle.slice(1);
                        }
                    }
                }
                return { ...c, messages: newMessages, title: newTitle, updatedAt: new Date().toISOString() };
            }
            return c;
        }));
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isChatOpen) scrollToBottom();
    }, [messages, isChatOpen]);

    if (!user) return null;

    const handleClearChat = () => {
        if (window.confirm("Are you sure you want to delete this chat session?")) {
            setChats(prev => prev.filter(c => c.id !== activeChatId));
            setActiveChatId(null);
            
            // if deleting the last chat, manually trigger a clean state reset
            if (chats.length <= 1) {
                localStorage.removeItem(`finflow_ai_chats_${user._id}`);
            }
        }
    };

    const handleSend = async (queryText = input) => {
        const query = queryText.trim();
        if (!query) return;

        const newUserMessage = { role: 'user', content: query, timestamp: new Date().toISOString() };
        updateChatMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const contextStr = location.pathname.includes('/insights') ? 'insights' : 
                               location.pathname.includes('/dashboard') ? 'dashboard' : 'general';
            const response = await askAi(query, contextStr);
            updateChatMessages(prev => [...prev, { role: 'ai', content: response.answer, timestamp: new Date().toISOString() }]);
        } catch {
            toast.error("Failed to get AI response");
            updateChatMessages(prev => [...prev, { role: 'ai', content: "I'm having trouble connecting to my brain right now. Try again later!", timestamp: new Date().toISOString() }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* FLOATING BUTTON */}
            <button 
                type="button"
                onClick={() => setIsChatOpen(true)}
                className={`fixed bottom-8 right-8 z-[9999] p-4 rounded-full bg-gradient-to-r from-teal-500 to-indigo-500 text-white shadow-[0_10px_25px_-5px_rgba(20,184,166,0.5)] hover:scale-105 hover:shadow-[0_15px_35px_-5px_rgba(20,184,166,0.6)] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${isChatOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
                aria-label="Open AI Assistant"
            >
                <Sparkles size={24} className="animate-pulse" />
            </button>

            {/* CHAT PANEL */}
            <div 
                className={`fixed z-[9999] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right 
                ${isChatOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'} 
                ${isMaximized 
                    ? 'top-0 left-0 right-0 bottom-0 w-full h-[100dvh] rounded-none border-none' 
                    : 'bottom-8 right-8 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md h-[600px] max-h-[80vh] rounded-3xl'
                }`}
            >
                {/* Header */}
                <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 z-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    {/* Ambient Glow */}
                    <div className="absolute top-0 right-1/4 -m-10 w-48 h-20 bg-teal-500/20 rounded-[100%] blur-xl pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent opacity-70"></div>
                    
                    {/* Left Section */}
                    <div className="flex items-center gap-3">
                        {isMaximized && (
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsSidebarOpen(prev => !prev);
                                }}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors mr-1"
                                aria-label="Toggle Sidebar"
                            >
                                {isSidebarOpen ? <PanelLeftClose size={20} /> : <Menu size={20} />}
                            </button>
                        )}
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500/20 to-indigo-500/20 border border-teal-500/30 rounded-xl flex items-center justify-center transform -rotate-2">
                            <Sparkles size={18} className="text-teal-400 transform rotate-2" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <h3 className="text-white font-bold text-base leading-tight tracking-tight">FinFlow AI</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <p className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">{isMaximized ? 'Deep Analysis Engine' : 'AI Assistant'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2">
                        {messages.length > 1 && (
                            <button 
                                onClick={handleClearChat}
                                className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200"
                                aria-label="Clear Chat"
                                title="Clear Chat History"
                            >
                                <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                        )}
                        <button 
                            onClick={() => setIsMaximized(!isMaximized)}
                            className="p-2.5 text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-lg transition-all duration-200"
                            aria-label={isMaximized ? "Minimize" : "Maximize"}
                        >
                            {isMaximized ? <Minimize2 size={18} strokeWidth={2.5} /> : <Maximize2 size={18} strokeWidth={2.5} />}
                        </button>
                        <div className="w-px h-5 bg-slate-800 mx-1"></div>
                        <button 
                            type="button"
                            onClick={() => { setIsChatOpen(false); setIsMaximized(false); }}
                            className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200"
                            aria-label="Close"
                        >
                            <X size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA (Sidebar + Chat) */}
                <div className="flex-1 flex flex-row overflow-hidden relative">
                    
                    {/* SIDEBAR (Visible only when Maximized, toggleable) */}
                    {isMaximized && (
                        <>
                            {/* Mobile overlay backdrop */}
                            <div 
                                className={`sm:hidden absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-10 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                                onClick={() => setIsSidebarOpen(false)}
                            />
                            
                            <div 
                                className={`absolute sm:relative h-full z-20 flex flex-col shrink-0 bg-slate-50 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${isSidebarOpen ? 'translate-x-0 w-[260px] border-r border-slate-200 shadow-2xl sm:shadow-none' : '-translate-x-full w-[260px] sm:w-0 sm:translate-x-0 opacity-0 pointer-events-none border-transparent'}`}
                            >
                                <div className="w-[260px] h-full flex flex-col shrink-0 bg-slate-50">
                                    <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                                        <span className="font-bold text-slate-800 text-sm tracking-tight">Recents</span>
                                        <button 
                                            onClick={startNewChat}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Plus size={14} strokeWidth={3} />
                                            New
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar shadow-[inset_-10px_0_20px_-10px_rgba(0,0,0,0.02)]">
                                        {chats.map(c => (
                                            <button 
                                                key={c.id}
                                                onClick={() => {
                                                    setActiveChatId(c.id);
                                                    if (window.innerWidth < 640) setIsSidebarOpen(false); // auto-close on mobile
                                                }}
                                                className={`w-full flex items-center gap-2.5 p-3 text-left rounded-xl transition-all duration-200 group ${activeChatId === c.id ? 'bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200/50 border border-transparent'}`}
                                            >
                                                <MessageCircle size={15} className={`shrink-0 ${activeChatId === c.id ? 'text-teal-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                                <div className="flex-1 flex flex-col overflow-hidden">
                                                    <span className="text-sm font-semibold truncate leading-tight">{c.title === 'New Chat' && c.messages.length > 1 ? c.messages.find(m => m.role === 'user')?.content || 'New Chat' : c.title}</span>
                                                    <span className="text-[10px] text-slate-400 mt-0.5">{new Date(c.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* MAIN CHAT CONTEXT */}
                    <div className="flex-1 flex flex-col overflow-hidden relative bg-white">
                        
                        {/* Messages Area */}
                        <div className={`flex-1 overflow-y-auto ${isMaximized ? 'px-6 py-6 sm:px-10 sm:py-8' : 'p-6'} w-full flex flex-col ${messages.length === 1 ? 'justify-center' : 'justify-start space-y-6'}`}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'ai' && (
                                <div className="w-8 h-8 shrink-0 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-3 self-end shadow-sm border border-teal-200">
                                    <Sparkles size={14} />
                                </div>
                            )}
                            <div 
                                className={`max-w-[80%] rounded-2xl p-4 text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}`}
                            >
                                {msg.role === 'user' ? (
                                    msg.content
                                ) : (
                                    <div className="prose prose-sm prose-slate prose-p:leading-relaxed prose-p:my-1 prose-ul:my-1 prose-li:my-0 marker:text-teal-500">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {messages.length === 1 && (
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
                            {SUGGESTED_PROMPTS.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(prompt.text)}
                                    className="flex items-start gap-3 p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-300 rounded-2xl text-left transition-all duration-300 hover:shadow-md group"
                                >
                                    <div className={`p-2.5 rounded-xl ${prompt.bg} ${prompt.color} transition-transform group-hover:scale-110`}>
                                        <prompt.icon size={18} />
                                    </div>
                                    <div className="flex-1 mt-1 font-semibold text-slate-700 text-sm">{prompt.text}</div>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="w-8 h-8 shrink-0 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-3 self-end shadow-sm border border-teal-200">
                                <Sparkles size={14} />
                            </div>
                            <div className="max-w-[80%] rounded-2xl rounded-bl-none p-4 bg-white text-slate-700 border border-slate-200 shadow-sm flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-teal-500" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Analyzing...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="shrink-0 p-4 bg-white border-t border-slate-100 relative shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                    <div className="max-w-5xl mx-auto w-full">
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex gap-2"
                        >
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your finances..."
                                className={`flex-1 bg-slate-50/80 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all shadow-inner ${isMaximized ? 'py-5' : 'py-3.5'}`}
                                disabled={isTyping}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className={`${isMaximized ? 'px-8' : 'px-5'} bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center shadow-md`}
                            >
                                <Send size={18} className="transform -ml-0.5 mt-0.5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        </div>
        </>
    );
};

export default AIAssistant;
