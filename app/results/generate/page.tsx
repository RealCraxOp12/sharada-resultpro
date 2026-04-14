'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Student {
    id: string;
    name: string;
    roll_no: string;
    course?: { name: string };
}

interface SubjectMark {
    subject: string;
    obtained: number;
    total: number;
    pct: number;
    grade: string;
}

interface StudentEntry {
    student: Student;
    marks: SubjectMark[];
    bioObtained: string;
    bioTotal: string;
    savedMarks: SubjectMark[] | null;
    saved: boolean;
    saving: boolean;
}

const COURSE_SUBJECTS: Record<string, string[]> = {
    PCM: ['Physics', 'Chemistry', 'Mathematics'],
    PCMB: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    JEE: ['Physics', 'Chemistry', 'Mathematics'],
    NEET: ['Physics', 'Chemistry', 'Biology'],
    CET: ['Physics', 'Chemistry', 'Mathematics'],
};

function getGrade(pct: number) {
    if (pct >= 90) return 'A';
    if (pct >= 75) return 'B';
    if (pct >= 50) return 'C';
    return 'D';
}

function buildMarks(courseName: string): SubjectMark[] {
    const subs = COURSE_SUBJECTS[courseName] || ['Physics', 'Chemistry', 'Mathematics'];
    return subs.map(sub => ({ subject: sub, obtained: 0, total: 100, pct: 0, grade: 'D' }));
}

// ── KEY FIX: only require bioObtained, default total to 100 if blank ──
function calcFinalMarks(entry: StudentEntry): SubjectMark[] {
    const courseName = entry.student.course?.name || 'PCM';
    const courseHasBio = (COURSE_SUBJECTS[courseName] || []).includes('Biology');
    const final = [...entry.marks];
    if (!courseHasBio && entry.bioObtained !== '') {
        const obtained = Number(entry.bioObtained);
        const total = Number(entry.bioTotal) || 100;
        const pct = total > 0 ? Math.round((obtained / total) * 100) : 0;
        final.push({ subject: 'Biology', obtained, total, pct, grade: getGrade(pct) });
    }
    return final;
}

