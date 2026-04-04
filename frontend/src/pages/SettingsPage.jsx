import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { changePassword, updateProfile } from '../services/authService';

const SettingsPage = () => {
    const { user, updateUser } = useAuth();
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        currency: user?.currency || 'INR',
    });
    
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
    });

    useEffect(() => {
        setProfileForm({
            name: user?.name || '',
            currency: user?.currency || 'INR',
        });
    }, [user]);

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

    return (
        <div className="space-y-10 relative max-w-5xl mx-auto">
            {/* Ambient Background Grid Effect */}
            <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4 }}></div>
            
            <div className="relative z-10 mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">App Settings</h1>
                <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Manage your FinFlow experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 pb-8">
                <form onSubmit={handleProfileSubmit} className="rounded-[2.5rem] bg-white border border-slate-100 p-8 lg:p-10 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-400 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-teal-50 rounded-full blur-3xl opacity-50 group-hover:bg-teal-100 transition-colors duration-500"></div>
                    <div className="relative z-10">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black tracking-tight text-slate-900">Profile Vault</h3>
                            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Manage Identity</p>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Display Name</label>
                                <input
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                                    className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-5 py-4 text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300 shadow-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Default Currency</label>
                                <input
                                    value={profileForm.currency}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                                    className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-5 py-4 text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300 shadow-sm"
                                    maxLength={3}
                                    required
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={profileLoading}
                                    className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black tracking-wide shadow-[0_8px_20px_-6px_rgba(20,184,166,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(20,184,166,0.6)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0"
                                >
                                    {profileLoading ? 'Saving...' : 'Save Identity'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                <form onSubmit={handlePasswordSubmit} className="rounded-[2.5rem] bg-white border border-slate-100 p-8 lg:p-10 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-400 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:bg-indigo-100 transition-colors duration-500"></div>
                    <div className="relative z-10">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black tracking-tight text-slate-900">Access Security</h3>
                            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Update Key</p>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                                    className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-5 py-4 text-slate-900 font-bold placeholder-slate-300 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-sm font-mono text-xl tracking-widest"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                                    className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-5 py-4 text-slate-900 font-bold placeholder-slate-300 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-sm font-mono text-xl tracking-widest"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white font-black tracking-wide shadow-[0_8px_20px_-6px_rgba(15,23,42,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(15,23,42,0.6)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0"
                                >
                                    {passwordLoading ? 'Updating Key...' : 'Update Key'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;
