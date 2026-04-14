import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/students — list all students with course
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const course = searchParams.get('course');
    const batch = searchParams.get('batch');
    const search = searchParams.get('q');

    let query = supabaseAdmin
        .from('students')
        .select('*, course:courses(id, name)')
        .order('created_at', { ascending: false });

    if (course) query = query.eq('courses.name', course);
    if (batch) query = query.eq('batch', batch);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ students: data });
}

// POST /api/students — create student
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { name, roll_no, course_id, batch, parent_name, phone } = body;

    if (!name || !roll_no || !course_id) {
        return NextResponse.json(
            { error: 'name, roll_no, and course_id are required' },
            { status: 400 }
        );
    }

    const { data, error } = await supabaseAdmin
        .from('students')
        .insert({
            name,
            roll_no,
            course_id,
            batch: batch || '2025-26',
            parent_name,
            phone,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ student: data }, { status: 201 });
}