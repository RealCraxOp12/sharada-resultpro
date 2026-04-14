import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseStudentExcel } from '@/lib/excel';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const rows = parseStudentExcel(buffer);

    // Get course IDs
    const { data: courses } = await supabaseAdmin.from('courses').select('id, name');
    const courseMap = Object.fromEntries((courses || []).map(c => [c.name, c.id]));

    const students = rows
        .filter(r => r.name && r.roll && courseMap[r.course])
        .map(r => ({
            name: r.name,
            roll_no: r.roll,
            course_id: courseMap[r.course],
            batch: r.batch,
            parent_name: r.parent || null,
            phone: r.phone || null,
        }));

    const { data, error } = await supabaseAdmin
        .from('students')
        .upsert(students, { onConflict: 'roll_no', ignoreDuplicates: false })
        .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ inserted: data?.length || 0, total: rows.length });
}