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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Netflix-Inspired Top Navbar */}
            <header className="sticky top-0 z-50 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center justify-between px-4 md:px-8 py-4 max-w-full">
                    {/* Logo - Left */}
                    <Link to="/" className="flex-shrink-0 flex items-center">
                        <img src="/logo.jpg" alt="Logo" className="h-8 md:h-9 object-contain" />
                    </Link>

                    {/* Desktop Navigation - Center */}
                    <nav className="hidden md:flex items-center gap-1 flex-1 justify-center mx-8">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'text-white bg-white/10'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile / Logout - Right (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden lg:block">
                                <p className="text-xs font-medium text-gray-200">{user?.name?.split(' ')[0]}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                        >
                            <LogOut size={16} />
                            <span className="hidden lg:inline">Logout</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-gray-300 hover:text-white transition-colors"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Drop-down Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-black/90 border-t border-white/10 px-4 py-3 space-y-2">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all ${
                                        isActive
                                            ? 'text-white bg-white/10'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={18} />
                                    <span className="font-medium">{link.label}</span>
                                </Link>
                            );
                        })}
                        <div className="border-t border-white/10 pt-3 mt-3">
                            <div className="flex items-center gap-3 px-3 py-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-200">{user?.name}</p>
                                    <p className="text-xs text-gray-400">{user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-300 hover:text-white hover:bg-white/5 transition-all w-full"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Page Content */}
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                {children}
            </main>
        </div>
    );
};

export default AppLayout;