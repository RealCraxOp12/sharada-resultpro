import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    const { data } = await supabaseAdmin
        .from('institutes').select('*').limit(1).single();

    return NextResponse.json({
        institute: data || {
            name: 'Sharada Classes',
            address: 'Main Road, Dapoli, Ratnagiri – 415 712',
            phone: '+91 98765 43210',
            email: 'info@sharadaclasses.in',
        }
    });
}

export async function POST(req: NextRequest) {
    const { name, address, phone, email } = await req.json();

    // Try update first, if no rows exist then insert
    const { data: existing } = await supabaseAdmin
        .from('institutes').select('id').limit(1).single();

    if (existing?.id) {
        await supabaseAdmin.from('institutes')
            .update({ name, address, phone, email })
            .eq('id', existing.id);
    } else {
        await supabaseAdmin.from('institutes')
            .insert({ name, address, phone, email });
    }

    return NextResponse.json({ success: true });
}