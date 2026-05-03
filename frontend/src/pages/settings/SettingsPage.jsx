import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { changePassword, updateProfile } from '../../services/auth/authService';
import {
    User, Shield, Settings2, DollarSign, BrainCircuit, Database, AlertTriangle, LogOut, Download, Trash2, Smartphone, RotateCcw
} from 'lucide-react';

const THEME_STORAGE_KEY = 'finflow_theme_mode';

const applyThemeMode = (isDarkMode) => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
};

const SettingsCard = ({ title, subtitle, icon: Icon, colorClass, children }) => (
    <div className="rounded-[2.5rem] bg-white border border-slate-100 p-8 lg:p-10 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden group">
        <div className={`absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 ${colorClass} rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-500`}></div>
        <div className="relative z-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className={`p-3.5 rounded-2xl ${colorClass.replace('bg-', 'text-').replace('-50', '-600')} bg-slate-50 shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900">{title}</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{subtitle}</p>
                </div>
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </div>
    </div>
);

const ToggleSwitch = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer" onClick={() => onChange(!checked)}>
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <div className={`w-12 h-6 rounded-full transition-colors duration-300 relative ${checked ? 'bg-teal-500' : 'bg-slate-300'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${checked ? 'left-7' : 'left-1'}`}></div>
        </div>
    </div>
);

const MENU_ITEMS = [
    { id: 'account', label: 'Account', icon: User, color: 'text-teal-600', activeBg: 'bg-teal-50', hover: 'hover:bg-teal-50' },
    { id: 'security', label: 'Security', icon: Shield, color: 'text-indigo-600', activeBg: 'bg-indigo-50', hover: 'hover:bg-indigo-50' },
    { id: 'preferences', label: 'Preferences', icon: Settings2, color: 'text-sky-600', activeBg: 'bg-sky-50', hover: 'hover:bg-sky-50' },
    { id: 'financial', label: 'Financial', icon: DollarSign, color: 'text-emerald-600', activeBg: 'bg-emerald-50', hover: 'hover:bg-emerald-50' },
    { id: 'ai', label: 'AI Settings', icon: BrainCircuit, color: 'text-fuchsia-600', activeBg: 'bg-fuchsia-50', hover: 'hover:bg-fuchsia-50' },
    { id: 'data', label: 'Data', icon: Database, color: 'text-blue-600', activeBg: 'bg-blue-50', hover: 'hover:bg-blue-50' },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, color: 'text-red-600', activeBg: 'bg-red-50', hover: 'hover:bg-red-50' },
];

