import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseStudentExcelWithMarks } from '@/lib/excel';

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

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const examName = formData.get('exam_name') as string;

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    if (!examName) return NextResponse.json({ error: 'Exam name required' }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const rows = parseStudentExcelWithMarks(buffer);

    if (!rows.length) return NextResponse.json({ error: 'No valid rows found in Excel' }, { status: 400 });

    // Get course IDs
    const { data: courses } = await supabaseAdmin.from('courses').select('id, name');
    const courseMap = Object.fromEntries((courses || []).map(c => [c.name, c.id]));

    const results = [];
    const errors = [];

    for (const row of rows) {
        if (!row.name || !row.roll || !courseMap[row.course]) {
            errors.push(`Skipped: ${row.name || 'unknown'} — invalid course or missing data`);
            continue;
        }

        // Upsert student
        const { data: student, error: sErr } = await supabaseAdmin
            .from('students')
            .upsert({
                name: row.name,
                roll_no: row.roll,
                course_id: courseMap[row.course],
                batch: row.batch || '2024-25',
                parent_name: row.parent || null,
                phone: row.phone || null,
            }, { onConflict: 'roll_no' })
            .select()
            .single();

        if (sErr || !student) {
            errors.push(`Failed to save student: ${row.name}`);
            continue;
        }

        // Build marks from Excel columns
        const markValues: Record<string, { obtained: number; total: number }> = {
            Physics: { obtained: row.physics ?? 0, total: row.physicsTotal ?? 100 },
            Chemistry: { obtained: row.chemistry ?? 0, total: row.chemistryTotal ?? 100 },
            Mathematics: { obtained: row.mathematics ?? 0, total: row.mathematicsTotal ?? 100 },
            Biology: { obtained: row.biology ?? 0, total: row.biologyTotal ?? 100 },
        };

        // Only include subjects for this course + optional bio
        const courseSubjects = COURSE_SUBJECTS[row.course] || ['Physics', 'Chemistry', 'Mathematics'];
        const marksData = [];

        for (const subject of courseSubjects) {
            const mv = markValues[subject];
            if (!mv) continue;
            const pct = mv.total > 0 ? Math.round((mv.obtained / mv.total) * 100) : 0;
            marksData.push({ subject, obtained: mv.obtained, total: mv.total, pct, grade: getGrade(pct) });
        }

        // Optional biology — if course doesn't have bio but Excel has bio value
        if (!courseSubjects.includes('Biology') && row.biology !== undefined) {
            const mv = markValues['Biology'];
            const pct = mv.total > 0 ? Math.round((mv.obtained / mv.total) * 100) : 0;
            marksData.push({ subject: 'Biology', obtained: mv.obtained, total: mv.total, pct, grade: getGrade(pct) });
        }

        // Calculate summary
        const totalObtained = marksData.reduce((s, m) => s + m.obtained, 0);
        const totalMax = marksData.reduce((s, m) => s + m.total, 0);
        const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
        const finalGrade = getGrade(overallPct);

        // Save result
        const { error: rErr } = await supabaseAdmin.from('results').insert({
            student_id: student.id,
            exam_name: examName,
            total_obtained: totalObtained,
            total_max: totalMax,
            overall_pct: overallPct,
            final_grade: finalGrade,
            marks_data: marksData,
        });

        if (rErr) {
            errors.push(`Saved student but failed to save result: ${row.name}`);
        } else {
            results.push({ name: row.name, roll: row.roll, pct: overallPct, grade: finalGrade });
        }
    }

    return NextResponse.json({
        success: results.length,
        errors: errors.length,
        errorLog: errors,
        results,
    });
}