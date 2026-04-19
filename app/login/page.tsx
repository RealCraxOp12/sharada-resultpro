'use client';
import { useState, useEffect, useRef } from 'react';

const GREETINGS = [
    { hi: 'Pranam, Guruji! 🙏', sub: 'Aapke haath mein hai bacchon ka bhavishya.' },
    { hi: 'Welcome back, Sir! ✨', sub: 'Sharada Classes needs you today.' },
    { hi: 'Subah ki shuruat aapke saath ☀️', sub: 'Chai pi li? Chalo kaam shuru karte hain!' },
    { hi: 'Ek mahaan shikshak ka swagat! 🏆', sub: 'Dapoli ko aap par garv hai, Sir.' },
    { hi: 'Gyaan ka diya jalate rahiye 📚', sub: 'Aapke bina Sharada adhoora hai.' },
    { hi: 'Aaj phir ek naya sawera 🌺', sub: 'Ye system aapka intezaar kar raha tha!' },
    { hi: 'Focus mode: ON, Sir! 🎯', sub: 'Aaj ke results ready karte hain?' },
    { hi: 'Every student you teach 💫', sub: 'carries a piece of your greatness.' },
    { hi: 'Mehnat ka fal meetha hota hai 💪', sub: 'Aaj bhi kuch naya karenge, Sir!' },
    { hi: 'The best teacher in Dapoli 🎓', sub: 'has arrived. Let\'s make today count!' },
    { hi: 'Aapka pyaar hai taakat ❤️', sub: 'Bacchon ke results ka intezaar hai, Sir!' },
    { hi: 'Good to see you, Sir! 🌟', sub: 'ResultPro is ready and waiting.' },
    { hi: 'Thaka mat karo, Guruji 🌙', sub: 'Aapki mehnat rang laayegi zaroor.' },
    { hi: 'Ready for takeoff, Sir? 🚀', sub: 'Aaj bhi results generate karte hain!' },
    { hi: 'Sir, aap nahi toh kya hota? 👨‍🏫', sub: 'Sharada Classes ki jaan hain aap!' },
];

