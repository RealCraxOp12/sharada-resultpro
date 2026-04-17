'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
    const [studentCount, setStudentCount] = useState(0);
    const [resultCount, setResultCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCounts() {
            const [s, r] = await Promise.all([
                fetch('/api/students').then(r => r.json()),
                fetch('/api/results').then(r => r.json()),
            ]);
            setStudentCount(s.students?.length || 0);
            setResultCount(r.results?.length || 0);
            setLoading(false);
        }
        fetchCounts();
    }, []);

    return (
        <div className="text-white">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">🏠 Dashboard</h1>
                <p className="text-gray-400 mt-1">Sharada Classes, Dapoli — Result Management System</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    <p className="text-gray-400 text-sm">Total Students</p>
                    <p className="text-4xl font-bold mt-2">{loading ? '...' : studentCount}</p>
                </div>
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    <p className="text-gray-400 text-sm">Results Generated</p>
                    <p className="text-4xl font-bold mt-2">{loading ? '...' : resultCount}</p>
                </div>
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    <p className="text-gray-400 text-sm">Courses</p>
                    <p className="text-4xl font-bold mt-2">5</p>
                </div>
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    <p className="text-gray-400 text-sm">Current Batch</p>
                    <p className="text-4xl font-bold mt-2">2025-26</p>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/students" className="bg-blue-600 hover:bg-blue-700 transition rounded-2xl p-6">
                    <p className="text-xl font-bold">👨‍🎓 Students</p>
                    <p className="text-blue-200 text-sm mt-1">Add or manage students</p>
                </Link>
                <Link href="/results/generate" className="bg-orange-500 hover:bg-orange-600 transition rounded-2xl p-6">
                    <p className="text-xl font-bold">📄 Generate Result</p>
                    <p className="text-orange-100 text-sm mt-1">Create a new report card</p>
                </Link>
                <Link href="/courses" className="bg-green-600 hover:bg-green-700 transition rounded-2xl p-6">
                    <p className="text-xl font-bold">📊 Courses</p>
                    <p className="text-green-100 text-sm mt-1">View course subjects</p>
                </Link>
                <Link href="/bulk-import" className="bg-purple-600 hover:bg-purple-700 transition rounded-2xl p-6">
                    <p className="text-xl font-bold">📥 Bulk Import</p>
                    <p className="text-purple-100 text-sm mt-1">Upload Excel with marks</p>
                </Link>
            </div>

        </div>
    );
}