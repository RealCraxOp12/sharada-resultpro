import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/results — list all results
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('student_id');

    let query = supabaseAdmin
        .from('results')
        .select('*, student:students(id, name, roll_no, course:courses(name))');

    if (studentId) query = query.eq('student_id', studentId);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ results: data ?? [] });
}

// POST /api/results — create result
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { student_id, exam_name, marks_data } = body;

    if (!student_id || !exam_name || !marks_data?.length) {
        return NextResponse.json(
            { error: 'student_id, exam_name, and marks_data required' },
            { status: 400 }
        );
    }

    const totalObtained = marks_data.reduce(
        (s: number, m: { obtained: number }) => s + m.obtained, 0
    );
    const totalMax = marks_data.reduce(
        (s: number, m: { total: number }) => s + m.total, 0
    );
    const overallPct = totalMax > 0
        ? Math.round((totalObtained / totalMax) * 100)
        : 0;
    const finalGrade =
        overallPct >= 90 ? 'A' :
            overallPct >= 75 ? 'B' :
                overallPct >= 50 ? 'C' : 'D';

    const { data, error } = await supabaseAdmin
        .from('results')
        .insert({
            student_id,
            exam_name,
            total_obtained: totalObtained,
            total_max: totalMax,
            overall_pct: overallPct,
            final_grade: finalGrade,
            marks_data,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ result: data }, { status: 201 });
}