import * as XLSX from 'xlsx';

export interface BulkStudentRow {
    name: string; roll: string; course: string; batch: string; parent?: string; phone?: string;
}
export interface BulkStudentRowWithMarks extends BulkStudentRow {
    physics?: number; chemistry?: number; mathematics?: number; biology?: number;
    physicsTotal?: number; chemistryTotal?: number; mathematicsTotal?: number; biologyTotal?: number;
}
export interface SchoolStudentRow {
    name: string; roll: string; className: string; batch: string; parent?: string; phone?: string;
    maths?: number; mathsTotal?: number;
    science?: number; scienceTotal?: number;
    english?: number; englishTotal?: number;
    sanskrit?: number; sanskritTotal?: number;
    // Class 8,9,10 optionals
    it?: number; itTotal?: number;
    marathiGrammar?: number; marathiGrammarTotal?: number;
    hindiGrammar?: number; hindiGrammarTotal?: number;
    // Class 9,10 split subjects
    maths1?: number; maths1Total?: number;
    maths2?: number; maths2Total?: number;
    science1?: number; science1Total?: number;
    science2?: number; science2Total?: number;
}

export function parseStudentExcel(buffer: ArrayBuffer): BulkStudentRow[] {
    const wb = XLSX.read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
    return rows.filter(r => r['Student Name'] || r['name']).map(r => ({
        name: String(r['Student Name'] || r['name'] || ''),
        roll: String(r['Roll No'] || r['roll_no'] || r['roll'] || ''),
        course: String(r['Course'] || r['course'] || 'PCM'),
        batch: String(r['Batch'] || r['batch'] || '2024-25'),
        parent: String(r['Parent Name'] || r['parent'] || ''),
        phone: String(r['Phone'] || r['phone'] || ''),
    }));
}

export function parseStudentExcelWithMarks(buffer: ArrayBuffer): BulkStudentRowWithMarks[] {
    const wb = XLSX.read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
    const n = (row: Record<string, unknown>, key: string) => {
        const v = row[key];
        if (v === undefined || v === null || v === '') return undefined;
        const num = Number(v);
        return isNaN(num) ? undefined : num;
    };
    return rows.filter(r => r['Student Name'] || r['name']).map(r => ({
        name: String(r['Student Name'] || r['name'] || ''),
        roll: String(r['Roll No'] || r['roll_no'] || ''),
        course: String(r['Course'] || 'PCM'),
        batch: String(r['Batch'] || '2024-25'),
        parent: String(r['Parent Name'] || ''),
        phone: String(r['Phone'] || ''),
        physics: n(r, 'Physics'), chemistry: n(r, 'Chemistry'),
        mathematics: n(r, 'Mathematics'), biology: n(r, 'Biology'),
        physicsTotal: n(r, 'Physics_Total') ?? 100,
        chemistryTotal: n(r, 'Chemistry_Total') ?? 100,
        mathematicsTotal: n(r, 'Mathematics_Total') ?? 100,
        biologyTotal: n(r, 'Biology_Total') ?? 100,
    }));
}

// ── NEW: School section parser ────────────────────────────────
export function parseSchoolExcelWithMarks(buffer: ArrayBuffer): SchoolStudentRow[] {
    const wb = XLSX.read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
    const n = (row: Record<string, unknown>, key: string) => {
        const v = row[key];
        if (v === undefined || v === null || v === '') return undefined;
        const num = Number(v);
        return isNaN(num) ? undefined : num;
    };
    return rows.filter(r => r['Student Name'] || r['name']).map(r => ({
        name: String(r['Student Name'] || r['name'] || ''),
        roll: String(r['Roll No'] || r['roll_no'] || ''),
        className: String(r['Class'] || r['class'] || 'Class 5'),
        batch: String(r['Batch'] || '2025-26'),
        parent: String(r['Parent Name'] || ''),
        phone: String(r['Phone'] || ''),
        maths: n(r, 'Maths'), mathsTotal: n(r, 'Maths_Total') ?? 100,
        science: n(r, 'Science'), scienceTotal: n(r, 'Science_Total') ?? 100,
        english: n(r, 'English'), englishTotal: n(r, 'English_Total') ?? 100,
        sanskrit: n(r, 'Sanskrit'), sanskritTotal: n(r, 'Sanskrit_Total') ?? 100,
        it: n(r, 'IT'), itTotal: n(r, 'IT_Total') ?? 100,
        marathiGrammar: n(r, 'Marathi_Grammar'), marathiGrammarTotal: n(r, 'Marathi_Grammar_Total') ?? 100,
        hindiGrammar: n(r, 'Hindi_Grammar'), hindiGrammarTotal: n(r, 'Hindi_Grammar_Total') ?? 100,
        maths1: n(r, 'Maths_1'), maths1Total: n(r, 'Maths_1_Total') ?? 100,
        maths2: n(r, 'Maths_2'), maths2Total: n(r, 'Maths_2_Total') ?? 100,
        science1: n(r, 'Science_1'), science1Total: n(r, 'Science_1_Total') ?? 100,
        science2: n(r, 'Science_2'), science2Total: n(r, 'Science_2_Total') ?? 100,
    }));
}

