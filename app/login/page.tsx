'use client';
import { useState } from 'react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);

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
                window.location.href = '/';
            } else {
                setAttempts(a => a + 1);
                setError(`Invalid credentials. ${4 - attempts} attempts remaining.`);
                setPassword('');
            }
        } catch {
            setError('Something went wrong. Try again.');
        }
        setLoading(false);
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
            <div style={{ width: 380, background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '36px 32px' }}>
                <div style={{ fontSize: 22, textAlign: 'center', marginBottom: 8 }}>🎓</div>
                <h1 style={{ color: '#e6edf3', textAlign: 'center', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Sharada ResultPro</h1>
                <p style={{ color: '#8b949e', textAlign: 'center', fontSize: 12, marginBottom: 28 }}>Admin Access · Sharada Classes, Dapoli</p>

                {error && (
                    <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#f87171', marginBottom: 14 }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Username</label>
                    <input
                        type="text" value={username} onChange={e => setUsername(e.target.value)}
                        autoComplete="off" placeholder="Enter username"
                        style={{ width: '100%', background: '#0d1117', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: '#e6edf3', outline: 'none' }}
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Password</label>
                    <input
                        type="password" value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Enter admin password"
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        style={{ width: '100%', background: '#0d1117', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: '#e6edf3', outline: 'none' }}
                    />
                </div>

                <button
                    onClick={handleLogin} disabled={loading || attempts >= 5}
                    style={{ width: '100%', background: attempts >= 5 ? '#444' : '#f0883e', color: 'white', border: 'none', borderRadius: 8, padding: 12, fontSize: 14, fontWeight: 700, cursor: attempts >= 5 ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? 'Verifying...' : 'Sign In'}
                </button>

                <p style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 16 }}>Developed by Saad Sahebwale</p>
            </div>
        </div>
    );
}