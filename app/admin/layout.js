"use client";

import { useAuth } from '../components/AuthProvider';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
    const { user, isAdmin, loading } = useAuth();

    useEffect(() => {
        // Double check email for extra security
        const isAuthorizedEmail = user?.email === 'khannayash394@gmail.com';
        
        if (!loading && (!user || !isAdmin || !isAuthorizedEmail)) {
            window.location.href = '/'; // Go to homepage, don't even log in
        }
    }, [user, isAdmin, loading]);

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner"></div>
                <p>Verifying admin access...</p>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return (
            <div className="admin-loading">
                <p>Access denied. Redirecting...</p>
            </div>
        );
    }

    return <>{children}</>;
}