function calcSummary(marks: SubjectMark[]) {
    const totalObtained = marks.reduce((s, m) => s + m.obtained, 0);
    const totalMax = marks.reduce((s, m) => s + m.total, 0);
    const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    const finalGrade = getGrade(overallPct);
    const bestSubject = [...marks].sort((a, b) => b.pct - a.pct)[0];
    const weakSubject = [...marks].sort((a, b) => a.pct - b.pct)[0];
    return { totalObtained, totalMax, overallPct, finalGrade, bestSubject, weakSubject };
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
    const [downloadingAll, setDownloadingAll] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState('');

    const gradeColor: Record<string, string> = {
        A: 'text-green-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-red-400',
    };

    useEffect(() => {
        fetch('/api/students').then(r => r.json()).then(d => setAllStudents(d.students || []));
    }, []);

    const filteredStudents = allStudents.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.roll_no.toLowerCase().includes(search.toLowerCase());
        const matchCourse = filterCourse === 'All' || s.course?.name === filterCourse;
        return matchSearch && matchCourse;
    });

    const selectedIds = new Set(entries.map(e => e.student.id));

    function toggleStudent(student: Student) {
        if (selectedIds.has(student.id)) {
            setEntries(prev => prev.filter(e => e.student.id !== student.id));
            if (expandedId === student.id) setExpandedId(null);
        } else {
            const courseName = student.course?.name || 'PCM';
            const newEntry: StudentEntry = {
                student,
                marks: buildMarks(courseName),
                bioObtained: '',
                bioTotal: '',
                savedMarks: null,
                saved: false,
                saving: false,
            };
            setEntries(prev => [...prev, newEntry]);
            setExpandedId(student.id);
        }
    }

    function selectAll() {
        filteredStudents.forEach(s => {
            if (!selectedIds.has(s.id)) toggleStudent(s);
        });
    }

    function clearAll() {
        setEntries([]);
        setExpandedId(null);
    }

    function updateMark(studentId: string, index: number, val: string) {
        const obtained = val === '' ? 0 : Number(val);
        setEntries(prev => prev.map(e => {
            if (e.student.id !== studentId) return e;
            const marks = [...e.marks];
            const pct = marks[index].total > 0 ? Math.round((obtained / marks[index].total) * 100) : 0;
            marks[index] = { ...marks[index], obtained, pct, grade: getGrade(pct) };
            return { ...e, marks, saved: false };
        }));
    }

    function updateTotal(studentId: string, index: number, val: string) {
        const total = val === '' ? 100 : Number(val);
        setEntries(prev => prev.map(e => {
            if (e.student.id !== studentId) return e;
            const marks = [...e.marks];
            const pct = total > 0 ? Math.round((marks[index].obtained / total) * 100) : 0;
            marks[index] = { ...marks[index], total, pct, grade: getGrade(pct) };
            return { ...e, marks, saved: false };
        }));
    }

    function updateBio(studentId: string, field: 'bioObtained' | 'bioTotal', val: string) {
        setEntries(prev => prev.map(e =>
            e.student.id === studentId ? { ...e, [field]: val, saved: false } : e
        ));
    }

    async function saveEntry(studentId: string) {
        if (!examName) return alert('Please enter exam name first!');
        setEntries(prev => prev.map(e =>
            e.student.id === studentId ? { ...e, saving: true } : e
        ));
        const entry = entries.find(e => e.student.id === studentId)!;
        const finalMarks = calcFinalMarks(entry);
        const res = await fetch('/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: studentId, exam_name: examName, marks_data: finalMarks }),
        });
        if (res.ok) {
            setEntries(prev => prev.map(e =>
                e.student.id === studentId
                    ? { ...e, saved: true, saving: false, savedMarks: finalMarks }
                    : e
            ));
            setSavedCount(prev => prev + 1);
        } else {
            alert('Failed to save result for ' + entry.student.name);
            setEntries(prev => prev.map(e =>
                e.student.id === studentId ? { ...e, saving: false } : e
            ));
        }
    }

    async function saveAll() {
        if (!examName) return alert('Please enter exam name first!');
        if (entries.length === 0) return alert('Please select at least one student!');
        setBulkSaving(true);
        for (const entry of entries) {
            if (!entry.saved) await saveEntry(entry.student.id);
        }
        setBulkSaving(false);
        setAllDone(true);
    }

    async function downloadPDF(studentId: string) {
        if (!examName) return alert('Please enter exam name first!');
        const entry = entries.find(e => e.student.id === studentId)!;

        // Use savedMarks — these were frozen at save time with bio included
        const finalMarks = entry.savedMarks ?? calcFinalMarks(entry);
        const summary = calcSummary(finalMarks);

        const instituteRes = await fetch('/api/settings');
        const instituteData = await instituteRes.json();

        const res = await fetch('/api/pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student: {
                    name: entry.student.name,
                    roll: entry.student.roll_no,
                    course: entry.student.course?.name || '',
                    batch: '2025-26',
                },
                institute: instituteData.institute,
                exam: examName,
                marks: finalMarks,
                summary,
            }),
        });

        if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${entry.student.name}_${entry.student.course?.name || 'Result'}_Result.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            alert('PDF generation failed!');
        }
    }

    async function downloadAllPDFs() {
        const savedEntries = entries.filter(e => e.saved);
        if (savedEntries.length === 0) return alert('No saved results to download!');
        setDownloadingAll(true);
        for (let i = 0; i < savedEntries.length; i++) {
            setDownloadProgress(`${i + 1} of ${savedEntries.length}`);
            await downloadPDF(savedEntries[i].student.id);
            await new Promise(r => setTimeout(r, 800));
        }
        setDownloadProgress('');
        setDownloadingAll(false);
    }

    return (
        <div className="text-white max-w-5xl">

            <div className="mb-6">
                <h1 className="text-3xl font-bold">✏️ Generate Results</h1>
                <p className="text-gray-400 mt-1">Select students, enter marks, save & download PDFs</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
                <label className="text-sm text-gray-400 mb-1 block">Exam Name <span className="text-red-400">*</span></label>
                <input
                    value={examName}
                    onChange={e => setExamName(e.target.value)}
                    placeholder="e.g. Unit Test 1, Mid Term, Final Exam..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 max-w-md"
                />
            </div>

            <div className="grid grid-cols-5 gap-6">

                {/* LEFT — Student Picker */}
                <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-4">
                    <h2 className="font-bold mb-3 text-sm text-gray-300 uppercase tracking-wider">Select Students</h2>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name or roll..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 mb-2"
                    />
                    <select
                        value={filterCourse}
                        onChange={e => setFilterCourse(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 mb-3"
                    >
                        <option value="All">All Courses</option>
                        {['PCM', 'PCMB', 'JEE', 'NEET', 'CET'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                        {filteredStudents.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">No students found</p>
                        ) : filteredStudents.map(s => {
                            const selected = selectedIds.has(s.id);
                            const entry = entries.find(e => e.student.id === s.id);
                            return (
                                <div
                                    key={s.id}
                                    onClick={() => toggleStudent(s)}
                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition text-sm ${selected
                                        ? 'bg-orange-500/20 border border-orange-500/40'
                                        : 'bg-gray-800 hover:bg-gray-700 border border-transparent'
                                        }`}
                                >
                                    <div>
                                        <div className="font-medium">{s.name}</div>
                                        <div className="text-gray-400 text-xs">{s.roll_no} · {s.course?.name}</div>
                                    </div>
                                    {entry?.saved && <span className="text-green-400 text-xs">✅</span>}
                                    {!entry?.saved && selected && <span className="text-orange-400 text-xs">✎</span>}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                        <span className="text-xs text-gray-500">{entries.length} selected · {savedCount} saved</span>
                        <div className="flex gap-2">
                            <button onClick={selectAll} className="text-xs bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 px-3 py-1.5 rounded-lg transition font-medium">✅ Select All</button>
                            <button onClick={clearAll} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition font-medium">✕ Clear</button>
                        </div>
                    </div>
                </div>

                {/* RIGHT — Marks Entry */}
                <div className="col-span-3 space-y-4">
                    {entries.length === 0 ? (
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-500">
                            <div className="text-4xl mb-3">👈</div>
                            <p>Select students from the left to enter marks</p>
                        </div>
                    ) : entries.map(entry => {
                        const courseName = entry.student.course?.name || 'PCM';
                        const courseHasBio = (COURSE_SUBJECTS[courseName] || []).includes('Biology');
                        const finalMarks = entry.savedMarks ?? calcFinalMarks(entry);
                        const { totalObtained, totalMax, overallPct, finalGrade } = calcSummary(finalMarks);
                        const isExpanded = expandedId === entry.student.id;

                        return (
                            <div key={entry.student.id} className={`bg-gray-900 border rounded-2xl overflow-hidden transition ${entry.saved ? 'border-green-500/40' : 'border-gray-800'}`}>

                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition"
                                    onClick={() => setExpandedId(isExpanded ? null : entry.student.id)}
                                >
                                    <div>
                                        <div className="font-semibold">{entry.student.name}</div>
                                        <div className="text-xs text-gray-400">{entry.student.roll_no} · {courseName}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {entry.saved
                                            ? <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-medium border border-green-500/30">✅ Saved</span>
                                            : <span className={`text-sm font-bold ${gradeColor[finalGrade]}`}>{overallPct}% · {finalGrade}</span>
                                        }
                                        <span className="text-gray-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-4 pb-4">
                                        <div className="grid grid-cols-4 gap-2 mb-2 text-xs text-gray-500 px-1">
                                            <div>Subject</div><div>Obtained</div><div>Out Of</div><div>Result</div>
                                        </div>

                                        <div className="space-y-2">
                                            {entry.marks.map((m, i) => (
                                                <div key={m.subject} className="grid grid-cols-4 gap-2 items-center">
                                                    <div className="text-sm font-medium">{m.subject}</div>
                                                    <input
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={m.obtained === 0 ? '' : String(m.obtained)}
                                                        onChange={e => updateMark(entry.student.id, i, e.target.value)}
                                                        onWheel={e => (e.target as HTMLInputElement).blur()}
                                                        placeholder="Marks"
                                                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500"
                                                    />
                                                    <input
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={m.total === 100 ? '' : String(m.total)}
                                                        onChange={e => updateTotal(entry.student.id, i, e.target.value)}
                                                        onWheel={e => (e.target as HTMLInputElement).blur()}
                                                        placeholder="100"
                                                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500"
                                                    />
                                                    <div className={`text-sm font-bold ${gradeColor[m.grade]}`}>{m.pct}% ({m.grade})</div>
                                                </div>
                                            ))}

                                            {/* Optional Biology — shown only for non-bio courses */}
                                            {!courseHasBio && (
                                                <div className="grid grid-cols-4 gap-2 items-center border-t border-gray-700 pt-2 mt-1">
                                                    <div className="text-sm text-gray-400">🌿 Biology <span className="text-xs text-gray-600">(opt)</span></div>
                                                    <input
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={entry.bioObtained}
                                                        onChange={e => updateBio(entry.student.id, 'bioObtained', e.target.value)}
                                                        onWheel={e => (e.target as HTMLInputElement).blur()}
                                                        placeholder="Marks"
                                                        className="bg-gray-800 border border-dashed border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-green-500"
                                                    />
                                                    <input
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={entry.bioTotal}
                                                        onChange={e => updateBio(entry.student.id, 'bioTotal', e.target.value)}
                                                        onWheel={e => (e.target as HTMLInputElement).blur()}
                                                        placeholder="100 (default)"
                                                        className="bg-gray-800 border border-dashed border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-green-500"
                                                    />
                                                    <div className="text-xs text-gray-500">
                                                        {entry.bioObtained !== ''
                                                            ? (() => {
                                                                const p = Math.round((Number(entry.bioObtained) / (Number(entry.bioTotal) || 100)) * 100);
                                                                return <span className={gradeColor[getGrade(p)]}>{p}% ({getGrade(p)})</span>;
                                                            })()
                                                            : 'leave empty to skip'
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex gap-4 text-sm">
                                                <span className="text-gray-400">Total: <strong className="text-white">{totalObtained}/{totalMax}</strong></span>
                                                <span className="text-gray-400">Pct: <strong className="text-white">{overallPct}%</strong></span>
                                                <span className="text-gray-400">Grade: <strong className={gradeColor[finalGrade]}>{finalGrade}</strong></span>
                                            </div>
                                            <div className="flex gap-2">
                                                {!entry.saved ? (
                                                    <button
                                                        onClick={() => saveEntry(entry.student.id)}
                                                        disabled={entry.saving}
                                                        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
                                                    >
                                                        {entry.saving ? 'Saving...' : '💾 Save'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => downloadPDF(entry.student.id)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
                                                    >
                                                        📥 PDF
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
                        <div className="flex gap-3">
                            <button
                                onClick={saveAll}
                                disabled={bulkSaving}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-2xl font-bold transition text-sm"
                            >
                                {bulkSaving ? '⏳ Saving all results...' : `💾 Save All ${entries.length} Results`}
                            </button>
                            {entries.some(e => e.saved) && (
                                <button
                                    onClick={downloadAllPDFs}
                                    disabled={downloadingAll}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-2xl font-bold transition text-sm"
                                >
                                    {downloadingAll ? `⏳ Downloading ${downloadProgress}...` : `📥 Download All Saved (${entries.filter(e => e.saved).length})`}
                                </button>
                            )}
                        </div>
                    )}

                    {allDone && (
                        <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-5 text-center">
                            <div className="text-3xl mb-2">🎉</div>
                            <div className="text-green-400 font-bold text-lg">All {savedCount} results saved!</div>
                            <p className="text-gray-400 text-sm mt-2 mb-4">Download all PDFs or go to results tab</p>
                            <div className="flex justify-center gap-3 flex-wrap">
                                <button
                                    onClick={downloadAllPDFs}
                                    disabled={downloadingAll}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition"
                                >
                                    {downloadingAll ? `⏳ Downloading ${downloadProgress}...` : `📥 Download All ${savedCount} PDFs`}
                                </button>
                                <Link href="/results" className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">
                                    View Results Tab →
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}