const SettingsPage = () => {
    const { user, updateUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('account');
    
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    
    // Core Forms
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        currency: user?.currency || 'INR',
    });
    
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
    });

    // Mocked states for new features
    const [prefs, setPrefs] = useState({
        twoFactor: false,
        darkMode: false,
        notifications: true,
        dateFormat: 'DD/MM/YYYY',
        monthlyIncome: '100000',
        savingsGoal: '20000',
        budgetStrategy: '50-30-20',
        aiInsights: true,
        aiFrequency: 'daily',
        smartAlerts: true
    });

    // Avatar state
    const [avatarUrl, setAvatarUrl] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setProfileForm({
            name: user?.name || '',
            currency: user?.currency || 'INR',
        });
    }, [user]);

    useEffect(() => {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        const isDarkMode = storedTheme === 'dark';

        setPrefs((prev) => ({
            ...prev,
            darkMode: isDarkMode,
        }));

        applyThemeMode(isDarkMode);
    }, []);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            const response = await updateProfile(profileForm);
            updateUser(response.data);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }
        setPasswordLoading(true);
        try {
            await changePassword(passwordForm);
            setPasswordForm({ currentPassword: '', newPassword: '' });
            toast.success('Password updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleMockToggle = (key, val) => {
        setPrefs(p => ({ ...p, [key]: val }));

        if (key === 'darkMode') {
            localStorage.setItem(THEME_STORAGE_KEY, val ? 'dark' : 'light');
            applyThemeMode(val);
            toast.success(`Theme changed to ${val ? 'Dark' : 'Light'} mode`);
            return;
        }

        toast.success('Preference updated');
    };

    const handleMockSave = () => {
        toast.success('Configuration saved');
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarUrl(URL.createObjectURL(file));
            toast.success('Avatar updated');
        }
    };

    return (
        <div className="space-y-10 relative max-w-6xl mx-auto pb-12">
            {/* Ambient Background Grid Effect */}
            <div className="fixed inset-0 pointer-events-none z-[-1]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4 }}></div>
            
            <div className="relative z-10 mb-8 pt-4">
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">App Settings</h1>
                <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Manage your FinFlow experience</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 relative z-10">
                {/* 1. SIDEBAR NAVIGATION */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-white rounded-[2rem] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col gap-1 md:sticky md:top-8">
                        {MENU_ITEMS.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-bold text-left w-full ${
                                        isActive 
                                            ? `${item.activeBg} text-slate-900 shadow-sm border border-slate-100/50` 
                                            : `text-slate-500 hover:text-slate-700 ${item.hover} border border-transparent`
                                    }`}
                                >
                                    <item.icon size={20} className={isActive ? item.color : 'text-slate-400'} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. RIGHT CONTENT AREA */}
                <div className="flex-1 w-full max-w-full">
                    
                    {/* ACCOUNT TAB */}
                    {activeTab === 'account' && (
                        <form onSubmit={handleProfileSubmit}>
                            <SettingsCard title="Account" subtitle="Manage Identity" icon={User} colorClass="bg-teal-100">
                                <div className="filter drop-shadow-sm mb-6 flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-200 border-4 border-white shadow-sm flex items-center justify-center text-slate-400 font-black text-xl overflow-hidden shrink-0">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            profileForm.name ? profileForm.name.charAt(0).toUpperCase() : '?'
                                        )}
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                    <button onClick={() => fileInputRef.current?.click()} type="button" className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors">
                                        Change Avatar
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Email (Readonly)</label>
                                    <input value={user?.email || 'user@example.com'} readOnly className="w-full rounded-2xl bg-slate-100 border-2 border-transparent px-5 py-4 text-slate-500 font-bold opacity-70 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Display Name</label>
                                    <input value={profileForm.name} onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-5 py-4 text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm" required />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Default Currency</label>
                                    <input value={profileForm.currency} onChange={(e) => setProfileForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))} className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-5 py-4 text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm" maxLength={3} required />
                                </div>
                                <div className="pt-2">
                                    <button type="submit" disabled={profileLoading} className="w-full px-8 py-4 rounded-2xl bg-slate-900 text-white font-black tracking-wide shadow-sm hover:bg-slate-800 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                                        {profileLoading ? 'Saving...' : 'Save Identity'}
                                    </button>
                                </div>
                            </SettingsCard>
                        </form>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <form onSubmit={handlePasswordSubmit}>
                            <SettingsCard title="Security" subtitle="Access Protocols" icon={Shield} colorClass="bg-indigo-100">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Current Password</label>
                                    <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))} className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-5 py-4 text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm font-mono text-xl tracking-widest placeholder-slate-300" placeholder="••••••••" required />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">New Password</label>
                                    <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))} className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-5 py-4 text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm font-mono text-xl tracking-widest placeholder-slate-300" placeholder="••••••••" required />
                                </div>
                                <div className="pt-2">
                                    <button type="submit" disabled={passwordLoading} className="w-full px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black tracking-wide shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                                        {passwordLoading ? 'Updating Key...' : 'Update Password'}
                                    </button>
                                </div>
                                <div className="h-px bg-slate-100 my-6"></div>
                                <ToggleSwitch label="Enable Two-Factor Auth (2FA)" checked={prefs.twoFactor} onChange={(v) => handleMockToggle('twoFactor', v)} />
                                <button type="button" onClick={() => toast.success('Logged out from 3 other sessions')} className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition-all border border-slate-200">
                                    <Smartphone size={18} /> Logout from all devices
                                </button>
                            </SettingsCard>
                        </form>
                    )}

                    {/* PREFERENCES TAB */}
                    {activeTab === 'preferences' && (
                        <SettingsCard title="General Preferences" subtitle="App Experience" icon={Settings2} colorClass="bg-sky-100">
                            <ToggleSwitch label="Dark Mode UI" checked={prefs.darkMode} onChange={(v) => handleMockToggle('darkMode', v)} />
                            <ToggleSwitch label="Push Notifications" checked={prefs.notifications} onChange={(v) => handleMockToggle('notifications', v)} />
                            <div className="mt-4">
                                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Date Format</label>
                                <select value={prefs.dateFormat} onChange={(e) => handleMockToggle('dateFormat', e.target.value)} className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-5 py-4 text-slate-900 font-bold outline-none cursor-pointer focus:bg-white focus:border-sky-500 transition-colors">
                                    <option value="DD/MM/YYYY">DD/MM/YYYY (UK/IN)</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                                </select>
                            </div>
                        </SettingsCard>
                    )}

                    {/* FINANCIAL TAB */}
                    {activeTab === 'financial' && (
                        <SettingsCard title="Financial Profile" subtitle="Strategic Setup" icon={DollarSign} colorClass="bg-emerald-100">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Monthly Income Flow</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold pb-0.5">₹</span>
                                    <input type="number" value={prefs.monthlyIncome} onChange={(e) => setPrefs(p => ({ ...p, monthlyIncome: e.target.value }))} className="w-full rounded-2xl bg-slate-50 border-2 border-transparent pl-10 pr-5 py-4 text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Savings Goal</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold pb-0.5">₹</span>
                                    <input type="number" value={prefs.savingsGoal} onChange={(e) => setPrefs(p => ({ ...p, savingsGoal: e.target.value }))} className="w-full rounded-2xl bg-slate-50 border-2 border-transparent pl-10 pr-5 py-4 text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Budgeting Strategy</label>
                                <select value={prefs.budgetStrategy} onChange={(e) => setPrefs(p => ({ ...p, budgetStrategy: e.target.value }))} className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-5 py-4 text-slate-900 font-bold outline-none cursor-pointer focus:bg-white focus:border-emerald-500 transition-colors">
                                    <option value="50-30-20">50/30/20 Rule (Needs/Wants/Savings)</option>
                                    <option value="zero-based">Zero-Based Budgeting</option>
                                    <option value="pay-yourself">Pay Yourself First</option>
                                </select>
                            </div>
                            <div className="pt-2">
                                <button onClick={handleMockSave} type="button" className="w-full px-8 py-4 rounded-2xl bg-emerald-50 text-emerald-700 font-black tracking-wide border border-emerald-200 hover:bg-emerald-100 transition-colors">
                                    Update Financial Targets
                                </button>
                            </div>
                        </SettingsCard>
                    )}

                    {/* AI SETTINGS TAB */}
                    {activeTab === 'ai' && (
                        <SettingsCard title="Intelligence Engine" subtitle="AI Constraints" icon={BrainCircuit} colorClass="bg-fuchsia-100">
                            <ToggleSwitch label="Synthesize Financial Insights" checked={prefs.aiInsights} onChange={(v) => handleMockToggle('aiInsights', v)} />
                            <ToggleSwitch label="Proactive Smart Alerts" checked={prefs.smartAlerts} onChange={(v) => handleMockToggle('smartAlerts', v)} />
                            <div className="mt-4">
                                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Processing Frequency</label>
                                <select value={prefs.aiFrequency} onChange={(e) => handleMockToggle('aiFrequency', e.target.value)} className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-5 py-4 text-slate-900 font-bold outline-none cursor-pointer focus:bg-white focus:border-fuchsia-500 transition-colors">
                                    <option value="daily">Daily Processing</option>
                                    <option value="weekly">Weekly Summaries</option>
                                    <option value="monthly">Monthly Overview Only</option>
                                </select>
                            </div>
                        </SettingsCard>
                    )}

                    {/* DATA MANAGEMENT TAB */}
                    {activeTab === 'data' && (
                        <SettingsCard title="Data Management" subtitle="Export & Sync" icon={Database} colorClass="bg-blue-100">
                            <div className="space-y-4">
                                <button type="button" onClick={() => toast.success('Export initiated')} className="w-full flex items-center justify-between gap-2 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group">
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Export Timeline Data (CSV)</span>
                                    <Download size={18} className="text-slate-400 group-hover:text-blue-600" />
                                </button>
                                <button type="button" onClick={() => window.confirm('Reset configurations?') && toast.success('App configuration reset')} className="w-full flex items-center justify-between gap-2 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-400 hover:bg-slate-100 transition-colors group">
                                    <span className="text-sm font-bold text-slate-700">Reset App Configurations</span>
                                    <RotateCcw size={18} className="text-slate-400" />
                                </button>
                                <button type="button" onClick={() => window.confirm('Clear ALL tracking data permanently?') && toast.success('Wipe execution complete')} className="w-full flex items-center justify-between gap-2 px-6 py-4 rounded-2xl bg-rose-50 border border-rose-100 hover:border-rose-400 hover:bg-rose-100 transition-colors group">
                                    <span className="text-sm font-bold text-rose-700">Clear All Tracking Records</span>
                                    <Trash2 size={18} className="text-rose-500" />
                                </button>
                            </div>
                        </SettingsCard>
                    )}

                    {/* DANGER ZONE TAB */}
                    {activeTab === 'danger' && (
                        <SettingsCard title="Danger Zone" subtitle="Irreversible Actions" icon={AlertTriangle} colorClass="bg-red-100">
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-6">
                                Actions placed in this section will severely impact your experience instance and immediately revoke your login identity payload.
                            </p>
                            <div className="space-y-4">
                                <button onClick={logout} type="button" className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-sm">
                                    <LogOut size={18} /> Log Out Session
                                </button>
                                <button type="button" onClick={() => window.confirm('DELETE ACCOUNT FOREVER?')} className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black tracking-wide transition-all shadow-sm">
                                    <AlertTriangle size={18} /> Delete Account
                                </button>
                            </div>
                        </SettingsCard>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
