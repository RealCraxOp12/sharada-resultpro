'use client';
import { useState, useEffect } from 'react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setMounted(true);
        setTimeout(() => setShowForm(true), 800);
    }, []);

    async function handleLogin() {
        if (attempts >= 5) {
            setError('Too many attempts. Wait 15 minutes.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
            } else {
                setAttempts(a => a + 1);
                setError(`Invalid credentials. ${4 - attempts} attempt${4 - attempts === 1 ? '' : 's'} remaining.`);
                setPassword('');
            }
        } catch {
            setError('Something went wrong. Try again.');
        }
        setLoading(false);
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                .login-root {
                    min-height: 100vh;
                    background: #040810;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Outfit', sans-serif;
                    position: relative;
                    overflow: hidden;
                }

                /* Animated background orbs */
                .orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    animation: orbFloat 8s ease-in-out infinite;
                    pointer-events: none;
                }
                .orb-1 {
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%);
                    top: -150px; left: -150px;
                    animation-delay: 0s;
                }
                .orb-2 {
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
                    bottom: -100px; right: -100px;
                    animation-delay: -3s;
                }
                .orb-3 {
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%);
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    animation-delay: -6s;
                }

                @keyframes orbFloat {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    33%       { transform: translateY(-30px) scale(1.05); }
                    66%       { transform: translateY(20px) scale(0.95); }
                }

                /* Grid pattern */
                .grid-bg {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
                    background-size: 50px 50px;
                    pointer-events: none;
                }

                /* Floating particles */
                .particle {
                    position: absolute;
                    width: 3px; height: 3px;
                    background: rgba(249,115,22,0.6);
                    border-radius: 50%;
                    animation: particleFloat linear infinite;
                    pointer-events: none;
                }
                @keyframes particleFloat {
                    0%   { transform: translateY(100vh) translateX(0); opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 1; }
                    100% { transform: translateY(-100px) translateX(50px); opacity: 0; }
                }

                /* Card */
                .card {
                    position: relative;
                    z-index: 10;
                    width: 420px;
                    max-width: calc(100vw - 32px);
                    opacity: 0;
                    transform: translateY(40px);
                    transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
                }
                .card.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                .card.success-state {
                    transform: scale(1.02);
                    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
                }

                .card-inner {
                    background: rgba(15,23,42,0.8);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 24px;
                    padding: 40px 36px;
                    position: relative;
                    overflow: hidden;
                }

                /* Top glow line */
                .card-inner::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 20%; right: 20%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent);
                }

                /* Logo area */
                .logo-wrap {
                    text-align: center;
                    margin-bottom: 28px;
                }
                .logo-circle {
                    width: 72px; height: 72px;
                    background: linear-gradient(135deg, #f97316, #fbbf24);
                    border-radius: 20px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    margin-bottom: 16px;
                    box-shadow: 0 0 40px rgba(249,115,22,0.3);
                    animation: logoPulse 3s ease-in-out infinite;
                }
                @keyframes logoPulse {
                    0%, 100% { box-shadow: 0 0 40px rgba(249,115,22,0.3); }
                    50%       { box-shadow: 0 0 60px rgba(249,115,22,0.5); }
                }

                .inst-name {
                    font-size: 22px;
                    font-weight: 800;
                    color: #f1f5f9;
                    letter-spacing: -0.02em;
                    line-height: 1.2;
                }
                .inst-sub {
                    font-size: 12px;
                    color: #64748b;
                    margin-top: 4px;
                    letter-spacing: 0.05em;
                }
                .inst-badge {
                    display: inline-block;
                    margin-top: 10px;
                    background: rgba(249,115,22,0.12);
                    border: 1px solid rgba(249,115,22,0.25);
                    color: #fb923c;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 20px;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                /* Divider */
                .divider {
                    height: 1px;
                    background: rgba(255,255,255,0.06);
                    margin: 0 0 24px;
                }

                /* Form fields */
                .field { margin-bottom: 16px; }
                .field-label {
                    display: block;
                    font-size: 11px;
                    font-weight: 700;
                    color: #475569;
                    margin-bottom: 7px;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .field-input {
                    width: 100%;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 13px 16px;
                    font-size: 14px;
                    color: #f1f5f9;
                    font-family: 'Outfit', sans-serif;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                }
                .field-input:focus {
                    border-color: rgba(249,115,22,0.5);
                    background: rgba(249,115,22,0.04);
                    box-shadow: 0 0 0 3px rgba(249,115,22,0.08);
                }
                .field-input::placeholder { color: #374151; }

                /* Error */
                .error-box {
                    background: rgba(239,68,68,0.08);
                    border: 1px solid rgba(239,68,68,0.2);
                    border-radius: 10px;
                    padding: 11px 14px;
                    font-size: 12.5px;
                    color: #f87171;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    animation: shake 0.4s ease;
                }
                @keyframes shake {
                    0%,100% { transform: translateX(0); }
                    25%      { transform: translateX(-6px); }
                    75%      { transform: translateX(6px); }
                }

                /* Button */
                .login-btn {
                    width: 100%;
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 14px;
                    font-size: 15px;
                    font-weight: 700;
                    font-family: 'Outfit', sans-serif;
                    cursor: pointer;
                    margin-top: 8px;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
                    box-shadow: 0 4px 24px rgba(249,115,22,0.3);
                }
                .login-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 32px rgba(249,115,22,0.4);
                }
                .login-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
                .login-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .login-btn.success-btn {
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    box-shadow: 0 4px 24px rgba(34,197,94,0.3);
                }

                /* Shimmer on button */
                .login-btn::after {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
                    animation: shimmer 2.5s infinite;
                }
                @keyframes shimmer {
                    0%   { left: -100%; }
                    100% { left: 200%; }
                }

                /* Footer */
                .footer-text {
                    text-align: center;
                    font-size: 11px;
                    color: #1e293b;
                    margin-top: 20px;
                    letter-spacing: 0.03em;
                }
                .footer-text span {
                    color: #f97316;
                    font-weight: 600;
                }

                /* Security badge */
                .security-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    margin-top: 16px;
                }
                .sec-badge {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 10px;
                    color: #334155;
                    font-weight: 500;
                }
                .sec-dot {
                    width: 5px; height: 5px;
                    background: #1e293b;
                    border-radius: 50%;
                }
            `}</style>

            <div className="login-root">
                {/* Background */}
                <div className="grid-bg" />
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />

                {/* Particles */}
                {mounted && [
                    { left: '10%', delay: '0s', duration: '12s' },
                    { left: '25%', delay: '2s', duration: '15s' },
                    { left: '40%', delay: '4s', duration: '10s' },
                    { left: '60%', delay: '1s', duration: '13s' },
                    { left: '75%', delay: '3s', duration: '11s' },
                    { left: '88%', delay: '5s', duration: '14s' },
                ].map((p, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
                    />
                ))}

                {/* Card */}
                <div className={`card ${showForm ? 'visible' : ''} ${success ? 'success-state' : ''}`}>
                    <div className="card-inner">

                        {/* Logo */}
                        <div className="logo-wrap">
                            <div className="logo-circle">🎓</div>
                            <div className="inst-name">Sharada Classes</div>
                            <div className="inst-sub">Dapoli, Ratnagiri · Maharashtra</div>
                            <div className="inst-badge">ResultPro · Admin Portal</div>
                        </div>

                        <div className="divider" />

                        {/* Error */}
                        {error && (
                            <div className="error-box">
                                <span style={{ fontSize: 16 }}>⚠</span>
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <div className="field">
                            <label className="field-label">Username</label>
                            <input
                                className="field-input"
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                autoComplete="off"
                                placeholder="Enter your username"
                                disabled={loading || success}
                            />
                        </div>

                        <div className="field">
                            <label className="field-label">Password</label>
                            <input
                                className="field-input"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                disabled={loading || success}
                            />
                        </div>

                        <button
                            className={`login-btn ${success ? 'success-btn' : ''}`}
                            onClick={handleLogin}
                            disabled={loading || attempts >= 5 || success}
                        >
                            {success
                                ? '✓ Access Granted — Redirecting...'
                                : loading
                                    ? 'Verifying...'
                                    : attempts >= 5
                                        ? 'Account Locked'
                                        : 'Sign In →'
                            }
                        </button>

                        {/* Security row */}
                        <div className="security-row">
                            <div className="sec-badge">🔒 Encrypted</div>
                            <div className="sec-dot" />
                            <div className="sec-badge">🛡 Secure Login</div>
                            <div className="sec-dot" />
                            <div className="sec-badge">⏱ Session Timeout</div>
                        </div>

                    </div>

                    <div className="footer-text">
                        Developed by <span>Saad Sahebwale</span>
                    </div>
                </div>
            </div>
        </>
    );
}