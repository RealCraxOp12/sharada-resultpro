import * as XLSX from 'xlsx';

export interface BulkStudentRow {
    name: string;
    roll: string;
    course: string;
    batch: string;
    parent?: string;
    phone?: string;
}

export interface BulkStudentRowWithMarks extends BulkStudentRow {
    physics?: number;
    chemistry?: number;
    mathematics?: number;
    biology?: number;
    physicsTotal?: number;
    chemistryTotal?: number;
    mathematicsTotal?: number;
    biologyTotal?: number;
}

// ── existing function — untouched ──────────────────────────
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

// ── new function — parses marks too ───────────────────────
export function parseStudentExcelWithMarks(buffer: ArrayBuffer): BulkStudentRowWithMarks[] {
    const wb = XLSX.read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];

    return rows
        .filter(row => row['Student Name'] || row['name'])
        .map(row => {
            const n = (key: string) => {
                const v = row[key];
                if (v === undefined || v === null || v === '') return undefined;
                const num = Number(v);
                return isNaN(num) ? undefined : num;
            };
            return {
                name: String(row['Student Name'] || row['name'] || ''),
                roll: String(row['Roll No'] || row['roll_no'] || ''),
                course: String(row['Course'] || 'PCM'),
                batch: String(row['Batch'] || '2024-25'),
                parent: String(row['Parent Name'] || ''),
                phone: String(row['Phone'] || ''),
                physics: n('Physics'),
                chemistry: n('Chemistry'),
                mathematics: n('Mathematics'),
                biology: n('Biology'),
                physicsTotal: n('Physics_Total') ?? 100,
                chemistryTotal: n('Chemistry_Total') ?? 100,
                mathematicsTotal: n('Mathematics_Total') ?? 100,
                biologyTotal: n('Biology_Total') ?? 100,
            };
        });
}

// ── new function — generate template with marks columns ───
export function generateMarksExcelTemplate(): Uint8Array {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
        [
            'Student Name', 'Roll No', 'Course', 'Batch', 'Parent Name', 'Phone',
            'Physics', 'Physics_Total',
            'Chemistry', 'Chemistry_Total',
            'Mathematics', 'Mathematics_Total',
            'Biology', 'Biology_Total',
        ],
        [
            'Aryan Patil', '2024-PCM-01', 'PCM', '2024-25', 'Rajesh Patil', '9876543210',
            85, 100, 72, 100, 90, 100, '', '',
        ],
        [
            'Priya Sharma', '2024-NEET-01', 'NEET', '2024-25', 'Sunita Sharma', '9876543211',
            78, 100, 65, 100, '', '', 88, 100,
        ],
        [
            'Rohit Desai', '2024-PCMB-01', 'PCMB', '2024-25', 'Amit Desai', '9876543212',
            91, 100, 84, 100, 76, 100, 93, 100,
        ],
    ]);

    // Column widths
    ws['!cols'] = [
        { wch: 18 }, { wch: 16 }, { wch: 8 }, { wch: 10 }, { wch: 16 }, { wch: 14 },
        { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 18 },
        { wch: 10 }, { wch: 14 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Marks Import');
    return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

// ── existing function — untouched ──────────────────────────
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