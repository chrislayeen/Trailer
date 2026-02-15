import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Basic session persistence via localStorage for this Name + PIN flow
        const savedAdmin = localStorage.getItem('admin_session');
        if (savedAdmin) {
            setAdmin(JSON.parse(savedAdmin));
        }
        setLoading(false);
    }, []);

    const login = async (name, pin) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('name', name)
                .eq('pin', pin)
                .eq('role', 'admin')
                .single();

            if (error || !data) {
                throw new Error('Invalid credentials or unauthorized');
            }

            setAdmin(data);
            localStorage.setItem('admin_session', JSON.stringify(data));
            return data;
        } catch (err) {
            console.error('Login error:', err);
            throw err;
        }
    };

    const logout = () => {
        setAdmin(null);
        localStorage.removeItem('admin_session');
    };

    return (
        <AuthContext.Provider value={{ admin, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
