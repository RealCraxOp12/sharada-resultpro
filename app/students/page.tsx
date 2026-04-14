'use client';

import { useEffect, useState, useRef } from 'react';

interface Student {
    id: string;
    name: string;
    roll_no: string;
    batch: string;
    course?: { name: string };
}

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
    const [uploadResult, setUploadResult] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function fetchStudents() {
        setLoading(true);
        const res = await fetch('/api/students');
        const data = await res.json();
        setStudents(data.students || []);
        setLoading(false);
    }

    useEffect(() => { fetchStudents(); }, []);

    async function handleAdd() {
        if (!name || !roll) return alert('Name and Roll No are required!');
        setAdding(true);
        const courseRes = await fetch('/api/courses');
        const courseData = await courseRes.json();
        const found = courseData.courses?.find((c: { name: string; id: string }) => c.name === course);
        await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, roll_no: roll, course_id: found?.id, batch }),
        });
        setName(''); setRoll('');
        setAdding(false); setShowForm(false);
        fetchStudents();
    }

    async function handleDelete(id: string, studentName: string) {
        if (!confirm(`Are you sure you want to delete ${studentName}?`)) return;
        setDeletingId(id);
        await fetch(`/api/students/${id}`, { method: 'DELETE' });
        setDeletingId(null);
        fetchStudents();
    }

    async function handleDeleteAll() {
        if (students.length === 0) return alert('No students to delete!');
        if (!confirm(`⚠️ Delete ALL ${students.length} students permanently? This cannot be undone!`)) return;
        setDeletingAll(true);
        const res = await fetch('/api/students/all', { method: 'DELETE' });
        if (res.ok) setStudents([]);
        else alert('Failed to delete all students!');
        setDeletingAll(false);
    }

    async function handleDownloadTemplate() {
        const res = await fetch('/api/students/template');
        if (!res.ok) return alert('Failed to download template!');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students_template.xlsx';
        a.click();
    }

    async function handleUploadExcel(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadResult(null);
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/students/bulk', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok) {
            setUploadResult(`✅ Successfully imported ${data.inserted} of ${data.total} students!`);
            fetchStudents();
        } else {
            setUploadResult(`❌ Upload failed: ${data.error}`);
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    return (
        <div className="text-white">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">👨‍🎓 Students</h1>
                    <p className="text-gray-400 mt-1">Manage all enrolled students</p>
                </div>
                <div className="flex gap-3 flex-wrap justify-end">
                    <button
                        onClick={handleDownloadTemplate}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
                    >
                        📥 Download Template
                    </button>
                    <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer">
                        {uploading ? '⏳ Uploading...' : '📤 Import Excel'}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            className="hidden"
                            onChange={handleUploadExcel}
                            disabled={uploading}
                        />
                    </label>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
                    >
                        + Add Student
                    </button>
                    {students.length > 0 && (
                        <button
                            onClick={handleDeleteAll}
                            disabled={deletingAll}
                            className="bg-red-500/20 hover:bg-red-500/40 disabled:opacity-50 text-red-400 border border-red-500/30 px-4 py-2.5 rounded-xl text-sm font-medium transition"
                        >
                            {deletingAll ? '⏳ Deleting...' : `🗑 Delete All (${students.length})`}
                        </button>
                    )}
                </div>
            </div>

            {/* Upload Result Banner */}
            {uploadResult && (
                <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${uploadResult.startsWith('✅')
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                    {uploadResult}
                    <button onClick={() => setUploadResult(null)} className="ml-3 opacity-60 hover:opacity-100">✕</button>
                </div>
            )}

            {/* Bulk Import Info */}
            <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
                <strong className="text-blue-200">📋 Bulk Import Guide:</strong> Download the Excel template → Fill in student data → Upload the file.
                Supported columns: <strong>Student Name, Roll No, Course, Batch, Parent Name, Phone</strong>.
                Valid courses: PCM, PCMB, JEE, NEET, CET.
            </div>

            {/* Add Student Form */}
            {showForm && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-bold mb-4">New Student</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Student Name</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Aryan Patil"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Roll Number</label>
                            <input
                                value={roll}
                                onChange={e => setRoll(e.target.value)}
                                placeholder="e.g. 2025-PCM-01"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Course</label>
                            <select
                                value={course}
                                onChange={e => setCourse(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                            >
                                {['PCM', 'PCMB', 'JEE', 'NEET', 'CET'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Batch</label>
                            <input
                                value={batch}
                                onChange={e => setBatch(e.target.value)}
                                placeholder="e.g. 2025-26"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                        <button
                            onClick={handleAdd}
                            disabled={adding}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition"
                        >
                            {adding ? 'Adding...' : 'Add Student'}
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl font-medium transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Students Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading students...</div>
                ) : students.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No students yet. Add manually or import via Excel!</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400 text-left">
                                <th className="px-6 py-4 font-medium">#</th>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Roll No</th>
                                <th className="px-6 py-4 font-medium">Course</th>
                                <th className="px-6 py-4 font-medium">Batch</th>
                                <th className="px-6 py-4 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s, i) => (
                                <tr
                                    key={s.id}
                                    className={`border-b border-gray-800 hover:bg-gray-800 transition ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'}`}
                                >
                                    <td className="px-6 py-4 text-gray-500">{i + 1}</td>
                                    <td className="px-6 py-4 font-medium">{s.name}</td>
                                    <td className="px-6 py-4 text-gray-400">{s.roll_no}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-medium">
                                            {s.course?.name || '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{s.batch}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDelete(s.id, s.name)}
                                            disabled={deletingId === s.id}
                                            className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
                                        >
                                            {deletingId === s.id ? 'Deleting...' : '🗑 Delete'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    );
}