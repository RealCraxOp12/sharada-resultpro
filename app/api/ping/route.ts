import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    await supabaseAdmin.from('students').select('id').limit(1);
    return NextResponse.json({ ok: true, time: new Date().toISOString() });
}