function getTimeLabel() {
    const h = new Date().getHours();
    if (h < 5) return { label: 'Good Night', color: '#818cf8' };
    if (h < 12) return { label: 'Good Morning', color: '#fbbf24' };
    if (h < 17) return { label: 'Good Afternoon', color: '#f97316' };
    if (h < 21) return { label: 'Good Evening', color: '#a78bfa' };
    return { label: 'Good Night', color: '#818cf8' };
}

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [visible, setVisible] = useState(false);
    const [success, setSuccess] = useState(false);
    const [greeting] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    const [typed, setTyped] = useState('');
    const [showPass, setShowPass] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const time = getTimeLabel();

    useEffect(() => {
        setTimeout(() => setVisible(true), 100);
        // Typewriter
        let i = 0;
        const t = setInterval(() => {
            i++;
            setTyped(greeting.sub.slice(0, i));
            if (i >= greeting.sub.length) clearInterval(t);
        }, 30);
        return () => clearInterval(t);
    }, [greeting.sub]);

    // Animated mesh canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener('resize', resize);

        const pts = Array.from({ length: 60 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.5 + 0.5,
        }));

        let raf: number;
        function draw() {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pts.forEach(p => {
                p.x = (p.x + p.vx + canvas.width) % canvas.width;
                p.y = (p.y + p.vy + canvas.height) % canvas.height;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(249,115,22,0.35)';
                ctx.fill();
            });
            // Connect nearby points
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].x - pts[j].x;
                    const dy = pts[i].y - pts[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(pts[i].x, pts[i].y);
                        ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.strokeStyle = `rgba(249,115,22,${0.06 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            raf = requestAnimationFrame(draw);
        }
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, []);

    async function handleLogin() {
        if (attempts >= 5) { setError('Account locked. Try again in 15 minutes.'); return; }
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => { window.location.href = '/dashboard'; }, 1200);
            } else {
                setAttempts(a => a + 1);
                const left = 4 - attempts;
                setError(`Wrong credentials — ${left} attempt${left === 1 ? '' : 's'} left`);
                setPassword('');
            }
        } catch { setError('Network error. Check connection.'); }
        setLoading(false);
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html, body { height: 100%; }

                .lp {
                    min-height: 100vh;
                    background: #05080f;
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Inter', sans-serif;
                    position: relative; overflow: hidden;
                    padding: 20px;
                }

                .lp canvas {
                    position: absolute; inset: 0;
                    pointer-events: none; z-index: 0;
                }

                /* Radial vignette */
                .lp-vignette {
                    position: absolute; inset: 0; z-index: 1;
                    background: radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(5,8,15,0.95) 100%);
                    pointer-events: none;
                }

                /* Glow blob */
                .lp-blob {
                    position: absolute; z-index: 1; border-radius: 50%;
                    filter: blur(120px); pointer-events: none;
                    animation: blobDrift 12s ease-in-out infinite;
                }
                .lp-blob-1 {
                    width: 400px; height: 300px;
                    background: rgba(249,115,22,0.12);
                    top: 10%; left: 5%;
                }
                .lp-blob-2 {
                    width: 350px; height: 280px;
                    background: rgba(99,102,241,0.08);
                    bottom: 10%; right: 5%;
                    animation-delay: -6s;
                }
                @keyframes blobDrift {
                    0%,100% { transform: translate(0,0); }
                    50%      { transform: translate(40px,-30px); }
                }

                /* Layout: split */
                .lp-layout {
                    position: relative; z-index: 10;
                    display: grid;
                    grid-template-columns: 1fr 420px;
                    gap: 80px;
                    max-width: 960px; width: 100%;
                    align-items: center;
                    opacity: 0; transform: translateY(30px);
                    transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
                }
                .lp-layout.show { opacity: 1; transform: translateY(0); }

                @media (max-width: 768px) {
                    .lp-layout { grid-template-columns: 1fr; gap: 32px; }
                    .lp-left { display: none; }
                }

                /* Left side — branding */
                .lp-left { padding: 20px 0; }

                .lp-time-chip {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 5px 12px; border-radius: 20px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    font-size: 11px; font-weight: 600;
                    letter-spacing: 0.06em; text-transform: uppercase;
                    margin-bottom: 24px;
                }
                .lp-time-dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    animation: timePulse 2s ease-in-out infinite;
                }
                @keyframes timePulse {
                    0%,100% { opacity: 1; transform: scale(1); }
                    50%      { opacity: 0.6; transform: scale(0.8); }
                }

                .lp-greeting-main {
                    font-family: 'Syne', sans-serif;
                    font-size: 36px; font-weight: 800;
                    color: #f1f5f9; line-height: 1.15;
                    letter-spacing: -0.03em;
                    margin-bottom: 12px;
                }
                .lp-greeting-main span { color: #f97316; }

                .lp-greeting-sub {
                    font-size: 15px; color: #475569;
                    line-height: 1.7; min-height: 26px;
                    font-style: italic;
                }
                .lp-cursor {
                    display: inline-block; width: 2px; height: 15px;
                    background: #f97316; margin-left: 2px;
                    vertical-align: middle;
                    animation: cur 1s step-end infinite;
                }
                @keyframes cur { 0%,100%{opacity:1} 50%{opacity:0} }

                .lp-divider {
                    width: 48px; height: 2px;
                    background: linear-gradient(90deg, #f97316, transparent);
                    margin: 24px 0;
                    border-radius: 2px;
                }

                .lp-school {
                    font-family: 'Syne', sans-serif;
                    font-size: 18px; font-weight: 700;
                    color: #1e293b; letter-spacing: -0.01em;
                }
                .lp-school-sub {
                    font-size: 12px; color: #1e293b;
                    margin-top: 3px; letter-spacing: 0.04em;
                }

                /* Stats row */
                .lp-stats {
                    display: flex; gap: 24px; margin-top: 32px;
                }
                .lp-stat {
                    display: flex; flex-direction: column; gap: 2px;
                }
                .lp-stat-num {
                    font-family: 'Syne', sans-serif;
                    font-size: 22px; font-weight: 800; color: #f97316;
                }
                .lp-stat-label {
                    font-size: 10px; color: #1e293b;
                    font-weight: 600; letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                /* Right — card */
                .lp-card {
                    background: rgba(10,14,24,0.9);
                    backdrop-filter: blur(40px) saturate(200%);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 24px;
                    padding: 36px 32px;
                    position: relative; overflow: hidden;
                    box-shadow:
                        0 0 0 1px rgba(255,255,255,0.02),
                        0 24px 64px rgba(0,0,0,0.6),
                        0 0 80px rgba(249,115,22,0.04);
                }
                .lp-card::before {
                    content: '';
                    position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(249,115,22,0.5), rgba(251,191,36,0.3), rgba(249,115,22,0.5), transparent);
                }

                .lp-card-header { margin-bottom: 28px; }
                .lp-card-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 20px; font-weight: 800;
                    color: #f1f5f9; letter-spacing: -0.02em;
                }
                .lp-card-sub {
                    font-size: 12px; color: #334155;
                    margin-top: 4px; font-weight: 500;
                }

                /* Input groups */
                .inp-group { margin-bottom: 14px; }
                .inp-label {
                    display: block; font-size: 10px; font-weight: 700;
                    color: #1e293b; margin-bottom: 6px;
                    text-transform: uppercase; letter-spacing: 0.1em;
                }
                .inp-wrap { position: relative; }
                .inp-field {
                    width: 100%;
                    background: rgba(255,255,255,0.025);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                    padding: 12px 40px 12px 14px;
                    font-size: 14px; color: #e2e8f0;
                    font-family: 'Inter', sans-serif;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                    -webkit-appearance: none;
                }
                .inp-field:focus {
                    border-color: rgba(249,115,22,0.4);
                    background: rgba(249,115,22,0.025);
                    box-shadow: 0 0 0 3px rgba(249,115,22,0.06);
                }
                .inp-field::placeholder { color: #1e293b; font-size: 13px; }
                .inp-suffix {
                    position: absolute; right: 12px; top: 50%;
                    transform: translateY(-50%);
                    font-size: 13px; color: #1e293b; cursor: pointer;
                    user-select: none; transition: color 0.15s;
                }
                .inp-suffix:hover { color: #475569; }

                /* Error */
                .lp-err {
                    background: rgba(239,68,68,0.05);
                    border: 1px solid rgba(239,68,68,0.12);
                    border-left: 2px solid rgba(239,68,68,0.5);
                    border-radius: 10px;
                    padding: 10px 12px;
                    font-size: 12px; color: #fca5a5;
                    margin-bottom: 14px;
                    display: flex; align-items: center; gap: 8px;
                    animation: errIn 0.3s ease;
                }
                @keyframes errIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* Button */
                .lp-btn {
                    width: 100%; border: none; border-radius: 12px;
                    padding: 14px 20px; margin-top: 8px;
                    font-size: 14px; font-weight: 700;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer; position: relative; overflow: hidden;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
                    letter-spacing: 0.02em;
                }
                .lp-btn-default {
                    background: #f97316;
                    color: white;
                    box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 16px rgba(249,115,22,0.25);
                }
                .lp-btn-default:hover:not(:disabled) {
                    background: #ea580c;
                    transform: translateY(-2px);
                    box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset, 0 8px 32px rgba(249,115,22,0.35);
                }
                .lp-btn-default:active:not(:disabled) { transform: translateY(0); }
                .lp-btn-default::after {
                    content: '';
                    position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
                    animation: btnSweep 2.5s ease-in-out infinite;
                    transform: skewX(-20deg);
                }
                @keyframes btnSweep { 0%{left:-100%} 100%{left:200%} }

                .lp-btn-success {
                    background: #16a34a; color: white;
                    box-shadow: 0 4px 16px rgba(34,197,94,0.3);
                    transform: scale(1.01);
                }
                .lp-btn-locked {
                    background: rgba(255,255,255,0.04);
                    color: #374151; cursor: not-allowed;
                    border: 1px solid rgba(255,255,255,0.06);
                }
                .lp-btn:disabled { cursor: not-allowed; }

                .spinner {
                    width: 14px; height: 14px; border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.2);
                    border-top-color: white;
                    animation: spin 0.7s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* Divider */
                .card-div {
                    height: 1px; margin: 20px 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
                }

                /* Footer chips */
                .lp-chips {
                    display: flex; gap: 6px; flex-wrap: wrap;
                    justify-content: center; margin-top: 16px;
                }
                .lp-chip {
                    font-size: 9.5px; font-weight: 600; color: #1e293b;
                    padding: 3px 9px; border-radius: 20px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.04);
                    letter-spacing: 0.04em;
                }

                .lp-footer-dev {
                    text-align: center; margin-top: 16px;
                    font-size: 10.5px; color: #0f172a;
                }
                .lp-footer-dev b { color: #374151; }
            `}</style>

            <div className="lp">
                <canvas ref={canvasRef} />
                <div className="lp-vignette" />
                <div className="lp-blob lp-blob-1" />
                <div className="lp-blob lp-blob-2" />

                <div className={`lp-layout ${visible ? 'show' : ''}`}>

                    {/* Left — Branding */}
                    <div className="lp-left">
                        <div className="lp-time-chip" style={{ color: time.color }}>
                            <span className="lp-time-dot" style={{ background: time.color }} />
                            {time.label}
                        </div>

                        <div className="lp-greeting-main">
                            {greeting.hi.split('!')[0]}
                            <span>!</span>
                        </div>
                        <div className="lp-greeting-sub">
                            {typed}<span className="lp-cursor" />
                        </div>

                        <div className="lp-divider" />

                        <div className="lp-school">Sharada Classes</div>
                        <div className="lp-school-sub">Dapoli · Ratnagiri · Maharashtra</div>

                        <div className="lp-stats">
                            <div className="lp-stat">
                                <div className="lp-stat-num">5</div>
                                <div className="lp-stat-label">Courses</div>
                            </div>
                            <div className="lp-stat">
                                <div className="lp-stat-num">∞</div>
                                <div className="lp-stat-label">Students</div>
                            </div>
                            <div className="lp-stat">
                                <div className="lp-stat-num">1</div>
                                <div className="lp-stat-label">System</div>
                            </div>
                        </div>
                    </div>

                    {/* Right — Card */}
                    <div className="lp-card">
                        <div className="lp-card-header">
                            <div className="lp-card-title">Admin Sign In</div>
                            <div className="lp-card-sub">ResultPro · Secure Access Portal</div>
                        </div>

                        {error && (
                            <div className="lp-err">
                                <span>⚠</span> {error}
                            </div>
                        )}

                        <div className="inp-group">
                            <label className="inp-label">Username</label>
                            <div className="inp-wrap">
                                <input
                                    className="inp-field"
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    autoComplete="off"
                                    placeholder="Your username"
                                    disabled={loading || success}
                                />
                                <span className="inp-suffix">◉</span>
                            </div>
                        </div>

                        <div className="inp-group">
                            <label className="inp-label">Password</label>
                            <div className="inp-wrap">
                                <input
                                    className="inp-field"
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Your password"
                                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                    disabled={loading || success}
                                />
                                <span className="inp-suffix" onClick={() => setShowPass(s => !s)}>
                                    {showPass ? '◎' : '●'}
                                </span>
                            </div>
                        </div>

                        <button
                            className={`lp-btn ${success ? 'lp-btn-success' : attempts >= 5 ? 'lp-btn-locked' : 'lp-btn-default'}`}
                            onClick={handleLogin}
                            disabled={loading || attempts >= 5 || success}
                        >
                            {success ? '✓ Welcome Sir — Entering Dashboard' :
                                loading ? <><div className="spinner" /> Verifying</> :
                                    attempts >= 5 ? '⊘ Account Locked' :
                                        'Enter Dashboard →'}
                        </button>

                        <div className="card-div" />

                        <div className="lp-chips">
                            <span className="lp-chip">⊕ JWT Secured</span>
                            <span className="lp-chip">⊘ 5 Attempt Limit</span>
                            <span className="lp-chip">⊛ Auto Logout</span>
                            <span className="lp-chip">⊞ Encrypted</span>
                        </div>
                    </div>
                </div>

                <div className="lp-footer-dev" style={{ position: 'absolute', bottom: 16, left: 0, right: 0 }}>
                    Crafted by <b>Saad Sahebwale</b>
                </div>
            </div>
        </>
    );
}