// ── NEW: School Excel template ────────────────────────────────
export function generateSchoolExcelTemplate(): Uint8Array {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Class 5-7 template
    const ws57 = XLSX.utils.aoa_to_sheet([
        ['Student Name', 'Roll No', 'Class', 'Batch', 'Parent Name', 'Phone', 'Maths', 'Maths_Total', 'Science', 'Science_Total', 'English', 'English_Total', 'Sanskrit', 'Sanskrit_Total'],
        ['Rohan Patil', '2025-5-01', 'Class 5', '2025-26', 'Suresh Patil', '9876543210', 88, 100, 75, 100, 90, 100, '', ''],
        ['Priya Desai', '2025-6-01', 'Class 6', '2025-26', 'Ramesh Desai', '9876543211', 92, 100, 85, 100, 78, 100, 70, 100],
        ['Aarav Joshi', '2025-7-01', 'Class 7', '2025-26', 'Mahesh Joshi', '9876543212', 65, 100, 70, 100, 82, 100, '', ''],
    ]);
    ws57['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws57, 'Class 5-7');

    // Sheet 2: Class 8 template
    const ws8 = XLSX.utils.aoa_to_sheet([
        ['Student Name', 'Roll No', 'Class', 'Batch', 'Parent Name', 'Phone', 'Maths', 'Maths_Total', 'Science', 'Science_Total', 'English', 'English_Total', 'Sanskrit', 'Sanskrit_Total', 'IT', 'IT_Total', 'Marathi_Grammar', 'Marathi_Grammar_Total', 'Hindi_Grammar', 'Hindi_Grammar_Total'],
        ['Sneha Kulkarni', '2025-8-01', 'Class 8', '2025-26', 'Vijay Kulkarni', '9876543213', 85, 100, 78, 100, 88, 100, '', '', 72, 100, '', '', '', ''],
    ]);
    ws8['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 10 }, { wch: 16 }, { wch: 20 }, { wch: 14 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws8, 'Class 8');

    // Sheet 3: Class 9-10 template
    const ws910 = XLSX.utils.aoa_to_sheet([
        ['Student Name', 'Roll No', 'Class', 'Batch', 'Parent Name', 'Phone', 'Maths_1', 'Maths_1_Total', 'Maths_2', 'Maths_2_Total', 'Science_1', 'Science_1_Total', 'Science_2', 'Science_2_Total', 'English', 'English_Total', 'Sanskrit', 'Sanskrit_Total', 'IT', 'IT_Total', 'Marathi_Grammar', 'Marathi_Grammar_Total', 'Hindi_Grammar', 'Hindi_Grammar_Total'],
        ['Rahul Sawant', '2025-9-01', 'Class 9', '2025-26', 'Anil Sawant', '9876543214', 82, 100, 78, 100, 88, 100, 72, 100, 90, 100, '', '', '', '', '', '', '', ''],
        ['Neha More', '2025-10-01', 'Class 10', '2025-26', 'Sunil More', '9876543215', 90, 100, 85, 100, 92, 100, 88, 100, 95, 100, 80, 100, '', '', '', '', '', ''],
    ]);
    ws910['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 8 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 10 }, { wch: 16 }, { wch: 20 }, { wch: 14 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws910, 'Class 9-10');

    return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

export function generateMarksExcelTemplate(): Uint8Array {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
        ['Student Name', 'Roll No', 'Course', 'Batch', 'Parent Name', 'Phone', 'Physics', 'Physics_Total', 'Chemistry', 'Chemistry_Total', 'Mathematics', 'Mathematics_Total', 'Biology', 'Biology_Total'],
        ['Aryan Patil', '2024-PCM-01', 'PCM', '2024-25', 'Rajesh Patil', '9876543210', 85, 100, 72, 100, 90, 100, '', ''],
        ['Priya Sharma', '2024-NEET-01', 'NEET', '2024-25', 'Sunita Sharma', '9876543211', 78, 100, 65, 100, '', '', 88, 100],
        ['Rohit Desai', '2024-PCMB-01', 'PCMB', '2024-25', 'Amit Desai', '9876543212', 91, 100, 84, 100, 76, 100, 93, 100],
    ]);
    ws['!cols'] = [{ wch: 18 }, { wch: 16 }, { wch: 8 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 10 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Marks Import');
    return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
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