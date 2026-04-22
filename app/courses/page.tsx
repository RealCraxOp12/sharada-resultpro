'use client';
import { useEffect, useState } from 'react';

const COACHING_COURSES: Record<string, { subjects: string[]; desc: string; color: string }> = {
    PCM: { subjects: ['Physics', 'Chemistry', 'Mathematics'], desc: 'Standard science stream — engineering aspirants', color: '#3b82f6' },
    PCMB: { subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'], desc: 'Combined stream — medical & engineering', color: '#a855f7' },
    JEE: { subjects: ['Physics', 'Chemistry', 'Mathematics'], desc: 'IIT-JEE focused preparation', color: '#f97316' },
    NEET: { subjects: ['Physics', 'Chemistry', 'Biology'], desc: 'Medical entrance (NEET-UG) preparation', color: '#22c55e' },
    CET: { subjects: ['Physics', 'Chemistry', 'Mathematics'], desc: 'Maharashtra CET state entrance prep', color: '#eab308' },
};

const SCHOOL_CLASSES: Record<string, { compulsory: string[]; optional: string[]; color: string }> = {
    'Class 5': { compulsory: ['Maths', 'Science', 'English'], optional: ['Sanskrit'], color: '#06b6d4' },
    'Class 6': { compulsory: ['Maths', 'Science', 'English'], optional: ['Sanskrit'], color: '#06b6d4' },
    'Class 7': { compulsory: ['Maths', 'Science', 'English'], optional: ['Sanskrit'], color: '#06b6d4' },
    'Class 8': { compulsory: ['Maths', 'Science', 'English'], optional: ['Sanskrit', 'IT', 'Marathi Grammar', 'Hindi Grammar'], color: '#8b5cf6' },
    'Class 9': { compulsory: ['Maths 1', 'Maths 2', 'Science 1', 'Science 2', 'English'], optional: ['Sanskrit', 'IT', 'Marathi Grammar', 'Hindi Grammar'], color: '#ec4899' },
    'Class 10': { compulsory: ['Maths 1', 'Maths 2', 'Science 1', 'Science 2', 'English'], optional: ['Sanskrit', 'IT', 'Marathi Grammar', 'Hindi Grammar'], color: '#ec4899' },
};

const SUBJECT_ICONS: Record<string, string> = {
    Physics: '⚛', Chemistry: '⚗', Mathematics: '∑', Biology: '◉',
    Maths: '∑', Science: '⚗', English: '◈', Sanskrit: 'ॐ',
    'Maths 1': '∑', 'Maths 2': '∑', 'Science 1': '⚗', 'Science 2': '⚗',
    IT: '⊞', 'Marathi Grammar': '◆', 'Hindi Grammar': '◆',
};

export default function CoursesPage() {
    const [visible, setVisible] = useState(false);
    const [tab, setTab] = useState<'coaching' | 'school'>('coaching');
    useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

    return (
        <>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
            .cp-root { font-family:'Inter',sans-serif; color:#f1f5f9; opacity:0; transform:translateY(16px); transition:opacity .5s ease,transform .5s ease; }
            .cp-root.show { opacity:1; transform:translateY(0); }
            .cp-title { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; letter-spacing:-.03em; }
            .cp-sub { font-size:12px; color:#334155; margin-top:3px; }
            .cp-tabs { display:flex; gap:4px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); border-radius:12px; padding:4px; margin-bottom:24px; width:fit-content; }
            .cp-tab { padding:8px 20px; border-radius:9px; font-size:12.5px; font-weight:600; cursor:pointer; border:none; font-family:'Inter',sans-serif; transition:all .18s; background:transparent; color:#475569; }
            .cp-tab.active { background:rgba(255,255,255,.06); color:#f1f5f9; }
            .cp-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
            @media(max-width:900px){ .cp-grid { grid-template-columns:repeat(2,1fr); } }
            .cp-card { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); border-radius:16px; padding:20px; position:relative; overflow:hidden; transition:border-color .2s,transform .2s,background .2s; }
            .cp-card:hover { border-color:rgba(255,255,255,.09); background:rgba(255,255,255,.03); transform:translateY(-2px); }
            .cp-glow { position:absolute; top:0; right:0; width:80px; height:80px; border-radius:50%; filter:blur(30px); pointer-events:none; transform:translate(20px,-20px); opacity:.4; }
            .cp-name { font-family:'Syne',sans-serif; font-size:18px; font-weight:800; letter-spacing:-.02em; margin-bottom:4px; }
            .cp-desc { font-size:11px; color:#334155; margin-bottom:14px; line-height:1.5; }
            .cp-divider { height:1px; background:rgba(255,255,255,.04); margin-bottom:12px; }
            .cp-subjects { display:flex; flex-direction:column; gap:5px; }
            .cp-subject { display:flex; align-items:center; gap:8px; padding:7px 10px; border-radius:8px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.03); transition:background .15s; }
            .cp-subject:hover { background:rgba(255,255,255,.04); }
            .cp-subject-icon { width:22px; height:22px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; }
            .cp-subject-name { font-size:12px; font-weight:500; color:#cbd5e1; }
            .cp-opt-label { font-size:9px; font-weight:700; color:#1e293b; text-transform:uppercase; letter-spacing:.08em; margin:10px 0 6px; }
            .cp-opt-subject { display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:8px; background:rgba(255,255,255,.01); border:1px dashed rgba(255,255,255,.05); }
            .cp-opt-tag { font-size:8px; font-weight:700; color:#1e293b; background:rgba(255,255,255,.04); padding:1px 6px; border-radius:6px; margin-left:auto; }
            .cp-active { font-size:9px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; margin-top:12px; display:flex; align-items:center; gap:5px; }
            .cp-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
        `}</style>

            <div className={`cp-root ${visible ? 'show' : ''}`}>
                <div style={{ marginBottom: 20 }}>
                    <div className="cp-title">Courses</div>
                    <div className="cp-sub">Active courses and subject configuration</div>
                </div>

                <div className="cp-tabs">
                    <button className={`cp-tab ${tab === 'coaching' ? 'active' : ''}`} onClick={() => setTab('coaching')}>Coaching (PCM/JEE/NEET)</button>
                    <button className={`cp-tab ${tab === 'school' ? 'active' : ''}`} onClick={() => setTab('school')}>School Section (Class 5–10)</button>
                </div>

                {tab === 'coaching' && (
                    <div className="cp-grid">
                        {Object.entries(COACHING_COURSES).map(([name, info]) => (
                            <div key={name} className="cp-card">
                                <div className="cp-glow" style={{ background: info.color }} />
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <div className="cp-name" style={{ color: info.color }}>{name}</div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#1e293b', padding: '3px 9px', borderRadius: 20, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>{info.subjects.length} subjects</span>
                                </div>
                                <div className="cp-desc">{info.desc}</div>
                                <div className="cp-divider" />
                                <div className="cp-subjects">
                                    {info.subjects.map(s => (
                                        <div key={s} className="cp-subject">
                                            <div className="cp-subject-icon" style={{ background: `${info.color}14`, color: info.color }}>{SUBJECT_ICONS[s] || '◎'}</div>
                                            <div className="cp-subject-name">{s}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="cp-active" style={{ color: '#22c55e' }}>
                                    <div className="cp-dot" style={{ background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,.5)' }} />
                                    Active
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'school' && (
                    <div className="cp-grid">
                        {Object.entries(SCHOOL_CLASSES).map(([cls, info]) => (
                            <div key={cls} className="cp-card">
                                <div className="cp-glow" style={{ background: info.color }} />
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <div className="cp-name" style={{ color: info.color }}>{cls}</div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#1e293b', padding: '3px 9px', borderRadius: 20, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>{info.compulsory.length + info.optional.length} subjects</span>
                                </div>
                                <div className="cp-divider" />
                                <div className="cp-subjects">
                                    {info.compulsory.map(s => (
                                        <div key={s} className="cp-subject">
                                            <div className="cp-subject-icon" style={{ background: `${info.color}14`, color: info.color }}>{SUBJECT_ICONS[s] || '◎'}</div>
                                            <div className="cp-subject-name">{s}</div>
                                        </div>
                                    ))}
                                </div>
                                {info.optional.length > 0 && (
                                    <>
                                        <div className="cp-opt-label">Optional Subjects</div>
                                        {info.optional.map(s => (
                                            <div key={s} className="cp-opt-subject">
                                                <div className="cp-subject-icon" style={{ background: 'rgba(255,255,255,.03)', color: '#334155' }}>{SUBJECT_ICONS[s] || '◎'}</div>
                                                <div style={{ fontSize: 12, color: '#475569' }}>{s}</div>
                                                <span className="cp-opt-tag">optional</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                                <div className="cp-active" style={{ color: '#22c55e' }}>
                                    <div className="cp-dot" style={{ background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,.5)' }} />
                                    Active
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}