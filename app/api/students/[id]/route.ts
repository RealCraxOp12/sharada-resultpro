import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { error } = await supabaseAdmin
        .from('students')
        .delete()
        .eq('id', params.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}