"use server";

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ddpyqiuphhuecnhmfsjn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcHlxaXVwaGh1ZWNuaG1mc2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5OTcyNzEsImV4cCI6MjA4OTU3MzI3MX0.6mqISaD-_bTVE7fhEa3IPENJjSp1SnopjleoXu2Tt1s';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function signInAction(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return { session: data.session, user: data.user, success: true };
    } catch (error) {
        return { error: error.message, success: false };
    }
}

export async function signUpAction(email, password, fullName) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName }
            }
        });
        
        if (error) throw error;
        return { session: data.session, user: data.user, success: true };
    } catch (error) {
        return { error: error.message, success: false };
    }
}
