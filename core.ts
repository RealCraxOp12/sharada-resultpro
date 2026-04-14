// ============================================================
//  types/index.ts — Sharada ResultPro Type Definitions
//  Developed by Saad Sahebwale
// ============================================================

export interface Institute {
  id: string;
  name: string;
  logo_url: string | null;
  address: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface Course {
  id: string;
  name: 'PCM' | 'PCMB' | 'JEE' | 'NEET' | 'CET' | string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  course_id: string;
  created_at: string;
}

export interface Student {
  id: string;
  name: string;
  roll_no: string;
  course_id: string;
  batch: string;
  parent_name: string | null;
  phone: string | null;
  created_at: string;
  // Joined
  course?: Course;
}

export interface Mark {
  id: string;
  student_id: string;
  subject_id: string;
  obtained_marks: number;
  total_marks: number;
  exam_name: string;
  created_at: string;
  // Joined
  subject?: Subject;
}

export interface Result {
  id: string;
  student_id: string;
  exam_name: string;
  total_obtained: number;
  total_max: number;
  overall_pct: number;
  final_grade: 'A' | 'B' | 'C' | 'D';
  pdf_url: string | null;
  marks_data: SubjectMark[];
  created_at: string;
  // Joined
  student?: Student;
}

export interface SubjectMark {
  subject: string;
  obtained: number;
  total: number;
  pct: number;
  grade: 'A' | 'B' | 'C' | 'D';
}

export interface ReportCardData {
  student: {
    name: string;
    roll: string;
    course: string;
    batch: string;
  };
  institute: Institute;
  exam: string;
  marks: SubjectMark[];
  summary: {
    totalObtained: number;
    totalMax: number;
    overallPct: number;
    finalGrade: 'A' | 'B' | 'C' | 'D';
    bestSubject: SubjectMark;
    weakSubject: SubjectMark;
  };
}

export type GradeType = 'A' | 'B' | 'C' | 'D';

// ============================================================
//  lib/grades.ts
// ============================================================
export function getGrade(percentage: number): GradeType {
  if (percentage >= 90) return 'A';
  if (percentage >= 75) return 'B';
  if (percentage >= 50) return 'C';
  return 'D';
}

export function calcPercentage(obtained: number, total: number): number {
  if (!total || total === 0) return 0;
  return Math.round((obtained / total) * 100);
}

export function findBestSubject(marks: SubjectMark[]): SubjectMark {
  return marks.reduce((best, m) => (m.pct > best.pct ? m : best), marks[0]);
}

export function findWeakSubject(marks: SubjectMark[]): SubjectMark {
  return marks.reduce((weak, m) => (m.pct < weak.pct ? m : weak), marks[0]);
}

export function buildSummary(marks: SubjectMark[]) {
  const totalObtained = marks.reduce((s, m) => s + m.obtained, 0);
  const totalMax = marks.reduce((s, m) => s + m.total, 0);
  const overallPct = calcPercentage(totalObtained, totalMax);
  return {
    totalObtained,
    totalMax,
    overallPct,
    finalGrade: getGrade(overallPct),
    bestSubject: findBestSubject(marks),
    weakSubject: findWeakSubject(marks),
  };
}

// ============================================================
//  lib/courses.ts
// ============================================================
export const COURSE_SUBJECTS: Record<string, string[]> = {
  PCM: ['Physics', 'Chemistry', 'Mathematics'],
  PCMB: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  JEE: ['Physics', 'Chemistry', 'Mathematics'],
  NEET: ['Physics', 'Chemistry', 'Biology'],
  CET: ['Physics', 'Chemistry', 'Mathematics'],
};

export const COURSE_DESCRIPTIONS: Record<string, string> = {
  PCM: 'Standard science stream — engineering aspirants',
  PCMB: 'Combined stream — medical & engineering',
  JEE: 'IIT-JEE focused preparation',
  NEET: 'Medical entrance (NEET-UG) preparation',
  CET: 'Maharashtra CET state entrance preparation',
};

export const SUBJECT_ICONS: Record<string, string> = {
  Physics: '📘',
  Chemistry: '🧪',
  Mathematics: '📐',
  Biology: '🌿',
};

export const SUBJECT_COLORS: Record<string, string> = {
  Physics: '#3b82f6',
  Chemistry: '#22c55e',
  Mathematics: '#f0883e',
  Biology: '#a855f7',
};

// ============================================================
//  lib/supabase.ts
// ============================================================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client (use only in API routes)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================
//  lib/excel.ts — Bulk Upload Parser
// ============================================================
import * as XLSX from 'xlsx';

export interface BulkStudentRow {
  name: string;
  roll: string;
  course: string;
  batch: string;
  parent?: string;
  phone?: string;
}

export function parseStudentExcel(buffer: ArrayBuffer): BulkStudentRow[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];

