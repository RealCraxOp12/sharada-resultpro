import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateReportPDF, buildReportHTML } from '@/lib/pdf';
import type { ReportCardData } from '@/types';

export async function POST(req: NextRequest) {
    const reportData: ReportCardData = await req.json();

    // Build HTML
    const html = buildReportHTML(reportData);

    // Generate PDF with Puppeteer
    const pdfBuffer = await generateReportPDF(html);

    // Upload to Supabase Storage
    const fileName = `${reportData.student.name.replace(/\s+/g, '_')}_${reportData.student.course}_${Date.now()}.pdf`;

    const { data: upload, error: uploadError } = await supabaseAdmin.storage
        .from('result-pdfs')
        .upload(fileName, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: false,
        });

    if (uploadError) {
        console.error('Storage upload failed:', uploadError);
    }

    // Save PDF URL to result record if we have result_id
    if (reportData.resultId && upload) {
        const { data: publicUrl } = supabaseAdmin.storage
            .from('result-pdfs')
            .getPublicUrl(fileName);

        await supabaseAdmin
            .from('results')
            .update({ pdf_url: publicUrl.publicUrl })
            .eq('id', reportData.resultId);
    }

    // Return PDF as download
    const safeFileName = `${reportData.student.name.replace(/\s+/g, '_')}_${reportData.student.course}_Result.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeFileName}"`,
            'Content-Length': pdfBuffer.length.toString(),
        },
    });
}