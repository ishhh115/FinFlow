import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/auth/authService.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const hasToken = !!localStorage.getItem('token');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(hasToken);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getProfile()
                .then(data => setUser(data.data))
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        }
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);