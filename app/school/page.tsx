'use client';
import { useEffect, useState } from 'react';

const CLASS_COMPULSORY: Record<string, string[]> = {
    'Class 5': ['Maths', 'Science', 'English'],
    'Class 6': ['Maths', 'Science', 'English'],
    'Class 7': ['Maths', 'Science', 'English'],
    'Class 8': ['Maths', 'Science', 'English'],
    'Class 9': ['Maths 1', 'Maths 2', 'Science 1', 'Science 2', 'English'],
    'Class 10': ['Maths 1', 'Maths 2', 'Science 1', 'Science 2', 'English'],
};
const CLASS_OPTIONAL: Record<string, string[]> = {
    'Class 5': ['Sanskrit'],
    'Class 6': ['Sanskrit'],
    'Class 7': ['Sanskrit'],
    'Class 8': ['Sanskrit', 'IT', 'Marathi Grammar', 'Hindi Grammar'],
    'Class 9': ['Sanskrit', 'IT', 'Marathi Grammar', 'Hindi Grammar'],
    'Class 10': ['Sanskrit', 'IT', 'Marathi Grammar', 'Hindi Grammar'],
};
const ALL_CLASSES = ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const GRADE_COLOR: Record<string, string> = { A: '#4ade80', B: '#60a5fa', C: '#facc15', D: '#f87171' };
const COURSE_COLORS: Record<string, string> = {
    'Class 5': '#06b6d4', 'Class 6': '#06b6d4', 'Class 7': '#06b6d4',
    'Class 8': '#8b5cf6', 'Class 9': '#ec4899', 'Class 10': '#ec4899',
};

function getGrade(p: number) { return p >= 90 ? 'A' : p >= 75 ? 'B' : p >= 50 ? 'C' : 'D'; }

interface MarkEntry {
    subject: string; obtained: number; total: number;
    pct: number; grade: string; optional: boolean; included: boolean;
}
interface ImportedResult {
    name: string; roll: string; pct: number; grade: string; className: string;
    marks: { subject: string; obtained: number; total: number; pct: number; grade: string }[];
}

function buildEntries(cls: string): MarkEntry[] {
    const comp = (CLASS_COMPULSORY[cls] || []).map(s => ({ subject: s, obtained: 0, total: 100, pct: 0, grade: 'D', optional: false, included: true }));
    const opt = (CLASS_OPTIONAL[cls] || []).map(s => ({ subject: s, obtained: 0, total: 100, pct: 0, grade: 'D', optional: true, included: false }));
    return [...comp, ...opt];
}

