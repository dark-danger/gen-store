"use client";

import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';

export default function LoginPage() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signIn(email, password);
            setSuccess(true);
            // Redirect after successful login
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } catch (err) {
            setError(err.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-bg">
                <div className="auth-glow glow-1"></div>
                <div className="auth-glow glow-2"></div>
            </div>
            <div className="auth-container">
                <Link href="/" className="auth-back-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
                    Back to Store
                </Link>
                <div className="auth-card glass-panel">
                    <div className="auth-header">
                        <div className="auth-logo">Gen<span>Store</span></div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to your account</p>
                    </div>

                    {error && <div className="auth-error">{error}</div>}
                    {success && <div className="auth-success">Login successful! Redirecting...</div>}

                    <form onSubmit={handleLogin} className="auth-form">
                        <div className="auth-field">
                            <label htmlFor="email">Email Address</label>
                            <div className="auth-input-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password">Password</label>
                            <div className="auth-input-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block auth-submit" disabled={loading}>
                            {loading ? (
                                <span className="auth-spinner"></span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Don&apos;t have an account? <Link href="/signup" className="auth-link">Create one</Link></p>
                    </div>

                    <div className="auth-divider">
                        <span>Admin?</span>
                    </div>
                    <p className="auth-admin-hint">Admin users login with the same form. Your role is auto-detected.</p>
                </div>
            </div>
        </main>
    );
}
