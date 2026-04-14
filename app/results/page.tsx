'use client';

import { useEffect, useState } from 'react';

interface Result {
    id: string;
    exam_name: string;
    overall_pct: number;
    final_grade: string;
    total_obtained: number;
    total_max: number;
    created_at: string;
    student?: {
        name: string;
        roll_no: string;
        course?: { name: string };
    };
}

export default function ResultsPage() {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchResults() {
        setLoading(true);
        const res = await fetch('/api/results');
        const data = await res.json();
        setResults(data.results || []);
        setLoading(false);
    }

    useEffect(() => { fetchResults(); }, []);

    const gradeColor: Record<string, string> = {
        A: 'bg-green-500/20 text-green-400',
        B: 'bg-blue-500/20 text-blue-400',
        C: 'bg-yellow-500/20 text-yellow-400',
        D: 'bg-red-500/20 text-red-400',
    };

    return (
        <div className="text-white">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">📄 Results</h1>
                    <p className="text-gray-400 mt-1">All generated report cards</p>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading results...</div>
                ) : results.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No results yet. Generate your first report card!</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400 text-left">
                                <th className="px-6 py-4 font-medium">Student</th>
                                <th className="px-6 py-4 font-medium">Roll No</th>
                                <th className="px-6 py-4 font-medium">Course</th>
                                <th className="px-6 py-4 font-medium">Exam</th>
                                <th className="px-6 py-4 font-medium">Marks</th>
                                <th className="px-6 py-4 font-medium">Percentage</th>
                                <th className="px-6 py-4 font-medium">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r, i) => (
                                <tr
                                    key={r.id}
                                    className={`border-b border-gray-800 hover:bg-gray-800 transition ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'}`}
                                >
                                    <td className="px-6 py-4 font-medium">{r.student?.name || '—'}</td>
                                    <td className="px-6 py-4 text-gray-400">{r.student?.roll_no || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-medium">
                                            {r.student?.course?.name || '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{r.exam_name}</td>
                                    <td className="px-6 py-4 text-gray-400">{r.total_obtained}/{r.total_max}</td>
                                    <td className="px-6 py-4 font-medium">{r.overall_pct}%</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${gradeColor[r.final_grade]}`}>
                                            {r.final_grade}
                                        </span>
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