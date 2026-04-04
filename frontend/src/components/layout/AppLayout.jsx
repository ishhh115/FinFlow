import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
    LayoutDashboard,
    Receipt,
    Target,
    Lightbulb,
    Settings,
    LogOut,
    Menu,
    X,
} from 'lucide-react';

const navLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/expenses', icon: Receipt, label: 'Expenses' },
    { path: '/budget', icon: Target, label: 'Budget' },
    { path: '/insights', icon: Lightbulb, label: 'AI Insights' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

const AppLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white
                transform transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:inset-auto
            `}>
                {/* Logo */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <img src="/logo.jpeg" alt="FinFlow" className="h-10 object-contain" />
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="p-4 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-lg
                                transition-colors duration-200
                                ${location.pathname === link.path
                                    ? 'bg-white/20 text-white font-medium'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }
                            `}
                        >
                            <link.icon size={20} />
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* User + Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-white/60">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Navbar */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-gray-600"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-800">
                        {navLinks.find(l => l.path === location.pathname)?.label || 'FinFlow'}
                    </h1>
                    <div className="flex items-center gap-3">
                        <p className="hidden sm:block text-sm text-gray-500">
                            Welcome, {user?.name?.split(' ')[0]}!
                        </p>
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 pb-24 lg:pb-6">
                    {children}
                </main>

                <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-2">
                    <div className="grid grid-cols-5 gap-1">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition ${
                                        isActive ? 'text-teal-700 bg-teal-50' : 'text-slate-500'
                                    }`}
                                >
                                    <link.icon size={18} />
                                    <span className="text-[11px] font-medium">{link.label.replace('AI ', '')}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default AppLayout;