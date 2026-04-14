import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
    const wb = XLSX.utils.book_new();

    const ws = XLSX.utils.aoa_to_sheet([
        ['Student Name', 'Roll No', 'Course', 'Batch', 'Parent Name', 'Phone'],
        ['Aryan Patil', '2025-PCM-01', 'PCM', '2025-26', 'Rajesh Patil', '9876543210'],
        ['Priya Sharma', '2025-NEET-01', 'NEET', '2025-26', 'Sunita Sharma', '9876543211'],
        ['Rahul Desai', '2025-JEE-01', 'JEE', '2025-26', 'Anil Desai', '9876543212'],
    ]);

    // Set column widths
    ws['!cols'] = [
        { wch: 20 }, { wch: 16 }, { wch: 8 },
        { wch: 10 }, { wch: 20 }, { wch: 14 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="students_template.xlsx"',
        },
    });
}