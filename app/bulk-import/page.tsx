'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ImportedResult {
    name: string;
    roll: string;
    pct: number;
    grade: string;
}

export default function BulkImportPage() {
    const [examName, setExamName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [done, setDone] = useState(false);
    const [results, setResults] = useState<ImportedResult[]>([]);
    const [errorLog, setErrorLog] = useState<string[]>([]);
    const [successCount, setSuccessCount] = useState(0);
    const [errorCount, setErrorCount] = useState(0);

    const gradeColor: Record<string, string> = {
        A: 'text-green-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-red-400',
    };

    async function downloadTemplate() {
        const res = await fetch('/api/bulk-import/template');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Sharada_Marks_Import_Template.xlsx';
        a.click();
        URL.revokeObjectURL(url);
    }

    async function handleUpload() {
        if (!file) return alert('Please select an Excel file!');
        if (!examName) return alert('Please enter exam name!');

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('exam_name', examName);

        const res = await fetch('/api/bulk-import/upload', { method: 'POST', body: formData });
        const data = await res.json();

        setUploading(false);

        if (!res.ok) return alert(data.error || 'Upload failed');

        setSuccessCount(data.success);
        setErrorCount(data.errors);
        setResults(data.results || []);
        setErrorLog(data.errorLog || []);
        setDone(true);
    }

    function reset() {
        setFile(null);
        setExamName('');
        setDone(false);
        setResults([]);
        setErrorLog([]);
        setSuccessCount(0);
        setErrorCount(0);
    }

    return (
        <div className="text-white max-w-4xl">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">📊 Bulk Import Marks</h1>
                <p className="text-gray-400 mt-1">
                    Upload an Excel sheet with student details and marks — system auto-creates students and results.
                </p>
            </div>

            {!done ? (
                <div className="space-y-6">

                    {/* Step 1 — Download Template */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Step 1</span>
                                    <h2 className="font-bold text-lg">Download Template</h2>
                                </div>
                                <p className="text-gray-400 text-sm mb-1">
                                    Download the Excel template, fill in student details and marks, then upload below.
                                </p>
                                <p className="text-gray-500 text-xs">
                                    Columns: Student Name · Roll No · Course · Batch · Parent Name · Phone ·
                                    Physics · Physics_Total · Chemistry · Chemistry_Total ·
                                    Mathematics · Mathematics_Total · Biology · Biology_Total
                                </p>
                                <p className="text-green-400 text-xs mt-2">
                                    ✓ Biology is optional — leave blank if not applicable
                                </p>
                            </div>
                            <button
                                onClick={downloadTemplate}
                                className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition"
                            >
                                ⬇ Download Template
                            </button>
                        </div>
                    </div>

                    {/* Step 2 — Exam Name */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Step 2</span>
                            <h2 className="font-bold text-lg">Enter Exam Name</h2>
                        </div>
                        <input
                            value={examName}
                            onChange={e => setExamName(e.target.value)}
                            placeholder="e.g. Unit Test 1, Mid Term, Final Exam..."
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 max-w-md"
                        />
                    </div>

                    {/* Step 3 — Upload */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Step 3</span>
                            <h2 className="font-bold text-lg">Upload Filled Excel</h2>
                        </div>

                        <div
                            className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500 transition"
                            onClick={() => document.getElementById('fileInput')?.click()}
                        >
                            <div className="text-4xl mb-3">📂</div>
                            <p className="text-gray-300 font-medium">
                                {file ? file.name : 'Click to select Excel file'}
                            </p>
                            <p className="text-gray-500 text-sm mt-1">.xlsx or .xls files only</p>
                            <input
                                id="fileInput"
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={e => setFile(e.target.files?.[0] || null)}
                            />
                        </div>

                        {file && (
                            <div className="mt-3 flex items-center gap-3">
                                <span className="text-green-400 text-sm">✓ {file.name} selected</span>
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-gray-500 hover:text-red-400 text-xs transition"
                                >
                                    ✕ Remove
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={uploading || !file || !examName}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition"
                    >
                        {uploading ? '⏳ Processing... please wait' : '🚀 Import Students & Marks'}
                    </button>

                    {/* Notes */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <h3 className="font-bold text-sm text-gray-300 mb-3">📋 Important Notes</h3>
                        <ul className="space-y-1.5 text-sm text-gray-400">
                            <li>• Course must be exactly: <strong className="text-white">PCM, PCMB, JEE, NEET or CET</strong></li>
                            <li>• If a student already exists (same Roll No), their details will be updated</li>
                            <li>• Leave Biology columns blank for PCM / JEE / CET students</li>
                            <li>• If Total columns are blank, system assumes 100 marks each</li>
                            <li>• Old manually entered results are <strong className="text-white">not affected</strong></li>
                        </ul>
                    </div>

                </div>
            ) : (
                /* Results Screen */
                <div className="space-y-6">

                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6 text-center">
                            <div className="text-4xl font-bold text-green-400">{successCount}</div>
                            <div className="text-green-300 mt-1">Students imported successfully</div>
                        </div>
                        <div className={`${errorCount > 0 ? 'bg-red-500/20 border-red-500/30' : 'bg-gray-900 border-gray-800'} border rounded-2xl p-6 text-center`}>
                            <div className={`text-4xl font-bold ${errorCount > 0 ? 'text-red-400' : 'text-gray-400'}`}>{errorCount}</div>
                            <div className={`mt-1 ${errorCount > 0 ? 'text-red-300' : 'text-gray-400'}`}>Rows skipped</div>
                        </div>
                    </div>

                    {/* Imported Results Table */}
                    {results.length > 0 && (
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-gray-800">
                                <h2 className="font-bold">✅ Imported Results</h2>
                                <p className="text-gray-400 text-sm mt-0.5">All students and results saved to database</p>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Student</th>
                                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Roll No</th>
                                        <th className="text-center px-4 py-3 text-gray-400 font-medium">Percentage</th>
                                        <th className="text-center px-4 py-3 text-gray-400 font-medium">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((r, i) => (
                                        <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                            <td className="px-4 py-3 font-medium">{r.name}</td>
                                            <td className="px-4 py-3 text-gray-400">{r.roll}</td>
                                            <td className={`px-4 py-3 text-center font-bold ${gradeColor[r.grade]}`}>{r.pct}%</td>
                                            <td className={`px-4 py-3 text-center font-bold ${gradeColor[r.grade]}`}>{r.grade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Error Log */}
                    {errorLog.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
                            <h3 className="font-bold text-red-400 mb-3">⚠ Skipped Rows</h3>
                            <ul className="space-y-1">
                                {errorLog.map((e, i) => (
                                    <li key={i} className="text-red-300 text-sm">{e}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={reset}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-2xl font-bold transition"
                        >
                            ⬆ Import Another Sheet
                        </button>
                        <Link
                            href="/results"
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-2xl font-bold transition text-center"
                        >
                            📄 View All Results →
                        </Link>
                    </div>

                </div>
            )}
        </div>
    );
}