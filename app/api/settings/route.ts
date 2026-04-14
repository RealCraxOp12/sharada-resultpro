import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from('institutes')
        .select('*')
        .limit(1)
        .single();

    if (error) {
        return NextResponse.json({
            institute: {
                name: 'Sharada Classes',
                address: 'Main Road, Dapoli, Ratnagiri – 415 712',
                phone: '+91 98765 43210',
                email: 'info@sharadaclasses.in',
            }
        });
    }

    return NextResponse.json({ institute: data });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { name, address, phone, email } = body;

    const { error } = await supabaseAdmin
        .from('institutes')
        .update({ name, address, phone, email })
        .eq('name', 'Sharada Classes');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}