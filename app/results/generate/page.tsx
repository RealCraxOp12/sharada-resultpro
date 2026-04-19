'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Student { id: string; name: string; roll_no: string; course?: { name: string }; }
interface SubjectMark { subject: string; obtained: number; total: number; pct: number; grade: string; }
interface StudentEntry {
    student: Student; marks: SubjectMark[];
    bioObtained: string; bioTotal: string;
    savedMarks: SubjectMark[] | null; saved: boolean; saving: boolean;
}

const COURSE_SUBJECTS: Record<string, string[]> = {
    PCM: ['Physics', 'Chemistry', 'Mathematics'],
    PCMB: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    JEE: ['Physics', 'Chemistry', 'Mathematics'],
    NEET: ['Physics', 'Chemistry', 'Biology'],
    CET: ['Physics', 'Chemistry', 'Mathematics'],
};
const COURSE_COLORS: Record<string, string> = {
    PCM: '#3b82f6', PCMB: '#a855f7', JEE: '#f97316', NEET: '#22c55e', CET: '#eab308',
};
const GRADE_COLOR: Record<string, string> = {
    A: '#4ade80', B: '#60a5fa', C: '#facc15', D: '#f87171',
};

function getGrade(pct: number) { return pct >= 90 ? 'A' : pct >= 75 ? 'B' : pct >= 50 ? 'C' : 'D'; }
function buildMarks(c: string): SubjectMark[] {
    return (COURSE_SUBJECTS[c] || ['Physics', 'Chemistry', 'Mathematics']).map(s => ({ subject: s, obtained: 0, total: 100, pct: 0, grade: 'D' }));
}
function calcFinalMarks(e: StudentEntry): SubjectMark[] {
    const cName = e.student.course?.name || 'PCM';
    const hasBio = (COURSE_SUBJECTS[cName] || []).includes('Biology');
    const final = [...e.marks];
    if (!hasBio && e.bioObtained !== '') {
        const obt = Number(e.bioObtained), tot = Number(e.bioTotal) || 100;
        const pct = tot > 0 ? Math.round((obt / tot) * 100) : 0;
        final.push({ subject: 'Biology', obtained: obt, total: tot, pct, grade: getGrade(pct) });
    }
    return final;
}
function calcSummary(marks: SubjectMark[]) {
    const totalObtained = marks.reduce((s, m) => s + m.obtained, 0);
    const totalMax = marks.reduce((s, m) => s + m.total, 0);
    const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    return {
        totalObtained, totalMax, overallPct, finalGrade: getGrade(overallPct),
        bestSubject: [...marks].sort((a, b) => b.pct - a.pct)[0],
        weakSubject: [...marks].sort((a, b) => a.pct - b.pct)[0]
    };
}