export default function SchoolPage() {
    const [tab, setTab] = useState<'manual' | 'excel'>('manual');
    const [visible, setVisible] = useState(false);

    // Manual
    const [studentName, setStudentName] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [className, setClassName] = useState('Class 5');
    const [batch, setBatch] = useState('2025-26');
    const [examName, setExamName] = useState('');
    const [entries, setEntries] = useState<MarkEntry[]>(buildEntries('Class 5'));
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [dlPdf, setDlPdf] = useState(false);

    // Excel
    const [exFile, setExFile] = useState<File | null>(null);
    const [exExam, setExExam] = useState('');
    const [uploading, setUploading] = useState(false);
    const [exDone, setExDone] = useState(false);
    const [exResults, setExResults] = useState<ImportedResult[]>([]);
    const [exErrors, setExErrors] = useState<string[]>([]);
    const [exSuccess, setExSuccess] = useState(0);
    const [exErrCount, setExErrCount] = useState(0);
    const [dlAll, setDlAll] = useState(false);
    const [dlProgress, setDlProgress] = useState('');

    useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

    function onClassChange(cls: string) {
        setClassName(cls); setEntries(buildEntries(cls)); setSaved(false);
    }

    function updateMark(i: number, field: 'obtained' | 'total', val: string) {
        setEntries(prev => {
            const next = [...prev];
            const v = val === '' ? 0 : Number(val);
            next[i] = { ...next[i], [field]: v };
            const obt = field === 'obtained' ? v : next[i].obtained;
            const tot = field === 'total' ? v : next[i].total;
            const pct = tot > 0 ? Math.round((obt / tot) * 100) : 0;
            next[i].pct = pct; next[i].grade = getGrade(pct);
            return next;
        });
        setSaved(false);
    }

    function toggleOptional(i: number) {
        setEntries(prev => {
            const next = [...prev];
            next[i] = { ...next[i], included: !next[i].included };
            return next;
        });
        setSaved(false);
    }

    const included = entries.filter(e => e.included);
    const totalObt = included.reduce((s, m) => s + m.obtained, 0);
    const totalMax = included.reduce((s, m) => s + m.total, 0);
    const overallPct = totalMax > 0 ? Math.round((totalObt / totalMax) * 100) : 0;
    const finalGrade = getGrade(overallPct);
    const gc = GRADE_COLOR[finalGrade];

    async function handleSave() {
        if (!studentName || !rollNo || !examName) return alert('Fill student name, roll number and exam name!');
        setSaving(true);
        const marksData = included.map(m => ({ subject: m.subject, obtained: m.obtained, total: m.total, pct: m.pct, grade: m.grade }));
        const cr = await fetch('/api/courses').then(r => r.json());
        let courseId = cr.courses?.find((c: { name: string; id: string }) => c.name === className)?.id;
        if (!courseId) {
            const nc = await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: className }) }).then(r => r.json());
            courseId = nc?.course?.id;
        }
        const sRes = await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: studentName, roll_no: rollNo, course_id: courseId, batch }) }).then(r => r.json());
        if (sRes?.student?.id) {
            await fetch('/api/results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student_id: sRes.student.id, exam_name: examName, marks_data: marksData }) });
        }
        setSaved(true); setSaving(false);
    }

    async function downloadManualPDF() {
        if (!studentName) return alert('Enter student name!');
        setDlPdf(true);
        const inst = await fetch('/api/settings').then(r => r.json());
        const marks = included.map(m => ({ subject: m.subject, obtained: m.obtained, total: m.total, pct: m.pct, grade: m.grade }));
        const sorted = [...marks].sort((a, b) => b.pct - a.pct);
        const res = await fetch('/api/pdf', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student: { name: studentName, roll: rollNo, course: className, batch },
                institute: inst.institute, exam: examName || 'Exam', marks,
                summary: { totalObtained: totalObt, totalMax, overallPct, finalGrade, bestSubject: sorted[0], weakSubject: sorted[sorted.length - 1] },
                isSchool: true,
            }),
        });
        if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${studentName}_${className}_Result.pdf`; a.click();
            URL.revokeObjectURL(url);
        } else alert('PDF generation failed!');
        setDlPdf(false);
    }

    async function downloadTemplate() {
        const res = await fetch('/api/school-import/template');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'Sharada_School_Marks_Template.xlsx'; a.click();
        URL.revokeObjectURL(url);
    }

    async function handleExcelUpload() {
        if (!exFile) return alert('Select a file!');
        if (!exExam) return alert('Enter exam name!');
        setUploading(true);
        const fd = new FormData();
        fd.append('file', exFile); fd.append('exam_name', exExam);
        const res = await fetch('/api/school-import/upload', { method: 'POST', body: fd });
        const data = await res.json();
        setUploading(false);
        if (!res.ok) return alert(data.error || 'Upload failed');
        setExSuccess(data.success); setExErrCount(data.errors);
        setExResults(data.results || []); setExErrors(data.errorLog || []);
        setExDone(true);
    }

    async function downloadSinglePDF(r: ImportedResult) {
        const inst = await fetch('/api/settings').then(x => x.json());
        const marks = r.marks;
        const sorted = [...marks].sort((a, b) => b.pct - a.pct);
        const tObt = marks.reduce((s, m) => s + m.obtained, 0);
        const tMax = marks.reduce((s, m) => s + m.total, 0);
        const oPct = tMax > 0 ? Math.round((tObt / tMax) * 100) : 0;
        const res = await fetch('/api/pdf', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student: { name: r.name, roll: r.roll, course: r.className, batch: '2025-26' },
                institute: inst.institute, exam: exExam, marks,
                summary: { totalObtained: tObt, totalMax: tMax, overallPct: oPct, finalGrade: getGrade(oPct), bestSubject: sorted[0], weakSubject: sorted[sorted.length - 1] },
                isSchool: true,
            }),
        });
        if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${r.name}_${r.className}_Result.pdf`; a.click();
            URL.revokeObjectURL(url);
        } else alert(`PDF failed for ${r.name}`);
    }

    async function downloadAllPDFs() {
        setDlAll(true);
        for (let i = 0; i < exResults.length; i++) {
            setDlProgress(`${i + 1} of ${exResults.length}`);
            await downloadSinglePDF(exResults[i]);
            await new Promise(r => setTimeout(r, 900));
        }
        setDlProgress(''); setDlAll(false);
    }

    function resetExcel() {
        setExFile(null); setExExam(''); setExDone(false);
        setExResults([]); setExErrors([]); setExSuccess(0); setExErrCount(0);
    }

    return (
        <>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
            .sc-root { font-family:'Inter',sans-serif; color:#f1f5f9; opacity:0; transform:translateY(16px); transition:opacity .5s,transform .5s; }
            .sc-root.show { opacity:1; transform:translateY(0); }
            .sc-title { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; letter-spacing:-.03em; }
            .sc-sub { font-size:12px; color:#334155; margin-top:3px; margin-bottom:20px; }
            .sc-tabs { display:flex; gap:4px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); border-radius:12px; padding:4px; width:fit-content; margin-bottom:24px; }
            .sc-tab { padding:9px 22px; border-radius:9px; font-size:12.5px; font-weight:600; cursor:pointer; border:1px solid transparent; font-family:'Inter',sans-serif; transition:all .18s; background:transparent; color:#475569; }
            .sc-tab.active { background:rgba(99,102,241,.12); color:#818cf8; border-color:rgba(99,102,241,.2); }
            .sc-card { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); border-radius:16px; padding:20px; margin-bottom:14px; }
            .sc-section-label { font-size:10px; font-weight:700; color:#1e293b; text-transform:uppercase; letter-spacing:.12em; margin-bottom:14px; }
            .sc-label { font-size:9.5px; font-weight:700; color:#1e293b; text-transform:uppercase; letter-spacing:.1em; display:block; margin-bottom:6px; }
            .sc-inp { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:10px; padding:10px 14px; font-size:13px; color:#e2e8f0; font-family:'Inter',sans-serif; outline:none; transition:border-color .18s; width:100%; }
            .sc-inp:focus { border-color:rgba(99,102,241,.4); }
            .sc-inp::placeholder { color:#1e293b; }
            .sc-sel { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:10px; padding:10px 12px; font-size:13px; color:#e2e8f0; font-family:'Inter',sans-serif; outline:none; width:100%; }
            .sc-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
            .sc-btn { padding:10px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; border:none; font-family:'Inter',sans-serif; transition:all .18s; }
            .sc-btn-indigo { background:rgba(99,102,241,.15); border:1px solid rgba(99,102,241,.25); color:#818cf8; }
            .sc-btn-indigo:hover:not(:disabled) { background:rgba(99,102,241,.25); transform:translateY(-1px); box-shadow:0 4px 16px rgba(99,102,241,.2); }
            .sc-btn-orange { background:#f97316; color:white; box-shadow:0 2px 12px rgba(249,115,22,.2); }
            .sc-btn-orange:hover:not(:disabled) { background:#ea580c; transform:translateY(-1px); }
            .sc-btn-blue { background:rgba(59,130,246,.1); border:1px solid rgba(59,130,246,.2); color:#60a5fa; }
            .sc-btn-blue:hover:not(:disabled) { background:rgba(59,130,246,.18); }
            .sc-btn-green { background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.2); color:#4ade80; }
            .sc-btn-green:hover { background:rgba(34,197,94,.18); }
            .sc-btn-ghost { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); color:#475569; }
            .sc-btn-ghost:hover { background:rgba(255,255,255,.07); color:#94a3b8; }
            .sc-btn:disabled { opacity:.5; cursor:not-allowed; }
            .sc-marks-header { display:grid; grid-template-columns:1fr 100px 100px 90px; gap:8px; margin-bottom:8px; }
            .sc-marks-row { display:grid; grid-template-columns:1fr 100px 100px 90px; gap:8px; align-items:center; margin-bottom:7px; }
            .sc-mark-inp { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:8px; padding:8px 10px; font-size:13px; color:#e2e8f0; font-family:'Inter',sans-serif; outline:none; width:100%; transition:border-color .15s; }
            .sc-mark-inp:focus { border-color:rgba(99,102,241,.4); }
            .sc-mark-inp::placeholder { color:#1e293b; }
            .sc-opt-wrap { background:rgba(255,255,255,.01); border:1px dashed rgba(255,255,255,.06); border-radius:10px; padding:10px 12px; margin-bottom:8px; }
            .sc-toggle-row { display:flex; align-items:center; gap:10px; }
            .sc-toggle { width:32px; height:18px; border-radius:9px; cursor:pointer; border:none; position:relative; transition:all .2s; flex-shrink:0; }
            .sc-toggle.on  { background:rgba(99,102,241,.6); }
            .sc-toggle.off { background:rgba(255,255,255,.08); }
            .sc-divider { height:1px; background:rgba(255,255,255,.04); margin:12px 0; }
            .sc-sum-row { display:flex; gap:20px; font-size:12px; flex-wrap:wrap; }
            .sc-done-card { background:rgba(34,197,94,.06); border:1px solid rgba(34,197,94,.15); border-radius:14px; padding:20px; text-align:center; margin-top:14px; }
            .sc-step { display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:50%; background:#6366f1; color:white; font-size:9px; font-weight:800; flex-shrink:0; }
            .sc-drop { border:2px dashed rgba(255,255,255,.07); border-radius:12px; padding:28px; text-align:center; cursor:pointer; transition:all .2s; }
            .sc-drop:hover { border-color:rgba(99,102,241,.3); background:rgba(99,102,241,.02); }
            .sc-drop.has-file { border-color:rgba(34,197,94,.3); background:rgba(34,197,94,.02); border-style:solid; }
            .sc-table { width:100%; border-collapse:collapse; font-size:13px; }
            .sc-thead tr { background:rgba(255,255,255,.02); border-bottom:1px solid rgba(255,255,255,.05); }
            .sc-thead th { padding:10px 14px; text-align:left; font-size:9.5px; font-weight:700; color:#1e293b; text-transform:uppercase; letter-spacing:.1em; }
            .sc-tbody tr { border-bottom:1px solid rgba(255,255,255,.03); transition:background .15s; }
            .sc-tbody tr:last-child { border-bottom:none; }
            .sc-tbody tr:hover { background:rgba(255,255,255,.02); }
            .sc-tbody td { padding:11px 14px; vertical-align:middle; }
        `}</style>

            <div className={`sc-root ${visible ? 'show' : ''}`}>
                <div className="sc-title">School Section</div>
                <div className="sc-sub">Class 5–10 · Subject-wise result generation</div>

                <div className="sc-tabs">
                    <button className={`sc-tab ${tab === 'manual' ? 'active' : ''}`} onClick={() => setTab('manual')}>◆ Manual Entry</button>
                    <button className={`sc-tab ${tab === 'excel' ? 'active' : ''}`} onClick={() => setTab('excel')}>⊞ Excel Import</button>
                </div>

                {/* ── MANUAL ── */}
                {tab === 'manual' && (
                    <div style={{ maxWidth: 700 }}>
                        <div className="sc-card">
                            <div className="sc-section-label">Student Details</div>
                            <div className="sc-grid2">
                                <div><label className="sc-label">Student Name</label><input className="sc-inp" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g. Rohan Patil" /></div>
                                <div><label className="sc-label">Roll Number</label><input className="sc-inp" value={rollNo} onChange={e => setRollNo(e.target.value)} placeholder="e.g. 2025-5-01" /></div>
                                <div>
                                    <label className="sc-label">Class</label>
                                    <select className="sc-sel" value={className} onChange={e => onClassChange(e.target.value)}>
                                        {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div><label className="sc-label">Batch</label><input className="sc-inp" value={batch} onChange={e => setBatch(e.target.value)} placeholder="2025-26" /></div>
                            </div>
                            <div><label className="sc-label">Exam Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input className="sc-inp" value={examName} onChange={e => setExamName(e.target.value)} placeholder="e.g. Unit Test 1, Quarterly Exam…" style={{ maxWidth: 360 }} /></div>
                        </div>

                        <div className="sc-card">
                            <div className="sc-section-label">Subject Marks — {className}</div>
                            <div className="sc-marks-header">
                                {['Subject', 'Obtained', 'Out Of', 'Result'].map(h => (
                                    <div key={h} style={{ fontSize: 9.5, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '.08em' }}>{h}</div>
                                ))}
                            </div>

                            {entries.filter(e => !e.optional).map((m, i) => (
                                <div key={m.subject} className="sc-marks-row">
                                    <div style={{ fontSize: 13, fontWeight: 500, color: '#cbd5e1' }}>{m.subject}</div>
                                    <input className="sc-mark-inp" inputMode="numeric" value={m.obtained === 0 ? '' : String(m.obtained)} onChange={e => updateMark(i, 'obtained', e.target.value)} onWheel={e => (e.target as HTMLInputElement).blur()} placeholder="Marks" />
                                    <input className="sc-mark-inp" inputMode="numeric" value={m.total === 100 ? '' : String(m.total)} onChange={e => updateMark(i, 'total', e.target.value)} onWheel={e => (e.target as HTMLInputElement).blur()} placeholder="100" />
                                    <div style={{ fontSize: 12, fontWeight: 700, color: GRADE_COLOR[m.grade] }}>{m.pct}% <span style={{ fontSize: 10, opacity: .6 }}>({m.grade})</span></div>
                                </div>
                            ))}

                            {entries.some(e => e.optional) && (
                                <>
                                    <div className="sc-divider" />
                                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Optional — Toggle to Include</div>
                                    {entries.map((m, globalIdx) => {
                                        if (!m.optional) return null;
                                        return (
                                            <div key={m.subject} className="sc-opt-wrap">
                                                <div className="sc-toggle-row" style={{ marginBottom: m.included ? 10 : 0 }}>
                                                    <button className={`sc-toggle ${m.included ? 'on' : 'off'}`} onClick={() => toggleOptional(globalIdx)} />
                                                    <span style={{ fontSize: 12.5, fontWeight: 500, color: m.included ? '#e2e8f0' : '#334155' }}>{m.subject}</span>
                                                    {!m.included && <span style={{ fontSize: 10, color: '#1e293b', marginLeft: 'auto' }}>not included</span>}
                                                </div>
                                                {m.included && (
                                                    <div className="sc-marks-row">
                                                        <div style={{ fontSize: 12, color: '#475569' }}>{m.subject}</div>
                                                        <input className="sc-mark-inp" inputMode="numeric" value={m.obtained === 0 ? '' : String(m.obtained)} onChange={e => updateMark(globalIdx, 'obtained', e.target.value)} onWheel={e => (e.target as HTMLInputElement).blur()} placeholder="Marks" />
                                                        <input className="sc-mark-inp" inputMode="numeric" value={m.total === 100 ? '' : String(m.total)} onChange={e => updateMark(globalIdx, 'total', e.target.value)} onWheel={e => (e.target as HTMLInputElement).blur()} placeholder="100" />
                                                        <div style={{ fontSize: 12, fontWeight: 700, color: GRADE_COLOR[m.grade] }}>{m.pct}%</div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            )}

                            <div className="sc-divider" />
                            <div className="sc-sum-row">
                                <span style={{ color: '#334155' }}>Total: <strong style={{ color: '#e2e8f0' }}>{totalObt}/{totalMax}</strong></span>
                                <span style={{ color: '#334155' }}>Percentage: <strong style={{ color: gc }}>{overallPct}%</strong></span>
                                <span style={{ color: '#334155' }}>Grade: <strong style={{ color: gc }}>{finalGrade}</strong></span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="sc-btn sc-btn-indigo" style={{ flex: 1, padding: '13px' }} onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Result'}
                            </button>
                            <button className="sc-btn sc-btn-blue" style={{ flex: 1, padding: '13px' }} onClick={downloadManualPDF} disabled={dlPdf || !studentName}>
                                {dlPdf ? '⏳ Generating…' : '⬇ Download PDF'}
                            </button>
                        </div>

                        {saved && (
                            <div className="sc-done-card">
                                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800, color: '#4ade80', marginBottom: 4 }}>✓ Result saved!</div>
                                <div style={{ fontSize: 12, color: '#334155' }}>{studentName} · {className} · {overallPct}% · Grade {finalGrade}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── EXCEL ── */}
                {tab === 'excel' && (
                    <div style={{ maxWidth: 760 }}>
                        {!exDone ? (
                            <div>
                                <div className="sc-card">
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                <span className="sc-step">1</span>
                                                <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700 }}>Download Template</span>
                                            </div>
                                            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, marginBottom: 4 }}>3 sheets — Class 5-7, Class 8, and Class 9-10 with correct columns for each.</div>
                                            <div style={{ fontSize: 11, color: '#4ade80' }}>✓ Leave optional subjects blank to skip · Biology is part of Science</div>
                                        </div>
                                        <button className="sc-btn sc-btn-green" onClick={downloadTemplate} style={{ flexShrink: 0 }}>⬇ Template</button>
                                    </div>
                                </div>

                                <div className="sc-card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <span className="sc-step">2</span>
                                        <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700 }}>Exam Name</span>
                                    </div>
                                    <input className="sc-inp" value={exExam} onChange={e => setExExam(e.target.value)} placeholder="e.g. Unit Test 1, Quarterly Exam, Annual Exam…" style={{ maxWidth: 400 }} />
                                </div>

                                <div className="sc-card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <span className="sc-step">3</span>
                                        <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700 }}>Upload Filled Excel</span>
                                    </div>
                                    <div className={`sc-drop ${exFile ? 'has-file' : ''}`} onClick={() => document.getElementById('scFileInput')?.click()}>
                                        <div style={{ fontSize: 22, marginBottom: 8, opacity: .4 }}>{exFile ? '✓' : '⊞'}</div>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: exFile ? '#4ade80' : '#475569' }}>{exFile ? exFile.name : 'Click to select Excel file'}</div>
                                        <div style={{ fontSize: 11, color: '#1e293b', marginTop: 4 }}>.xlsx or .xls files only</div>
                                        <input id="scFileInput" type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => setExFile(e.target.files?.[0] || null)} />
                                    </div>
                                    {exFile && (
                                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 12, color: '#4ade80' }}>✓ {exFile.name}</span>
                                            <button onClick={() => setExFile(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 11 }}>✕ Remove</button>
                                        </div>
                                    )}
                                </div>

                                <button className="sc-btn sc-btn-orange" style={{ width: '100%', padding: '14px', fontSize: 14, borderRadius: 12, marginBottom: 14 }} onClick={handleExcelUpload} disabled={uploading || !exFile || !exExam}>
                                    {uploading ? '⏳ Processing… please wait' : '🚀 Import & Generate Results'}
                                </button>

                                <div className="sc-card">
                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Notes</div>
                                    {['Class column must match exactly: Class 5, Class 6, Class 7, Class 8, Class 9, Class 10',
                                        'Biology is included in Science — no separate Biology column needed',
                                        'Class 9 & 10 use Maths 1, Maths 2, Science 1, Science 2 as separate columns',
                                        'Optional subjects — leave blank to skip, system won\'t include them',
                                        'Coaching results (PCM/JEE/NEET) are completely separate and unaffected'
                                    ].map((note, i) => (
                                        <div key={i} style={{ fontSize: 12, color: '#334155', padding: '3px 0', display: 'flex', gap: 8 }}>
                                            <span style={{ color: '#1e293b', flexShrink: 0 }}>◦</span>{note}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                {/* Summary cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                    <div style={{ background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.15)', borderRadius: 14, padding: '20px', textAlign: 'center' }}>
                                        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, color: '#4ade80' }}>{exSuccess}</div>
                                        <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>Imported successfully</div>
                                    </div>
                                    <div style={{ background: exErrCount > 0 ? 'rgba(239,68,68,.06)' : 'rgba(255,255,255,.02)', border: `1px solid ${exErrCount > 0 ? 'rgba(239,68,68,.15)' : 'rgba(255,255,255,.05)'}`, borderRadius: 14, padding: '20px', textAlign: 'center' }}>
                                        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, color: exErrCount > 0 ? '#f87171' : '#1e293b' }}>{exErrCount}</div>
                                        <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>Rows skipped</div>
                                    </div>
                                </div>

                                {exResults.length > 0 && (
                                    <button className="sc-btn sc-btn-blue" style={{ width: '100%', padding: '14px', fontSize: 14, borderRadius: 12, marginBottom: 14 }} onClick={downloadAllPDFs} disabled={dlAll}>
                                        {dlAll ? `⏳ Downloading ${dlProgress}…` : `⬇ Download All ${exResults.length} PDFs`}
                                    </button>
                                )}

                                {exResults.length > 0 && (
                                    <div className="sc-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                                        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                                            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700 }}>✓ Imported Results</div>
                                            <div style={{ fontSize: 11, color: '#334155', marginTop: 2 }}>All students and results saved to database</div>
                                        </div>
                                        <table className="sc-table">
                                            <thead className="sc-thead"><tr>
                                                <th>Student</th><th>Roll No</th><th>Class</th>
                                                <th style={{ textAlign: 'center' }}>%</th>
                                                <th style={{ textAlign: 'center' }}>Grade</th>
                                                <th style={{ textAlign: 'center' }}>PDF</th>
                                            </tr></thead>
                                            <tbody className="sc-tbody">
                                                {exResults.map((r, i) => {
                                                    const cc = COURSE_COLORS[r.className] || '#94a3b8';
                                                    const gc2 = GRADE_COLOR[r.grade] || '#f87171';
                                                    const pc = r.pct >= 75 ? '#4ade80' : r.pct >= 50 ? '#facc15' : '#f87171';
                                                    return (
                                                        <tr key={i}>
                                                            <td style={{ fontWeight: 500, color: '#e2e8f0' }}>{r.name}</td>
                                                            <td style={{ color: '#334155', fontFamily: 'monospace', fontSize: 11 }}>{r.roll}</td>
                                                            <td><span style={{ background: `${cc}14`, color: cc, padding: '2px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 700 }}>{r.className}</span></td>
                                                            <td style={{ textAlign: 'center', fontWeight: 700, color: pc }}>{r.pct}%</td>
                                                            <td style={{ textAlign: 'center' }}><span style={{ background: `${gc2}14`, color: gc2, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>{r.grade}</span></td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                <button className="sc-btn" style={{ background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)', color: '#60a5fa', padding: '5px 12px', borderRadius: 8, fontSize: 11 }} onClick={() => downloadSinglePDF(r)}>⬇ PDF</button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {exErrors.length > 0 && (
                                    <div style={{ background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.12)', borderRadius: 14, padding: '16px', marginBottom: 14 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 8 }}>⚠ Skipped Rows</div>
                                        {exErrors.map((e, i) => <div key={i} style={{ fontSize: 11, color: '#fca5a5', padding: '2px 0' }}>{e}</div>)}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button className="sc-btn sc-btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: 12 }} onClick={resetExcel}>⬆ Import Another</button>
                                    <a href="/results" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: 12, background: '#f97316', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                                        View Results →
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}