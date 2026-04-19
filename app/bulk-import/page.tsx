'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ImportedResult {
    name: string; roll: string; pct: number; grade: string; course: string;
    marks: { subject: string; obtained: number; total: number; pct: number; grade: string }[];
}
const GRADE_COLOR: Record<string, string> = { A: '#4ade80', B: '#60a5fa', C: '#facc15', D: '#f87171' };
const COURSE_COLORS: Record<string, string> = { PCM: '#3b82f6', PCMB: '#a855f7', JEE: '#f97316', NEET: '#22c55e', CET: '#eab308' };

export default function BulkImportPage() {
    const [examName, setExamName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [done, setDone] = useState(false);
    const [results, setResults] = useState<ImportedResult[]>([]);
    const [errorLog, setErrorLog] = useState<string[]>([]);
    const [successCount, setSuccessCount] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [dlAll, setDlAll] = useState(false);
    const [dlProgress, setDlProgress] = useState('');
    const [visible, setVisible] = useState(false);

    useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

    async function downloadTemplate() {
        const res = await fetch('/api/bulk-import/template');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'Sharada_Marks_Import_Template.xlsx'; a.click(); URL.revokeObjectURL(url);
    }
    async function handleUpload() {
        if (!file) return alert('Select a file!');
        if (!examName) return alert('Enter exam name!');
        setUploading(true);
        const fd = new FormData(); fd.append('file', file); fd.append('exam_name', examName);
        const res = await fetch('/api/bulk-import/upload', { method: 'POST', body: fd });
        const data = await res.json();
        setUploading(false);
        if (!res.ok) return alert(data.error || 'Upload failed');
        setSuccessCount(data.success); setErrorCount(data.errors);
        setResults(data.results || []); setErrorLog(data.errorLog || []); setDone(true);
    }
    async function downloadSinglePDF(r: ImportedResult) {
        const inst = await fetch('/api/settings').then(x => x.json());
        const marks = r.marks;
        const totalObt = marks.reduce((s, m) => s + m.obtained, 0);
        const totalMax = marks.reduce((s, m) => s + m.total, 0);
        const overallPct = totalMax > 0 ? Math.round((totalObt / totalMax) * 100) : 0;
        const getGrade = (p: number) => p >= 90 ? 'A' : p >= 75 ? 'B' : p >= 50 ? 'C' : 'D';
        const sorted = [...marks].sort((a, b) => b.pct - a.pct);
        const res = await fetch('/api/pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student: { name: r.name, roll: r.roll, course: r.course, batch: '2025-26' }, institute: inst.institute, exam: examName, marks, summary: { totalObtained: totalObt, totalMax, overallPct, finalGrade: getGrade(overallPct), bestSubject: sorted[0], weakSubject: sorted[sorted.length - 1] } }) });
        if (res.ok) { const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${r.name}_${r.course}_Result.pdf`; a.click(); URL.revokeObjectURL(url); }
        else alert(`PDF failed for ${r.name}`);
    }
    async function downloadAllPDFs() {
        setDlAll(true);
        for (let i = 0; i < results.length; i++) { setDlProgress(`${i + 1} of ${results.length}`); await downloadSinglePDF(results[i]); await new Promise(r => setTimeout(r, 900)); }
        setDlProgress(''); setDlAll(false);
    }
    function reset() { setFile(null); setExamName(''); setDone(false); setResults([]); setErrorLog([]); setSuccessCount(0); setErrorCount(0); setDlProgress(''); }

    return (
        <>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
            .bp-root { font-family:'Inter',sans-serif; color:#f1f5f9; max-width:800px; opacity:0; transform:translateY(16px); transition:opacity .5s ease,transform .5s ease; }
            .bp-root.show { opacity:1; transform:translateY(0); }
            .bp-title { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; letter-spacing:-.03em; }
            .bp-sub { font-size:12px; color:#334155; margin-top:3px; }
            .bp-card { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); border-radius:16px; padding:20px; margin-bottom:14px; }
            .bp-step { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:#f97316; color:white; font-size:10px; font-weight:800; flex-shrink:0; }
            .bp-step-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#f1f5f9; }
            .bp-inp { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:10px; padding:10px 14px; font-size:13px; color:#e2e8f0; font-family:'Inter',sans-serif; outline:none; transition:border-color .18s; width:100%; }
            .bp-inp:focus { border-color:rgba(249,115,22,.4); }
            .bp-inp::placeholder { color:#1e293b; }
            .bp-drop { border:2px dashed rgba(255,255,255,.07); border-radius:12px; padding:32px; text-align:center; cursor:pointer; transition:all .2s; }
            .bp-drop:hover { border-color:rgba(249,115,22,.3); background:rgba(249,115,22,.02); }
            .bp-drop.has-file { border-color:rgba(34,197,94,.3); background:rgba(34,197,94,.02); border-style:solid; }
            .bp-btn { padding:10px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; border:none; font-family:'Inter',sans-serif; transition:all .18s; }
            .bp-btn-orange { background:#f97316; color:white; box-shadow:0 2px 12px rgba(249,115,22,.2); width:100%; padding:14px; border-radius:12px; font-size:14px; }
            .bp-btn-orange:hover:not(:disabled) { background:#ea580c; transform:translateY(-1px); }
            .bp-btn-blue { background:rgba(59,130,246,.1); border:1px solid rgba(59,130,246,.2); color:#60a5fa; width:100%; padding:14px; border-radius:12px; font-size:14px; }
            .bp-btn-blue:hover:not(:disabled) { background:rgba(59,130,246,.18); }
            .bp-btn-green { background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.2); color:#4ade80; padding:10px 18px; border-radius:10px; font-size:13px; font-weight:600; }
            .bp-btn-green:hover { background:rgba(34,197,94,.18); }
            .bp-btn-ghost { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); color:#475569; flex:1; padding:12px; border-radius:12px; font-size:13px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:all .18s; }
            .bp-btn-ghost:hover { background:rgba(255,255,255,.07); color:#94a3b8; }
            .bp-btn:disabled { opacity:.5; cursor:not-allowed; }
            .bp-table { width:100%; border-collapse:collapse; font-size:13px; }
            .bp-thead tr { background:rgba(255,255,255,.02); border-bottom:1px solid rgba(255,255,255,.05); }
            .bp-thead th { padding:11px 14px; text-align:left; font-size:9.5px; font-weight:700; color:#1e293b; text-transform:uppercase; letter-spacing:.1em; }
            .bp-tbody tr { border-bottom:1px solid rgba(255,255,255,.03); transition:background .15s; }
            .bp-tbody tr:last-child { border-bottom:none; }
            .bp-tbody tr:hover { background:rgba(255,255,255,.02); }
            .bp-tbody td { padding:11px 14px; vertical-align:middle; }
            .bp-note-item { font-size:12px; color:#334155; padding:4px 0; display:flex; align-items:flex-start; gap:8px; }
            .bp-note-dot { width:4px; height:4px; border-radius:50%; background:#334155; flex-shrink:0; margin-top:6px; }
        `}</style>
            <div className={`bp-root ${visible ? 'show' : ''}`}>
                <div style={{ marginBottom: 24 }}>
                    <div className="bp-title">Bulk Import Marks</div>
                    <div className="bp-sub">Upload Excel with student details and marks — system auto-creates students and results</div>
                </div>

                {!done ? (
                    <div>
                        {/* Step 1 */}
                        <div className="bp-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <span className="bp-step">1</span>
                                        <span className="bp-step-title">Download Template</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, marginBottom: 6 }}>
                                        Download the Excel template, fill in student details and marks, then upload below.
                                    </div>
                                    <div style={{ fontSize: 11, color: '#22c55e' }}>✓ Biology is optional — leave blank if not applicable</div>
                                </div>
                                <button className="bp-btn bp-btn-green" onClick={downloadTemplate} style={{ flexShrink: 0 }}>⬇ Template</button>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bp-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <span className="bp-step">2</span>
                                <span className="bp-step-title">Exam Name</span>
                            </div>
                            <input className="bp-inp" value={examName} onChange={e => setExamName(e.target.value)} placeholder="e.g. Unit Test 1, Mid Term, Final Exam…" style={{ maxWidth: 400 }} />
                        </div>

                        {/* Step 3 */}
                        <div className="bp-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <span className="bp-step">3</span>
                                <span className="bp-step-title">Upload Excel</span>
                            </div>
                            <div className={`bp-drop ${file ? 'has-file' : ''}`} onClick={() => document.getElementById('bpFileInput')?.click()}>
                                <div style={{ fontSize: 24, marginBottom: 8, opacity: .4 }}>{file ? '✓' : '⊞'}</div>
                                <div style={{ fontSize: 13, fontWeight: 500, color: file ? '#4ade80' : '#475569' }}>{file ? file.name : 'Click to select Excel file'}</div>
                                <div style={{ fontSize: 11, color: '#1e293b', marginTop: 4 }}>.xlsx or .xls files only</div>
                                <input id="bpFileInput" type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
                            </div>
                            {file && <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 12, color: '#4ade80' }}>✓ {file.name}</span>
                                <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 11 }}>✕ Remove</button>
                            </div>}
                        </div>

                        <button className="bp-btn bp-btn-orange" onClick={handleUpload} disabled={uploading || !file || !examName} style={{ marginBottom: 14 }}>
                            {uploading ? '⏳ Processing… please wait' : '🚀 Import Students & Marks'}
                        </button>

                        {/* Notes */}
                        <div className="bp-card">
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Important Notes</div>
                            {[
                                'Course must be exactly: PCM, PCMB, JEE, NEET or CET',
                                'If a student already exists (same Roll No), details will be updated',
                                'Leave Biology columns blank for PCM / JEE / CET students',
                                'If Total columns are blank, system assumes 100 marks each',
                                'Old manually entered results are not affected',
                            ].map((note, i) => (
                                <div key={i} className="bp-note-item"><div className="bp-note-dot" />{note}</div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div style={{ background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.15)', borderRadius: 14, padding: '20px', textAlign: 'center' }}>
                                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, color: '#4ade80' }}>{successCount}</div>
                                <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>Imported successfully</div>
                            </div>
                            <div style={{ background: errorCount > 0 ? 'rgba(239,68,68,.06)' : 'rgba(255,255,255,.02)', border: `1px solid ${errorCount > 0 ? 'rgba(239,68,68,.15)' : 'rgba(255,255,255,.05)'}`, borderRadius: 14, padding: '20px', textAlign: 'center' }}>
                                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, color: errorCount > 0 ? '#f87171' : '#1e293b' }}>{errorCount}</div>
                                <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>Rows skipped</div>
                            </div>
                        </div>

                        {results.length > 0 && (
                            <button className="bp-btn bp-btn-blue" onClick={downloadAllPDFs} disabled={dlAll} style={{ marginBottom: 14 }}>
                                {dlAll ? `⏳ Downloading ${dlProgress}…` : `⬇ Download All ${results.length} PDFs`}
                            </button>
                        )}

                        {results.length > 0 && (
                            <div className="bp-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700 }}>✓ Imported Results</div>
                                    <div style={{ fontSize: 11, color: '#334155', marginTop: 2 }}>All students and results saved to database</div>
                                </div>
                                <table className="bp-table">
                                    <thead className="bp-thead"><tr>
                                        <th>Student</th><th>Roll No</th><th>Course</th><th style={{ textAlign: 'center' }}>%</th><th style={{ textAlign: 'center' }}>Grade</th><th style={{ textAlign: 'center' }}>PDF</th>
                                    </tr></thead>
                                    <tbody className="bp-tbody">
                                        {results.map((r, i) => {
                                            const c = r.course || 'PCM';
                                            const cc = COURSE_COLORS[c] || '#94a3b8';
                                            const gc = GRADE_COLOR[r.grade] || '#f87171';
                                            const pctColor = r.pct >= 75 ? '#4ade80' : r.pct >= 50 ? '#facc15' : '#f87171';
                                            return (
                                                <tr key={i}>
                                                    <td style={{ fontWeight: 500, color: '#e2e8f0' }}>{r.name}</td>
                                                    <td style={{ color: '#334155', fontFamily: 'monospace', fontSize: 11 }}>{r.roll}</td>
                                                    <td><span style={{ background: `${cc}14`, color: cc, padding: '2px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 700 }}>{c}</span></td>
                                                    <td style={{ textAlign: 'center', fontWeight: 700, color: pctColor }}>{r.pct}%</td>
                                                    <td style={{ textAlign: 'center' }}><span style={{ background: `${gc}14`, color: gc, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>{r.grade}</span></td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button className="bp-btn" style={{ background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)', color: '#60a5fa', padding: '5px 12px', borderRadius: 8, fontSize: 11 }} onClick={() => downloadSinglePDF(r)}>⬇ PDF</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {errorLog.length > 0 && (
                            <div style={{ background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.12)', borderRadius: 14, padding: '16px', marginBottom: 14 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 8 }}>⚠ Skipped Rows</div>
                                {errorLog.map((e, i) => <div key={i} style={{ fontSize: 11, color: '#fca5a5', padding: '2px 0' }}>{e}</div>)}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="bp-btn-ghost" onClick={reset}>⬆ Import Another</button>
                            <Link href="/results" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: 12, background: '#f97316', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all .18s' }}>
                                View Results →
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}