  return rows
    .filter(row => row['Student Name'] || row['name'])
    .map(row => ({
      name: String(row['Student Name'] || row['name'] || ''),
      roll: String(row['Roll No'] || row['roll_no'] || row['roll'] || ''),
      course: String(row['Course'] || row['course'] || 'PCM'),
      batch: String(row['Batch'] || row['batch'] || '2024-25'),
      parent: String(row['Parent Name'] || row['parent'] || ''),
      phone: String(row['Phone'] || row['phone'] || ''),
    }));
}

export function generateStudentExcelTemplate(): Uint8Array {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ['Student Name', 'Roll No', 'Course', 'Batch', 'Parent Name', 'Phone'],
    ['Aryan Patil', '2024-PCM-01', 'PCM', '2024-25', 'Rajesh Patil', '9876543210'],
    ['Priya Sharma', '2024-NEET-01', 'NEET', '2024-25', 'Sunita Sharma', '9876543211'],
  ]);
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

// ============================================================
//  lib/pdf.ts — Server-side PDF Generation
// ============================================================
import puppeteer from 'puppeteer-core';

export async function generateReportPDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1700 });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

// ============================================================
//  components/report/ReportCard.tsx — HTML Report Template
// ============================================================
export function buildReportHTML(data: ReportCardData): string {
  const { student, institute, exam, marks, summary } = data;

  const rows = marks
    .map(m => {
      const isBest = m.subject === summary.bestSubject.subject;
      const isWeak = m.subject === summary.weakSubject.subject;
      const gradeColors: Record<string, string> = {
        A: '#15803d', B: '#1d4ed8', C: '#b45309', D: '#dc2626',
      };
      const rowBg = isBest ? '#f0fdf4' : isWeak ? '#fff7f7' : 'transparent';
      const borderLeft = isBest ? '3px solid #22c55e' : isWeak ? '3px solid #ef4444' : 'none';
      const tag = isBest
        ? '<span style="background:#dcfce7;color:#15803d;font-size:10px;padding:2px 7px;border-radius:10px;font-weight:600;margin-left:8px">★ BEST</span>'
        : isWeak
          ? '<span style="background:#fee2e2;color:#dc2626;font-size:10px;padding:2px 7px;border-radius:10px;font-weight:600;margin-left:8px">▾ NEEDS FOCUS</span>'
          : '';

      return `<tr style="background:${rowBg};border-left:${borderLeft}">
        <td style="padding:11px 14px;font-weight:600">${m.subject}${tag}</td>
        <td style="padding:11px 14px;text-align:center">${m.obtained}</td>
        <td style="padding:11px 14px;text-align:center">${m.total}</td>
        <td style="padding:11px 14px;text-align:center;font-weight:700">${m.pct}%</td>
        <td style="padding:11px 14px;text-align:center;font-weight:800;color:${gradeColors[m.grade]}">${m.grade}</td>
      </tr>`;
    })
    .join('');

  const performanceSummary =
    summary.overallPct >= 75
      ? `${student.name} has demonstrated excellent academic performance. ${summary.bestSubject.subject} is the strongest subject. Keep it up!`
      : summary.overallPct >= 50
        ? `${student.name} has shown satisfactory performance. Focus more on ${summary.weakSubject.subject} (${summary.weakSubject.pct}%) to improve overall results.`
        : `${student.name} needs to put in more effort. Significant improvement is required in ${summary.weakSubject.subject}. Regular practice is recommended.`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Outfit', 'Arial', sans-serif; color: #1a1a1a; background: white; }
  .page { width: 210mm; min-height: 297mm; padding: 0; }
</style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1e3a5f,#2d5a8e);color:white;padding:24px 32px;display:flex;align-items:center;gap:20px">
    <div style="width:68px;height:68px;background:rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;border:2px solid rgba(255,255,255,0.3);flex-shrink:0">🎓</div>
    <div>
      <div style="font-size:24px;font-weight:700;letter-spacing:0.01em">${institute.name}</div>
      <div style="font-size:11px;opacity:0.8;margin-top:4px">${institute.address} &nbsp;|&nbsp; ${institute.phone} &nbsp;|&nbsp; ${institute.email}</div>
      <div style="margin-top:8px;font-size:11px;opacity:0.65;letter-spacing:0.1em;text-transform:uppercase">Student Report Card · ${exam}</div>
    </div>
  </div>
  <!-- Orange stripe -->
  <div style="height:5px;background:linear-gradient(90deg,#f0883e,#fbbf24,#f0883e)"></div>
  <!-- Student info -->
  <div style="background:#f8f9fa;padding:16px 32px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px;border-bottom:1px solid #e5e7eb">
    <div><div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em">Student Name</div><div style="font-size:15px;font-weight:700;color:#111827;margin-top:3px">${student.name}</div></div>
    <div><div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em">Roll Number</div><div style="font-size:15px;font-weight:700;color:#111827;margin-top:3px">${student.roll}</div></div>
    <div><div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em">Course</div><div style="font-size:15px;font-weight:700;color:#111827;margin-top:3px">${student.course}</div></div>
    <div><div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em">Batch</div><div style="font-size:15px;font-weight:700;color:#111827;margin-top:3px">${student.batch}</div></div>
  </div>
  <!-- Marks table -->
  <div style="padding:20px 32px">
    <table style="width:100%;border-collapse:collapse;font-size:13.5px;margin-bottom:20px">
      <thead>
        <tr style="background:#1e3a5f;color:white">
          <th style="padding:11px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.08em">Subject</th>
          <th style="padding:11px 14px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.08em">Obtained</th>
          <th style="padding:11px 14px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.08em">Out Of</th>
          <th style="padding:11px 14px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.08em">Percentage</th>
          <th style="padding:11px 14px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.08em">Grade</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <!-- Summary cards -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
      <div style="background:#1e3a5f;color:white;border-radius:10px;padding:16px;text-align:center"><div style="font-size:10px;opacity:0.7;text-transform:uppercase;letter-spacing:0.08em">Total Marks</div><div style="font-size:26px;font-weight:700;margin-top:4px">${summary.totalObtained}</div></div>
      <div style="background:#1e3a5f;color:white;border-radius:10px;padding:16px;text-align:center"><div style="font-size:10px;opacity:0.7;text-transform:uppercase;letter-spacing:0.08em">Out Of</div><div style="font-size:26px;font-weight:700;margin-top:4px">${summary.totalMax}</div></div>
      <div style="background:#1e3a5f;color:white;border-radius:10px;padding:16px;text-align:center"><div style="font-size:10px;opacity:0.7;text-transform:uppercase;letter-spacing:0.08em">Percentage</div><div style="font-size:26px;font-weight:700;margin-top:4px">${summary.overallPct}%</div></div>
      <div style="background:linear-gradient(135deg,#b45309,#d97706);color:white;border-radius:10px;padding:16px;text-align:center"><div style="font-size:10px;opacity:0.8;text-transform:uppercase;letter-spacing:0.08em">Final Grade</div><div style="font-size:32px;font-weight:800;margin-top:4px">${summary.finalGrade}</div></div>
    </div>
    <!-- Performance summary -->
    <div style="background:#f8f9fa;border-left:4px solid #1e3a5f;border-radius:0 8px 8px 0;padding:14px 18px;font-size:13px;color:#374151;line-height:1.7;margin-bottom:24px">
      <strong>Performance Summary:</strong> ${performanceSummary}
    </div>
    <!-- Signature row -->
    <div style="display:flex;justify-content:space-between;align-items:flex-end;padding-top:16px;border-top:2px solid #1e3a5f">
      <div style="border-top:1px solid #9ca3af;padding-top:8px;text-align:center;width:150px"><div style="font-size:11px;color:#6b7280">Teacher's Signature</div></div>
      <div style="text-align:center"><div style="font-size:10px;color:#9ca3af">Report generated by Sharada ResultPro</div><div style="font-size:10px;color:#9ca3af;margin-top:2px">Developed by <strong>Saad Sahebwale</strong> · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
      <div style="border-top:1px solid #9ca3af;padding-top:8px;text-align:center;width:150px"><div style="font-size:11px;color:#6b7280">Institute Stamp</div></div>
    </div>
  </div>
</div>
</body>
</html>`;
}
