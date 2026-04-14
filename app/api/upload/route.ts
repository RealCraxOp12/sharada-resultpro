import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('logo') as File;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const ext = file.name.split('.').pop();
    const fileName = `institute-logo.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseAdmin.storage
        .from('logos')
        .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
        });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data } = supabaseAdmin.storage
        .from('logos')
        .getPublicUrl(fileName);

    await supabaseAdmin
        .from('institutes')
        .update({ logo_url: data.publicUrl })
        .eq('name', 'Sharada Classes');

    return NextResponse.json({ url: data.publicUrl });
}