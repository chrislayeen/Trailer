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
            console.log('--- ADMIN LOGIN AUDIT ---');
            console.log('Payload:', { name, pin, pinType: typeof pin });

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .ilike('name', name) // Case-insensitive name match
                .eq('pin', pin)      // Match exactly as stored (text)
                .eq('role', 'admin') // Case-sensitive strict role match
                .maybeSingle();

            console.log('Query Result:', { data, error });

            if (error) {
                console.error('Supabase Query Failure:', {
                    code: error.code,
                    message: error.message,
                    hint: error.hint
                });
                throw new Error(`Database error: ${error.message}`);
            }

            if (!data) {
                console.warn('Audit Result: ACCESS DENIED. Reason: Record not found in public.users where name matches, pin matches, and role=\'admin\'.');
                console.log('RLS Check: If Test 2 in Login.jsx was SUCCESS but this returns null, ensure your Admin user exists and RLS allows SELECT.');
                throw new Error('Invalid credentials or unauthorized access');
            }

            console.log('Audit Result: ACCESS GRANTED for user:', data.name);
            console.log('-------------------------');

            setAdmin(data);
            localStorage.setItem('admin_session', JSON.stringify(data));
            return data;
        } catch (err) {
            console.error('Audit Conclusion: Login process terminated unexpectedly.', err.message);
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
