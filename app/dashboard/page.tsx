'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const ACTIONS = [
    { href: '/students', label: 'Students', sub: 'Manage enrolled', icon: '◉', color: '#3b82f6', glow: 'rgba(59,130,246,0.12)' },
    { href: '/results/generate', label: 'Generate', sub: 'New result card', icon: '◆', color: '#f97316', glow: 'rgba(249,115,22,0.12)' },
    { href: '/courses', label: 'Courses', sub: 'View subjects', icon: '◎', color: '#22c55e', glow: 'rgba(34,197,94,0.12)' },
    { href: '/bulk-import', label: 'Bulk Import', sub: 'Upload Excel', icon: '⊞', color: '#a855f7', glow: 'rgba(168,85,247,0.12)' },
];

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning, Sir';
    if (h < 17) return 'Good Afternoon, Sir';
    if (h < 21) return 'Good Evening, Sir';
    return 'Good Night, Sir';
}

export default function DashboardPage() {
    const [students, setStudents] = useState(0);
    const [results, setResults] = useState(0);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setVisible(true), 50);
        Promise.all([
            fetch('/api/students').then(r => r.json()),
            fetch('/api/results').then(r => r.json()),
        ]).then(([s, r]) => {
            setStudents(s.students?.length || 0);
            setResults(r.results?.length || 0);
            setLoading(false);
        });
    }, []);

    const stats = [
        { label: 'Total Students', value: students, icon: '◉', color: '#3b82f6', sub: 'Enrolled' },
        { label: 'Results', value: results, icon: '◈', color: '#f97316', sub: 'Generated' },
        { label: 'Courses', value: 5, icon: '◎', color: '#22c55e', sub: 'Active' },
        { label: 'Batch', value: '25-26', icon: '◆', color: '#a855f7', sub: 'Current' },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

                .db-root {
                    font-family: 'Inter', sans-serif;
                    color: #f1f5f9;
                    opacity: 0; transform: translateY(16px);
                    transition: opacity 0.6s ease, transform 0.6s ease;
                }
                .db-root.show { opacity: 1; transform: translateY(0); }

                .db-header { margin-bottom: 32px; }
                .db-greeting {
                    font-family: 'Syne', sans-serif;
                    font-size: 28px; font-weight: 800;
                    color: #f1f5f9; letter-spacing: -0.03em; line-height: 1.2;
                }
                .db-greeting span { color: #f97316; }
                .db-sub {
                    font-size: 13px; color: #334155;
                    margin-top: 5px; font-weight: 400;
                }

                /* Stats */
                .db-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 14px; margin-bottom: 28px;
                }
                @media (max-width: 900px) { .db-stats { grid-template-columns: repeat(2,1fr); } }

                .db-stat {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px; padding: 20px 18px;
                    position: relative; overflow: hidden;
                    transition: border-color 0.2s, transform 0.2s, background 0.2s;
                    cursor: default;
                }
                .db-stat:hover {
                    border-color: rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.03);
                    transform: translateY(-2px);
                }
                .db-stat-glow {
                    position: absolute; top: 0; right: 0;
                    width: 80px; height: 80px; border-radius: 50%;
                    filter: blur(30px); pointer-events: none;
                    transform: translate(20px,-20px);
                }
                .db-stat-icon {
                    font-size: 18px; margin-bottom: 12px;
                    display: block;
                }
                .db-stat-val {
                    font-family: 'Syne', sans-serif;
                    font-size: 32px; font-weight: 800;
                    line-height: 1; margin-bottom: 4px;
                }
                .db-stat-label {
                    font-size: 11px; color: #334155;
                    font-weight: 500; text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .db-stat-sub {
                    font-size: 10px; color: #1e293b;
                    margin-top: 2px;
                }

                /* Section title */
                .db-section {
                    font-size: 10px; font-weight: 700;
                    color: #1e293b; letter-spacing: 0.14em;
                    text-transform: uppercase; margin-bottom: 12px;
                    display: flex; align-items: center; gap: 8px;
                }
                .db-section::after {
                    content: ''; flex: 1; height: 1px;
                    background: rgba(255,255,255,0.04);
                }

                /* Action cards */
                .db-actions {
                    display: grid;
                    grid-template-columns: repeat(4,1fr);
                    gap: 12px;
                }
                @media (max-width: 900px) { .db-actions { grid-template-columns: repeat(2,1fr); } }

                .db-action {
                    display: flex; flex-direction: column;
                    padding: 20px 18px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    text-decoration: none;
                    transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
                    position: relative; overflow: hidden;
                    group: true;
                }
                .db-action:hover {
                    background: rgba(255,255,255,0.04);
                    transform: translateY(-3px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                }
                .db-action-glow {
                    position: absolute; inset: 0; opacity: 0;
                    transition: opacity 0.22s;
                    pointer-events: none; border-radius: 16px;
                }
                .db-action:hover .db-action-glow { opacity: 1; }

                .db-action-icon {
                    font-size: 22px; margin-bottom: 12px;
                    transition: transform 0.22s;
                }
                .db-action:hover .db-action-icon { transform: scale(1.1); }

                .db-action-label {
                    font-family: 'Syne', sans-serif;
                    font-size: 14px; font-weight: 700;
                    color: #f1f5f9; letter-spacing: -0.01em;
                    margin-bottom: 3px;
                }
                .db-action-sub {
                    font-size: 11px; color: #334155;
                    font-weight: 400;
                }
                .db-action-arrow {
                    position: absolute; bottom: 16px; right: 16px;
                    font-size: 16px; color: rgba(255,255,255,0.1);
                    transition: all 0.22s;
                }
                .db-action:hover .db-action-arrow {
                    color: rgba(255,255,255,0.4);
                    transform: translate(2px,-2px);
                }

                /* Loading shimmer */
                .shimmer {
                    background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
                    background-size: 200% 100%;
                    animation: shimmerAnim 1.5s infinite;
                    border-radius: 8px; height: 36px; width: 80px;
                }
                @keyframes shimmerAnim {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>

            <div className={`db-root ${visible ? 'show' : ''}`}>

                <div className="db-header">
                    <div className="db-greeting">
                        {getGreeting().split(',')[0]},<span> Sir</span>
                    </div>
                    <div className="db-sub">
                        Sharada Classes, Dapoli — Result Management System · Batch 2025-26
                    </div>
                </div>

                <div className="db-stats">
                    {stats.map((s, i) => (
                        <div key={i} className="db-stat">
                            <div className="db-stat-glow" style={{ background: s.color }} />
                            <span className="db-stat-icon" style={{ color: s.color }}>{s.icon}</span>
                            <div className="db-stat-val" style={{ color: s.color }}>
                                {loading && typeof s.value === 'number' ? <div className="shimmer" /> : s.value}
                            </div>
                            <div className="db-stat-label">{s.label}</div>
                            <div className="db-stat-sub">{s.sub}</div>
                        </div>
                    ))}
                </div>

                <div className="db-section">Quick Actions</div>

                <div className="db-actions">
                    {ACTIONS.map((a, i) => (
                        <Link key={i} href={a.href} className="db-action">
                            <div className="db-action-glow" style={{ background: `radial-gradient(circle at 30% 30%, ${a.glow}, transparent 70%)` }} />
                            <div className="db-action-icon" style={{ color: a.color }}>{a.icon}</div>
                            <div className="db-action-label">{a.label}</div>
                            <div className="db-action-sub">{a.sub}</div>
                            <div className="db-action-arrow">↗</div>
                        </Link>
                    ))}
                </div>

            </div>
        </>
    );
}