import { NextResponse } from 'next/server';
import { generateMarksExcelTemplate } from '@/lib/excel';

export async function GET() {
    const buffer = generateMarksExcelTemplate();
    return new NextResponse(buffer as unknown as BodyInit, {
        status: 200,
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="Sharada_Marks_Import_Template.xlsx"',
        },
    });
}