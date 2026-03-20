"use client";

import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';

export default function SignupPage() {
    const { signUp } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await signUp(email.trim(), password, fullName.trim());
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Signup failed. Try a different email.');
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
                        <h1>Create Account</h1>
                        <p>Join the GenStore community</p>
                    </div>

                    {error && <div className="auth-error">{error}</div>}
                    {success && (
                        <div className="auth-success">
                            Account created! Check your email to confirm, then <Link href="/login" className="auth-link">sign in</Link>.
                        </div>
                    )}

                    {!success && (
                        <form onSubmit={handleSignup} className="auth-form">
                            <div className="auth-field">
                                <label htmlFor="fullName">Full Name</label>
                                <div className="auth-input-wrap">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    <input
                                        id="fullName"
                                        type="text"
                                        placeholder="Yash Khanna"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

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
                                        placeholder="Min 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="auth-input-wrap">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-block auth-submit" disabled={loading}>
                                {loading ? (
                                    <span className="auth-spinner"></span>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>
                    )}

                    <div className="auth-footer">
                        <p>Already have an account? <Link href="/login" className="auth-link">Sign in</Link></p>
                    </div>
                </div>
            </div>
        </main>
    );
}
