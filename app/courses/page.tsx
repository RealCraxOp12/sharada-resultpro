'use client';
import { useEffect, useState } from 'react';

const COURSES: Record<string, { subjects: string[]; desc: string; color: string; accent: string }> = {
    PCM: { subjects: ['Physics', 'Chemistry', 'Mathematics'], desc: 'Standard science stream — engineering aspirants', color: '#3b82f6', accent: 'rgba(59,130,246,.08)' },
    PCMB: { subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'], desc: 'Combined stream — medical & engineering', color: '#a855f7', accent: 'rgba(168,85,247,.08)' },
    JEE: { subjects: ['Physics', 'Chemistry', 'Mathematics'], desc: 'IIT-JEE focused preparation', color: '#f97316', accent: 'rgba(249,115,22,.08)' },
    NEET: { subjects: ['Physics', 'Chemistry', 'Biology'], desc: 'Medical entrance (NEET-UG) preparation', color: '#22c55e', accent: 'rgba(34,197,94,.08)' },
    CET: { subjects: ['Physics', 'Chemistry', 'Mathematics'], desc: 'Maharashtra CET state entrance prep', color: '#eab308', accent: 'rgba(234,179,8,.08)' },
};
const SUBJECT_ICONS: Record<string, string> = { Physics: '⚛', Chemistry: '⚗', Mathematics: '∑', Biology: '◉' };

export default function CoursesPage() {
    const [visible, setVisible] = useState(false);
    useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

    return (
        <>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
            .cp-root { font-family:'Inter',sans-serif; color:#f1f5f9; opacity:0; transform:translateY(16px); transition:opacity .5s ease,transform .5s ease; }
            .cp-root.show { opacity:1; transform:translateY(0); }
            .cp-title { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; letter-spacing:-.03em; }
            .cp-sub { font-size:12px; color:#334155; margin-top:3px; }
            .cp-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
            @media(max-width:900px){ .cp-grid { grid-template-columns:repeat(2,1fr); } }
            @media(max-width:600px){ .cp-grid { grid-template-columns:1fr; } }
            .cp-card {
                background:rgba(255,255,255,.02);
                border:1px solid rgba(255,255,255,.05);
                border-radius:16px; padding:22px 20px;
                position:relative; overflow:hidden;
                transition:border-color .2s,transform .2s,background .2s;
                cursor:default;
            }
            .cp-card:hover { border-color:rgba(255,255,255,.09); background:rgba(255,255,255,.03); transform:translateY(-2px); }
            .cp-card-glow { position:absolute; top:0; right:0; width:100px; height:100px; border-radius:50%; filter:blur(40px); pointer-events:none; transform:translate(30px,-30px); opacity:.5; }
            .cp-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:6px; }
            .cp-course-name { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; letter-spacing:-.02em; }
            .cp-count { font-size:10px; font-weight:700; color:#1e293b; padding:3px 9px; border-radius:20px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06); letter-spacing:.06em; }
            .cp-desc { font-size:11.5px; color:#334155; margin-bottom:16px; line-height:1.5; }
            .cp-divider { height:1px; background:rgba(255,255,255,.04); margin-bottom:14px; }
            .cp-subjects { display:flex; flex-direction:column; gap:6px; }
            .cp-subject { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:10px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.04); transition:background .15s; }
            .cp-subject:hover { background:rgba(255,255,255,.04); }
            .cp-subject-icon { width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:12px; flex-shrink:0; }
            .cp-subject-name { font-size:12.5px; font-weight:500; color:#cbd5e1; }
            .cp-active-dot { width:5px; height:5px; border-radius:50%; background:#22c55e; box-shadow:0 0 6px rgba(34,197,94,.5); flex-shrink:0; }
            .cp-active-label { font-size:9px; font-weight:700; color:#22c55e; letter-spacing:.08em; text-transform:uppercase; margin-top:14px; display:flex; align-items:center; gap:5px; }
        `}</style>
            <div className={`cp-root ${visible ? 'show' : ''}`}>
                <div style={{ marginBottom: 28 }}>
                    <div className="cp-title">Courses</div>
                    <div className="cp-sub">5 active courses · Subject configuration</div>
                </div>
                <div className="cp-grid">
                    {Object.entries(COURSES).map(([name, info]) => (
                        <div key={name} className="cp-card">
                            <div className="cp-card-glow" style={{ background: info.color }} />
                            <div className="cp-card-top">
                                <div className="cp-course-name" style={{ color: info.color }}>{name}</div>
                                <span className="cp-count">{info.subjects.length} subjects</span>
                            </div>
                            <div className="cp-desc">{info.desc}</div>
                            <div className="cp-divider" />
                            <div className="cp-subjects">
                                {info.subjects.map(s => (
                                    <div key={s} className="cp-subject">
                                        <div className="cp-subject-icon" style={{ background: `${info.color}14`, color: info.color }}>
                                            {SUBJECT_ICONS[s] || '◎'}
                                        </div>
                                        <div className="cp-subject-name">{s}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="cp-active-label">
                                <div className="cp-active-dot" />
                                Active Course
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}