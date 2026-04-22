import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseSchoolExcelWithMarks } from '@/lib/excel';

// Subjects per class
const CLASS_COMPULSORY: Record<string, string[]> = {
    'Class 5': ['Maths', 'Science', 'English'],
    'Class 6': ['Maths', 'Science', 'English'],
    'Class 7': ['Maths', 'Science', 'English'],
    'Class 8': ['Maths', 'Science', 'English'],
    'Class 9': ['Maths 1', 'Maths 2', 'Science 1', 'Science 2', 'English'],
    'Class 10': ['Maths 1', 'Maths 2', 'Science 1', 'Science 2', 'English'],
};
const CLASS_OPTIONAL: Record<string, string[]> = {
    'Class 5': ['Sanskrit'],
    'Class 6': ['Sanskrit'],
    'Class 7': ['Sanskrit'],
    'Class 8': ['Sanskrit', 'IT', 'Marathi Grammar', 'Hindi Grammar'],
    'Class 9': ['Sanskrit', 'IT', 'Marathi Grammar', 'Hindi Grammar'],
    'Class 10': ['Sanskrit', 'IT', 'Marathi Grammar', 'Hindi Grammar'],
};

function getGrade(pct: number) {
    if (pct >= 90) return 'A';
    if (pct >= 75) return 'B';
    if (pct >= 50) return 'C';
    return 'D';
}

// Map subject name → excel column keys
function getSubjectValue(row: Record<string, number | undefined>, subject: string): { obtained: number; total: number } | null {
    const map: Record<string, [string, string]> = {
        'Maths': ['maths', 'mathsTotal'],
        'Science': ['science', 'scienceTotal'],
        'English': ['english', 'englishTotal'],
        'Sanskrit': ['sanskrit', 'sanskritTotal'],
        'IT': ['it', 'itTotal'],
        'Marathi Grammar': ['marathiGrammar', 'marathiGrammarTotal'],
        'Hindi Grammar': ['hindiGrammar', 'hindiGrammarTotal'],
        'Maths 1': ['maths1', 'maths1Total'],
        'Maths 2': ['maths2', 'maths2Total'],
        'Science 1': ['science1', 'science1Total'],
        'Science 2': ['science2', 'science2Total'],
    };
    const keys = map[subject];
    if (!keys) return null;
    const obtained = row[keys[0]];
    if (obtained === undefined) return null;
    return { obtained, total: row[keys[1]] ?? 100 };
}

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const examName = formData.get('exam_name') as string;

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    if (!examName) return NextResponse.json({ error: 'Exam name required' }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const rows = parseSchoolExcelWithMarks(buffer);
    if (!rows.length) return NextResponse.json({ error: 'No valid rows found' }, { status: 400 });

    // Get or create course for school classes
    const { data: courses } = await supabaseAdmin.from('courses').select('id, name');
    const courseMap = Object.fromEntries((courses || []).map(c => [c.name, c.id]));

    const results: { name: string; roll: string; pct: number; grade: string; className: string; marks: { subject: string; obtained: number; total: number; pct: number; grade: string }[] }[] = [];
    const errors: string[] = [];

    for (const row of rows) {
        const cls = row.className;
        if (!CLASS_COMPULSORY[cls]) {
            errors.push(`Skipped ${row.name} — invalid class "${cls}"`);
            continue;
        }

        // Ensure course exists in DB
        let courseId = courseMap[cls];
        if (!courseId) {
            const { data: newCourse } = await supabaseAdmin
                .from('courses').insert({ name: cls }).select().single();
            if (newCourse) { courseId = newCourse.id; courseMap[cls] = courseId; }
        }
        if (!courseId) { errors.push(`Failed to create course for ${cls}`); continue; }

        const { data: student, error: sErr } = await supabaseAdmin
            .from('students')
            .upsert({ name: row.name, roll_no: row.roll, course_id: courseId, batch: row.batch || '2025-26', parent_name: row.parent || null, phone: row.phone || null }, { onConflict: 'roll_no' })
            .select().single();

        if (sErr || !student) { errors.push(`Failed to save student: ${row.name}`); continue; }

        const rowAsRecord = row as unknown as Record<string, number | undefined>;
        const marksData: { subject: string; obtained: number; total: number; pct: number; grade: string }[] = [];

        // Compulsory subjects
        for (const subject of CLASS_COMPULSORY[cls]) {
            const val = getSubjectValue(rowAsRecord, subject);
            if (!val) continue;
            const pct = val.total > 0 ? Math.round((val.obtained / val.total) * 100) : 0;
            marksData.push({ subject, obtained: val.obtained, total: val.total, pct, grade: getGrade(pct) });
        }

        // Optional subjects — only if filled
        for (const subject of CLASS_OPTIONAL[cls] || []) {
            const val = getSubjectValue(rowAsRecord, subject);
            if (!val) continue;
            const pct = val.total > 0 ? Math.round((val.obtained / val.total) * 100) : 0;
            marksData.push({ subject, obtained: val.obtained, total: val.total, pct, grade: getGrade(pct) });
        }

        const totalObtained = marksData.reduce((s, m) => s + m.obtained, 0);
        const totalMax = marksData.reduce((s, m) => s + m.total, 0);
        const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
        const finalGrade = getGrade(overallPct);

        const { error: rErr } = await supabaseAdmin.from('results').insert({
            student_id: student.id, exam_name: examName,
            total_obtained: totalObtained, total_max: totalMax,
            overall_pct: overallPct, final_grade: finalGrade, marks_data: marksData,
        });

        if (rErr) { errors.push(`Saved student but result failed: ${row.name}`); }
        else { results.push({ name: row.name, roll: row.roll, pct: overallPct, grade: finalGrade, className: cls, marks: marksData }); }
    }

    return NextResponse.json({ success: results.length, errors: errors.length, errorLog: errors, results });
}