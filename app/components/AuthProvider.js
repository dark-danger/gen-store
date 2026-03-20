"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'khannayash394@gmail.com';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session — set loading=false immediately so UI doesn't block
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false); // Unblock UI immediately
            if (session?.user) {
                fetchProfile(session.user.id, session.user.email); // Load profile in background
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    fetchProfile(session.user.id, session.user.email);
                } else {
                    setProfile(null);
                    setIsAdmin(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId, userEmail) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code === 'PGRST116') {
                // Profile doesn't exist, create one
                const { data: newProfile } = await supabase
                    .from('profiles')
                    .insert([{ id: userId, role: 'user', full_name: '' }])
                    .select()
                    .single();
                setProfile(newProfile);
                setIsAdmin(false);
            } else if (data) {
                setProfile(data);
                // STRICT: Only this email can be admin
                setIsAdmin(data.role === 'admin' && userEmail === ADMIN_EMAIL);
            } else {
                setProfile(null);
                setIsAdmin(false);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        return data;
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Sign out error:', err);
        }
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            signUp,
            signIn,
            signOut,
            isAdmin,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