export default function GenerateResultPage() {
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [examName, setExamName] = useState('');
    const [search, setSearch] = useState('');
    const [filterCourse, setFilterCourse] = useState('All');
    const [entries, setEntries] = useState<StudentEntry[]>([]);
    const [savedCount, setSavedCount] = useState(0);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [bulkSaving, setBulkSaving] = useState(false);
    const [allDone, setAllDone] = useState(false);
    const [dlAll, setDlAll] = useState(false);
    const [dlProgress, setDlProgress] = useState('');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        fetch('/api/students').then(r => r.json()).then(d => setAllStudents(d.students || []));
        setTimeout(() => setVisible(true), 50);
    }, []);

    const filtered = allStudents.filter(s => {
        const ms = s.name.toLowerCase().includes(search.toLowerCase()) || s.roll_no.toLowerCase().includes(search.toLowerCase());
        const mc = filterCourse === 'All' || s.course?.name === filterCourse;
        return ms && mc;
    });
    const selectedIds = new Set(entries.map(e => e.student.id));

    function toggleStudent(s: Student) {
        if (selectedIds.has(s.id)) {
            setEntries(p => p.filter(e => e.student.id !== s.id));
            if (expandedId === s.id) setExpandedId(null);
        } else {
            setEntries(p => [...p, { student: s, marks: buildMarks(s.course?.name || 'PCM'), bioObtained: '', bioTotal: '', savedMarks: null, saved: false, saving: false }]);
            setExpandedId(s.id);
        }
    }
    function selectAll() { filtered.forEach(s => { if (!selectedIds.has(s.id)) toggleStudent(s); }); }
    function clearAll() { setEntries([]); setExpandedId(null); }

    function updateMark(sid: string, i: number, val: string) {
        const obt = val === '' ? 0 : Number(val);
        setEntries(p => p.map(e => {
            if (e.student.id !== sid) return e;
            const marks = [...e.marks];
            const pct = marks[i].total > 0 ? Math.round((obt / marks[i].total) * 100) : 0;
            marks[i] = { ...marks[i], obtained: obt, pct, grade: getGrade(pct) };
            return { ...e, marks, saved: false };
        }));
    }
    function updateTotal(sid: string, i: number, val: string) {
        const tot = val === '' ? 100 : Number(val);
        setEntries(p => p.map(e => {
            if (e.student.id !== sid) return e;
            const marks = [...e.marks];
            const pct = tot > 0 ? Math.round((marks[i].obtained / tot) * 100) : 0;
            marks[i] = { ...marks[i], total: tot, pct, grade: getGrade(pct) };
            return { ...e, marks, saved: false };
        }));
    }
    function updateBio(sid: string, field: 'bioObtained' | 'bioTotal', val: string) {
        setEntries(p => p.map(e => e.student.id === sid ? { ...e, [field]: val, saved: false } : e));
    }

    async function saveEntry(sid: string) {
        if (!examName) return alert('Enter exam name first!');
        setEntries(p => p.map(e => e.student.id === sid ? { ...e, saving: true } : e));
        const entry = entries.find(e => e.student.id === sid)!;
        const finalMarks = calcFinalMarks(entry);
        const res = await fetch('/api/results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student_id: sid, exam_name: examName, marks_data: finalMarks }) });
        if (res.ok) {
            setEntries(p => p.map(e => e.student.id === sid ? { ...e, saved: true, saving: false, savedMarks: finalMarks } : e));
            setSavedCount(p => p + 1);
        } else {
            alert('Failed: ' + entry.student.name);
            setEntries(p => p.map(e => e.student.id === sid ? { ...e, saving: false } : e));
        }
    }
    async function saveAll() {
        if (!examName) return alert('Enter exam name!');
        if (!entries.length) return alert('Select students!');
        setBulkSaving(true);
        for (const e of entries) if (!e.saved) await saveEntry(e.student.id);
        setBulkSaving(false); setAllDone(true);
    }
    async function downloadPDF(sid: string) {
        if (!examName) return alert('Enter exam name!');
        const entry = entries.find(e => e.student.id === sid)!;
        const finalMarks = entry.savedMarks ?? calcFinalMarks(entry);
        const summary = calcSummary(finalMarks);
        const inst = await fetch('/api/settings').then(r => r.json());
        const res = await fetch('/api/pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student: { name: entry.student.name, roll: entry.student.roll_no, course: entry.student.course?.name || '', batch: '2025-26' }, institute: inst.institute, exam: examName, marks: finalMarks, summary }) });
        if (res.ok) { const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${entry.student.name}_Result.pdf`; a.click(); URL.revokeObjectURL(url); }
        else alert('PDF failed!');
    }
    async function downloadAllPDFs() {
        const saved = entries.filter(e => e.saved);
        if (!saved.length) return alert('No saved results!');
        setDlAll(true);
        for (let i = 0; i < saved.length; i++) { setDlProgress(`${i + 1} of ${saved.length}`); await downloadPDF(saved[i].student.id); await new Promise(r => setTimeout(r, 800)); }
        setDlProgress(''); setDlAll(false);
    }

    return (
        <>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
            .gp-root { font-family:'Inter',sans-serif; color:#f1f5f9; opacity:0; transform:translateY(16px); transition:opacity .5s ease,transform .5s ease; }
            .gp-root.show { opacity:1; transform:translateY(0); }
            .gp-title { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; letter-spacing:-.03em; color:#f1f5f9; }
            .gp-sub { font-size:12px; color:#334155; margin-top:3px; }
            .gp-card { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); border-radius:16px; }
            .gp-inp {
                background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07);
                border-radius:10px; padding:10px 14px; font-size:13px; color:#e2e8f0;
                font-family:'Inter',sans-serif; outline:none; transition:border-color .18s; width:100%;
            }
            .gp-inp:focus { border-color:rgba(249,115,22,.4); }
            .gp-inp::placeholder { color:#1e293b; }
            .gp-sel { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:10px; padding:9px 12px; font-size:12px; color:#e2e8f0; font-family:'Inter',sans-serif; outline:none; transition:border-color .18s; width:100%; }
            .gp-sel:focus { border-color:rgba(249,115,22,.4); }
            .gp-label { font-size:9.5px; font-weight:700; color:#1e293b; text-transform:uppercase; letter-spacing:.1em; display:block; margin-bottom:5px; }
            .gp-student { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-radius:10px; cursor:pointer; transition:all .15s; border:1px solid transparent; margin-bottom:3px; }
            .gp-student:hover { background:rgba(255,255,255,.03); }
            .gp-student.sel { background:rgba(249,115,22,.07); border-color:rgba(249,115,22,.2); }
            .gp-sname { font-size:12.5px; font-weight:500; color:#e2e8f0; }
            .gp-sroll { font-size:10px; color:#334155; font-family:monospace; margin-top:1px; }
            .gp-btn { padding:9px 18px; border-radius:10px; font-size:12.5px; font-weight:600; cursor:pointer; border:none; font-family:'Inter',sans-serif; transition:all .18s; }
            .gp-btn-orange { background:#f97316; color:white; box-shadow:0 2px 12px rgba(249,115,22,.2); }
            .gp-btn-orange:hover:not(:disabled) { background:#ea580c; transform:translateY(-1px); }
            .gp-btn-green { background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.2); color:#4ade80; }
            .gp-btn-green:hover:not(:disabled) { background:rgba(34,197,94,.18); }
            .gp-btn-blue { background:rgba(59,130,246,.1); border:1px solid rgba(59,130,246,.2); color:#60a5fa; }
            .gp-btn-blue:hover:not(:disabled) { background:rgba(59,130,246,.18); }
            .gp-btn-ghost { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); color:#475569; }
            .gp-btn-ghost:hover { background:rgba(255,255,255,.07); color:#94a3b8; }
            .gp-btn:disabled { opacity:.5; cursor:not-allowed; }
            .gp-entry { border-radius:14px; border:1px solid rgba(255,255,255,.05); overflow:hidden; background:rgba(255,255,255,.02); margin-bottom:10px; transition:border-color .2s; }
            .gp-entry.saved { border-color:rgba(34,197,94,.2); }
            .gp-entry-head { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; cursor:pointer; transition:background .15s; }
            .gp-entry-head:hover { background:rgba(255,255,255,.02); }
            .gp-entry-name { font-size:13.5px; font-weight:600; color:#f1f5f9; }
            .gp-entry-roll { font-size:10.5px; color:#334155; font-family:monospace; margin-top:2px; }
            .gp-marks-grid { display:grid; grid-template-columns:1fr 100px 100px 90px; gap:8px; align-items:center; margin-bottom:8px; }
            .gp-marks-header { font-size:9.5px; font-weight:700; color:#1e293b; text-transform:uppercase; letter-spacing:.08em; }
            .gp-mark-inp { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:8px; padding:8px 10px; font-size:13px; color:#e2e8f0; font-family:'Inter',sans-serif; outline:none; width:100%; transition:border-color .15s; }
            .gp-mark-inp:focus { border-color:rgba(249,115,22,.4); }
            .gp-mark-inp::placeholder { color:#1e293b; }
            .gp-mark-inp.bio { border-style:dashed; border-color:rgba(255,255,255,.06); }
            .gp-mark-inp.bio:focus { border-color:rgba(34,197,94,.4); border-style:solid; }
            .gp-saved-badge { background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.2); color:#4ade80; font-size:11px; font-weight:600; padding:4px 12px; border-radius:20px; }
            .gp-done-card { background:rgba(34,197,94,.06); border:1px solid rgba(34,197,94,.15); border-radius:16px; padding:28px; text-align:center; }
            .gp-section-div { height:1px; background:rgba(255,255,255,.04); margin:10px 0; }
        `}</style>
            <div className={`gp-root ${visible ? 'show' : ''}`}>
                <div style={{ marginBottom: 24 }}>
                    <div className="gp-title">Generate Results</div>
                    <div className="gp-sub">Select students · Enter marks · Save · Download PDFs</div>
                </div>

                {/* Exam name */}
                <div className="gp-card" style={{ padding: '16px 18px', marginBottom: 20 }}>
                    <label className="gp-label">Exam Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input className="gp-inp" value={examName} onChange={e => setExamName(e.target.value)} placeholder="e.g. Unit Test 1, Mid Term, Final Exam..." style={{ maxWidth: 420 }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 20 }}>

                    {/* LEFT — picker */}
                    <div className="gp-card" style={{ padding: 16 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>Select Students</div>
                        <input className="gp-inp" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or roll…" style={{ marginBottom: 8 }} />
                        <select className="gp-sel" value={filterCourse} onChange={e => setFilterCourse(e.target.value)} style={{ marginBottom: 12 }}>
                            <option value="All">All Courses</option>
                            {['PCM', 'PCMB', 'JEE', 'NEET', 'CET'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <div style={{ maxHeight: 320, overflowY: 'auto', paddingRight: 2 }}>
                            {filtered.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px 0', color: '#1e293b', fontSize: 12 }}>No students found</div>
                            ) : filtered.map(s => {
                                const sel = selectedIds.has(s.id);
                                const entry = entries.find(e => e.student.id === s.id);
                                const c = s.course?.name || 'PCM';
                                const color = COURSE_COLORS[c] || '#94a3b8';
                                return (
                                    <div key={s.id} className={`gp-student ${sel ? 'sel' : ''}`} onClick={() => toggleStudent(s)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                                                {s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="gp-sname">{s.name}</div>
                                                <div className="gp-sroll">{s.roll_no} · {c}</div>
                                            </div>
                                        </div>
                                        {entry?.saved ? <span style={{ fontSize: 10, color: '#4ade80' }}>✓</span> : sel ? <span style={{ fontSize: 10, color: '#f97316' }}>✎</span> : null}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="gp-section-div" />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 10, color: '#1e293b' }}>{entries.length} selected · {savedCount} saved</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button className="gp-btn gp-btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }} onClick={selectAll}>✓ All</button>
                                <button className="gp-btn gp-btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }} onClick={clearAll}>✕ Clear</button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — marks */}
                    <div>
                        {entries.length === 0 ? (
                            <div className="gp-card" style={{ padding: '40px 20px', textAlign: 'center', color: '#1e293b' }}>
                                <div style={{ fontSize: 28, marginBottom: 8, opacity: .3 }}>←</div>
                                <div style={{ fontSize: 13 }}>Select students to enter marks</div>
                            </div>
                        ) : entries.map(entry => {
                            const cName = entry.student.course?.name || 'PCM';
                            const hasBio = (COURSE_SUBJECTS[cName] || []).includes('Biology');
                            const fm = entry.savedMarks ?? calcFinalMarks(entry);
                            const { totalObtained, totalMax, overallPct, finalGrade } = calcSummary(fm);
                            const isExp = expandedId === entry.student.id;
                            const gc = GRADE_COLOR[finalGrade] || '#f87171';
                            return (
                                <div key={entry.student.id} className={`gp-entry ${entry.saved ? 'saved' : ''}`}>
                                    <div className="gp-entry-head" onClick={() => setExpandedId(isExp ? null : entry.student.id)}>
                                        <div>
                                            <div className="gp-entry-name">{entry.student.name}</div>
                                            <div className="gp-entry-roll">{entry.student.roll_no} · {cName}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {entry.saved
                                                ? <span className="gp-saved-badge">✓ Saved</span>
                                                : <span style={{ fontSize: 13, fontWeight: 700, color: gc }}>{overallPct}% · {finalGrade}</span>
                                            }
                                            <span style={{ fontSize: 11, color: '#1e293b' }}>{isExp ? '▲' : '▼'}</span>
                                        </div>
                                    </div>

                                    {isExp && (
                                        <div style={{ padding: '0 16px 16px' }}>
                                            <div className="gp-marks-grid" style={{ marginBottom: 6 }}>
                                                <div className="gp-marks-header">Subject</div>
                                                <div className="gp-marks-header">Obtained</div>
                                                <div className="gp-marks-header">Out Of</div>
                                                <div className="gp-marks-header">Result</div>
                                            </div>
                                            {entry.marks.map((m, i) => (
                                                <div key={m.subject} className="gp-marks-grid">
                                                    <div style={{ fontSize: 13, fontWeight: 500, color: '#cbd5e1' }}>{m.subject}</div>
                                                    <input className="gp-mark-inp" inputMode="numeric" value={m.obtained === 0 ? '' : String(m.obtained)} onChange={e => updateMark(entry.student.id, i, e.target.value)} onWheel={e => (e.target as HTMLInputElement).blur()} placeholder="Marks" />
                                                    <input className="gp-mark-inp" inputMode="numeric" value={m.total === 100 ? '' : String(m.total)} onChange={e => updateTotal(entry.student.id, i, e.target.value)} onWheel={e => (e.target as HTMLInputElement).blur()} placeholder="100" />
                                                    <div style={{ fontSize: 12, fontWeight: 700, color: GRADE_COLOR[m.grade] || '#f87171' }}>{m.pct}% <span style={{ fontSize: 10, opacity: .7 }}>({m.grade})</span></div>
                                                </div>
                                            ))}
                                            {!hasBio && (
                                                <>
                                                    <div className="gp-section-div" />
                                                    <div className="gp-marks-grid">
                                                        <div style={{ fontSize: 12, color: '#475569' }}>Biology <span style={{ fontSize: 10, color: '#1e293b' }}>(optional)</span></div>
                                                        <input className="gp-mark-inp bio" inputMode="numeric" value={entry.bioObtained} onChange={e => updateBio(entry.student.id, 'bioObtained', e.target.value)} onWheel={e => (e.target as HTMLInputElement).blur()} placeholder="Marks" />
                                                        <input className="gp-mark-inp bio" inputMode="numeric" value={entry.bioTotal} onChange={e => updateBio(entry.student.id, 'bioTotal', e.target.value)} onWheel={e => (e.target as HTMLInputElement).blur()} placeholder="100" />
                                                        <div style={{ fontSize: 10, color: '#1e293b' }}>
                                                            {entry.bioObtained !== '' ? (() => { const p = Math.round((Number(entry.bioObtained) / (Number(entry.bioTotal) || 100)) * 100); return <span style={{ color: GRADE_COLOR[getGrade(p)] }}>{p}%</span>; })() : 'skip if empty'}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            <div className="gp-section-div" />
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                                                    <span style={{ color: '#334155' }}>Total: <strong style={{ color: '#e2e8f0' }}>{totalObtained}/{totalMax}</strong></span>
                                                    <span style={{ color: '#334155' }}>Pct: <strong style={{ color: gc }}>{overallPct}%</strong></span>
                                                    <span style={{ color: '#334155' }}>Grade: <strong style={{ color: gc }}>{finalGrade}</strong></span>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    {!entry.saved ? (
                                                        <button className="gp-btn gp-btn-orange" style={{ padding: '8px 16px' }} onClick={() => saveEntry(entry.student.id)} disabled={entry.saving}>
                                                            {entry.saving ? 'Saving…' : 'Save'}
                                                        </button>
                                                    ) : (
                                                        <button className="gp-btn gp-btn-blue" style={{ padding: '8px 16px' }} onClick={() => downloadPDF(entry.student.id)}>
                                                            ⬇ PDF
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {entries.length > 0 && !allDone && (
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button className="gp-btn gp-btn-green" style={{ flex: 1, padding: '12px' }} onClick={saveAll} disabled={bulkSaving}>
                                    {bulkSaving ? '⏳ Saving all…' : `Save All ${entries.length} Results`}
                                </button>
                                {entries.some(e => e.saved) && (
                                    <button className="gp-btn gp-btn-blue" style={{ flex: 1, padding: '12px' }} onClick={downloadAllPDFs} disabled={dlAll}>
                                        {dlAll ? `⏳ ${dlProgress}` : `⬇ Download Saved (${entries.filter(e => e.saved).length})`}
                                    </button>
                                )}
                            </div>
                        )}

                        {allDone && (
                            <div className="gp-done-card">
                                <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
                                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 800, color: '#4ade80', marginBottom: 4 }}>All {savedCount} results saved!</div>
                                <div style={{ fontSize: 12, color: '#334155', marginBottom: 20 }}>Download all PDFs or view results</div>
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <button className="gp-btn gp-btn-blue" onClick={downloadAllPDFs} disabled={dlAll}>
                                        {dlAll ? `⏳ ${dlProgress}` : `⬇ Download All ${savedCount} PDFs`}
                                    </button>
                                    <Link href="/results" style={{ display: 'inline-flex', alignItems: 'center', padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', color: '#94a3b8', fontSize: 12.5, fontWeight: 600, textDecoration: 'none', transition: 'all .18s' }}>
                                        View Results →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}