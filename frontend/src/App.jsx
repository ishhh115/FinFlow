import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';
import AIAssistant from './components/common/AIAssistant';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ExpensesPage from './pages/expenses/ExpensesPage';
import BudgetPage from './pages/budget/BudgetPage';
import InsightsPage from './pages/insights/InsightsPage';
import SettingsPage from './pages/settings/SettingsPage';

const THEME_STORAGE_KEY = 'finflow_theme_mode';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    return user ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Routes>
    );
}

function App() {
    useEffect(() => {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        const theme = storedTheme === 'dark' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme;
    }, []);

    return (
        <Router>
            <AuthProvider>
                <Toaster position="top-right" />
                <AIAssistant />
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;