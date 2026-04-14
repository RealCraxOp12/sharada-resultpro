import * as XLSX from 'xlsx';

export interface BulkStudentRow {
    name: string;
    roll: string;
    course: string;
    batch: string;
    parent?: string;
    phone?: string;
}

export function parseStudentExcel(buffer: ArrayBuffer): BulkStudentRow[] {
    const wb = XLSX.read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];

    return rows
        .filter(row => row['Student Name'] || row['name'])
        .map(row => ({
            name: String(row['Student Name'] || row['name'] || ''),
            roll: String(row['Roll No'] || row['roll_no'] || row['roll'] || ''),
            course: String(row['Course'] || row['course'] || 'PCM'),
            batch: String(row['Batch'] || row['batch'] || '2024-25'),
            parent: String(row['Parent Name'] || row['parent'] || ''),
            phone: String(row['Phone'] || row['phone'] || ''),
        }));
}

export function generateStudentExcelTemplate(): Uint8Array {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
        ['Student Name', 'Roll No', 'Course', 'Batch', 'Parent Name', 'Phone'],
        ['Aryan Patil', '2024-PCM-01', 'PCM', '2024-25', 'Rajesh Patil', '9876543210'],
        ['Priya Sharma', '2024-NEET-01', 'NEET', '2024-25', 'Sunita Sharma', '9876543211'],
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}