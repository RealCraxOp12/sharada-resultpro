import { NextResponse } from 'next/server';
import { generateSchoolExcelTemplate } from '@/lib/excel';

export async function GET() {
    const buffer = generateSchoolExcelTemplate();
    return new NextResponse(buffer as unknown as BodyInit, {
        status: 200,
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="Sharada_School_Marks_Template.xlsx"',
        },
    });
}