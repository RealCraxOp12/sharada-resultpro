'use client';
import { useEffect, useState, useRef } from 'react';

interface Student {
    id: string;
    name: string;
    roll_no: string;
    batch: string;
    course?: { name: string };
}

const COURSE_COLORS: Record<string, string> = {
    PCM: '#3b82f6', PCMB: '#a855f7', JEE: '#f97316', NEET: '#22c55e', CET: '#eab308',
};

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [roll, setRoll] = useState('');
    const [batch, setBatch] = useState('2025-26');
    const [course, setCourse] = useState('PCM');
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deletingAll, setDeletingAll] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [search, setSearch] = useState('');
    const [visible, setVisible] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    async function fetchStudents() {
        setLoading(true);
        const res = await fetch('/api/students');
        const data = await res.json();
        setStudents(data.students || []);
        setLoading(false);
    }

    useEffect(() => { fetchStudents(); setTimeout(() => setVisible(true), 50); }, []);

    async function handleAdd() {
        if (!name || !roll) return alert('Name and Roll No required!');
        setAdding(true);
        const cr = await fetch('/api/courses').then(r => r.json());
        const found = cr.courses?.find((c: { name: string; id: string }) => c.name === course);
        await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, roll_no: roll, course_id: found?.id, batch }),
        });
        setName(''); setRoll(''); setAdding(false); setShowForm(false);
        fetchStudents();
    }

    async function handleDelete(id: string, sName: string) {
        if (!confirm(`Delete ${sName}?`)) return;
        setDeletingId(id);
        await fetch(`/api/students/${id}`, { method: 'DELETE' });
        setDeletingId(null);
        fetchStudents();
    }

    async function handleDeleteAll() {
        if (!students.length) return;
        if (!confirm(`Delete ALL ${students.length} students? Cannot be undone!`)) return;
        setDeletingAll(true);
        const res = await fetch('/api/students/all', { method: 'DELETE' });
        if (res.ok) setStudents([]);
        setDeletingAll(false);
    }

    async function handleTemplate() {
        const res = await fetch('/api/students/template');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'students_template.xlsx'; a.click();
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true); setUploadMsg(null);
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/students/bulk', { method: 'POST', body: fd });
        const data = await res.json();
        setUploadMsg(res.ok
            ? { ok: true, text: `Imported ${data.inserted} of ${data.total} students` }
            : { ok: false, text: data.error || 'Upload failed' }
        );
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
        if (res.ok) fetchStudents();
    }

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll_no.toLowerCase().includes(search.toLowerCase())
    );

    function initials(n: string) {
        return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

                .sp-root {
                    font-family: 'Inter', sans-serif; color: #f1f5f9;
                    opacity: 0; transform: translateY(16px);
                    transition: opacity 0.5s ease, transform 0.5s ease;
                }
                .sp-root.show { opacity: 1; transform: translateY(0); }

                .sp-header {
                    display: flex; align-items: flex-start;
                    justify-content: space-between; gap: 16px;
                    margin-bottom: 24px; flex-wrap: wrap;
                }
                .sp-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 24px; font-weight: 800;
                    letter-spacing: -0.03em; color: #f1f5f9;
                }
                .sp-sub { font-size: 12px; color: #334155; margin-top: 3px; }

                .sp-actions { display: flex; gap: 8px; flex-wrap: wrap; }

                .sp-btn {
                    padding: 9px 16px; border-radius: 10px;
                    font-size: 12.5px; font-weight: 600;
                    cursor: pointer; border: none;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.18s;
                    display: flex; align-items: center; gap: 6px;
                }
                .sp-btn-ghost {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.07);
                    color: #64748b;
                }
                .sp-btn-ghost:hover { background: rgba(255,255,255,0.07); color: #94a3b8; }
                .sp-btn-orange {
                    background: #f97316; color: white;
                    box-shadow: 0 2px 12px rgba(249,115,22,0.2);
                }
                .sp-btn-orange:hover { background: #ea580c; transform: translateY(-1px); }
                .sp-btn-red {
                    background: rgba(239,68,68,0.08);
                    border: 1px solid rgba(239,68,68,0.15);
                    color: #f87171;
                }
                .sp-btn-red:hover { background: rgba(239,68,68,0.14); }
                .sp-btn-green {
                    background: rgba(34,197,94,0.1);
                    border: 1px solid rgba(34,197,94,0.2);
                    color: #4ade80; cursor: pointer;
                }
                .sp-btn-green:hover { background: rgba(34,197,94,0.16); }

                /* Upload msg */
                .sp-msg {
                    padding: 10px 14px; border-radius: 10px;
                    font-size: 12.5px; font-weight: 500;
                    margin-bottom: 16px;
                    display: flex; align-items: center; justify-content: space-between;
                }
                .sp-msg-ok  { background: rgba(34,197,94,0.07);  border: 1px solid rgba(34,197,94,0.15);  color: #4ade80; }
                .sp-msg-err { background: rgba(239,68,68,0.07);  border: 1px solid rgba(239,68,68,0.15);  color: #f87171; }

                /* Search */
                .sp-search-wrap {
                    position: relative; margin-bottom: 16px; max-width: 340px;
                }
                .sp-search {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 10px;
                    padding: 10px 14px 10px 36px;
                    font-size: 13px; color: #e2e8f0;
                    font-family: 'Inter', sans-serif;
                    outline: none; transition: border-color 0.18s;
                }
                .sp-search:focus { border-color: rgba(249,115,22,0.3); }
                .sp-search::placeholder { color: #1e293b; }
                .sp-search-icon {
                    position: absolute; left: 12px; top: 50%;
                    transform: translateY(-50%);
                    font-size: 13px; color: #1e293b; pointer-events: none;
                }

                /* Add form */
                .sp-form {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px; padding: 22px 20px;
                    margin-bottom: 20px;
                    animation: formIn 0.3s ease;
                }
                @keyframes formIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .sp-form-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 14px; font-weight: 700;
                    color: #f1f5f9; margin-bottom: 16px;
                }
                .sp-form-grid {
                    display: grid; grid-template-columns: 1fr 1fr;
                    gap: 12px; margin-bottom: 16px;
                }
                @media (max-width: 600px) { .sp-form-grid { grid-template-columns: 1fr; } }

                .sp-field-label {
                    display: block; font-size: 10px; font-weight: 700;
                    color: #1e293b; margin-bottom: 5px;
                    text-transform: uppercase; letter-spacing: 0.1em;
                }
                .sp-field-inp, .sp-field-sel {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 10px; padding: 10px 13px;
                    font-size: 13px; color: #e2e8f0;
                    font-family: 'Inter', sans-serif; outline: none;
                    transition: border-color 0.18s;
                }
                .sp-field-inp:focus, .sp-field-sel:focus { border-color: rgba(249,115,22,0.35); }
                .sp-field-inp::placeholder { color: #1e293b; }

                /* Table */
                .sp-table-wrap {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px; overflow: hidden;
                }
                .sp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .sp-thead tr {
                    background: rgba(255,255,255,0.02);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .sp-thead th {
                    padding: 12px 16px; text-align: left;
                    font-size: 10px; font-weight: 700; color: #1e293b;
                    text-transform: uppercase; letter-spacing: 0.1em;
                }
                .sp-tbody tr {
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    transition: background 0.15s;
                }
                .sp-tbody tr:last-child { border-bottom: none; }
                .sp-tbody tr:hover { background: rgba(255,255,255,0.025); }
                .sp-tbody td { padding: 13px 16px; vertical-align: middle; }

                .sp-avatar {
                    width: 32px; height: 32px; border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 11px; font-weight: 700; flex-shrink: 0;
                }
                .sp-name-cell { display: flex; align-items: center; gap: 10px; }
                .sp-name { font-weight: 500; color: #e2e8f0; }
                .sp-roll { font-size: 11px; color: #334155; margin-top: 1px; font-family: monospace; }

                .sp-course-badge {
                    display: inline-block;
                    padding: 3px 10px; border-radius: 20px;
                    font-size: 10.5px; font-weight: 700;
                    letter-spacing: 0.04em;
                }

                .sp-empty {
                    text-align: center; padding: 48px 20px;
                    color: #1e293b; font-size: 13px;
                }
                .sp-empty-icon { font-size: 32px; margin-bottom: 10px; opacity: 0.3; }
            `}</style>

            <div className={`sp-root ${visible ? 'show' : ''}`}>

                <div className="sp-header">
                    <div>
                        <div className="sp-title">Students</div>
                        <div className="sp-sub">{students.length} enrolled · Batch 2025-26</div>
                    </div>
                    <div className="sp-actions">
                        <button className="sp-btn sp-btn-ghost" onClick={handleTemplate}>⬇ Template</button>
                        <label className="sp-btn sp-btn-green">
                            {uploading ? '⏳ Uploading…' : '⬆ Import Excel'}
                            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
                        </label>
                        <button className="sp-btn sp-btn-orange" onClick={() => setShowForm(f => !f)}>
                            {showForm ? '✕ Cancel' : '+ Add Student'}
                        </button>
                        {students.length > 0 && (
                            <button className="sp-btn sp-btn-red" onClick={handleDeleteAll} disabled={deletingAll}>
                                {deletingAll ? '⏳' : `🗑 All (${students.length})`}
                            </button>
                        )}
                    </div>
                </div>

                {uploadMsg && (
                    <div className={`sp-msg ${uploadMsg.ok ? 'sp-msg-ok' : 'sp-msg-err'}`}>
                        <span>{uploadMsg.ok ? '✓' : '✕'} {uploadMsg.text}</span>
                        <button onClick={() => setUploadMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.6 }}>✕</button>
                    </div>
                )}

                {showForm && (
                    <div className="sp-form">
                        <div className="sp-form-title">New Student</div>
                        <div className="sp-form-grid">
                            <div>
                                <label className="sp-field-label">Full Name</label>
                                <input className="sp-field-inp" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aryan Patil" />
                            </div>
                            <div>
                                <label className="sp-field-label">Roll Number</label>
                                <input className="sp-field-inp" value={roll} onChange={e => setRoll(e.target.value)} placeholder="e.g. 2025-PCM-01" />
                            </div>
                            <div>
                                <label className="sp-field-label">Course</label>
                                <select className="sp-field-sel" value={course} onChange={e => setCourse(e.target.value)}>
                                    {['PCM', 'PCMB', 'JEE', 'NEET', 'CET'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="sp-field-label">Batch</label>
                                <input className="sp-field-inp" value={batch} onChange={e => setBatch(e.target.value)} placeholder="2025-26" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="sp-btn sp-btn-orange" onClick={handleAdd} disabled={adding}>
                                {adding ? '⏳ Adding…' : 'Add Student'}
                            </button>
                            <button className="sp-btn sp-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                <div className="sp-search-wrap">
                    <span className="sp-search-icon">⊙</span>
                    <input className="sp-search" placeholder="Search name or roll number…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                <div className="sp-table-wrap">
                    {loading ? (
                        <div className="sp-empty"><div className="sp-empty-icon">◉</div>Loading students…</div>
                    ) : filtered.length === 0 ? (
                        <div className="sp-empty">
                            <div className="sp-empty-icon">◉</div>
                            {search ? 'No students match your search.' : 'No students yet. Add manually or import Excel!'}
                        </div>
                    ) : (
                        <table className="sp-table">
                            <thead className="sp-thead">
                                <tr>
                                    <th>#</th>
                                    <th>Student</th>
                                    <th>Course</th>
                                    <th>Batch</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody className="sp-tbody">
                                {filtered.map((s, i) => {
                                    const c = s.course?.name || 'PCM';
                                    const color = COURSE_COLORS[c] || '#94a3b8';
                                    return (
                                        <tr key={s.id}>
                                            <td style={{ color: '#1e293b', fontSize: 12 }}>{i + 1}</td>
                                            <td>
                                                <div className="sp-name-cell">
                                                    <div className="sp-avatar" style={{ background: `${color}18`, color }}>
                                                        {initials(s.name)}
                                                    </div>
                                                    <div>
                                                        <div className="sp-name">{s.name}</div>
                                                        <div className="sp-roll">{s.roll_no}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="sp-course-badge" style={{ background: `${color}14`, color }}>
                                                    {c}
                                                </span>
                                            </td>
                                            <td style={{ color: '#475569', fontSize: 12 }}>{s.batch}</td>
                                            <td>
                                                <button
                                                    className="sp-btn sp-btn-red"
                                                    style={{ padding: '6px 12px', fontSize: 11 }}
                                                    onClick={() => handleDelete(s.id, s.name)}
                                                    disabled={deletingId === s.id}
                                                >
                                                    {deletingId === s.id ? '⏳' : '🗑'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </>
    );
}