import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('profile/');
                    setUser(response.data);
                } catch (error) {
                    console.error("Auth check failed:", error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        const response = await api.post('login/', { username, password });
        const { token } = response.data;
        localStorage.setItem('token', token);
        // Fetch full profile
        const profileResponse = await api.get('profile/');
        setUser(profileResponse.data);
        return response.data;
    };

    const register = async (userData) => {
        const response = await api.post('register/', userData);
        const { token } = response.data;
        localStorage.setItem('token', token);
        // Fetch full profile to be consistent
        const profileResponse = await api.get('profile/');
        setUser(profileResponse.data);
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('logout/');
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
