# 🎓 Sharada ResultPro — Complete Setup Guide

## Project: Coaching Institute Result Management System
**Institute:** Sharada Classes, Dapoli  
**Developer:** Saad Sahebwale

---

## 📁 Folder Structure

```
sharada-resultpro/
├── app/
│   ├── layout.tsx                    # Root layout with sidebar
│   ├── page.tsx                      # Dashboard (redirect)
│   ├── dashboard/page.tsx            # Dashboard
│   ├── students/page.tsx             # Students list
│   ├── students/[id]/page.tsx        # Student detail
│   ├── results/page.tsx              # Results list
│   ├── results/generate/page.tsx     # Generate result card
│   ├── courses/page.tsx              # Course management
│   ├── settings/page.tsx             # Institute settings
│   └── api/
│       ├── students/route.ts         # Students CRUD
│       ├── results/route.ts          # Results CRUD
│       ├── pdf/route.ts              # PDF generation
│       └── upload/route.ts           # File upload
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── AppShell.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── StatCard.tsx
│   │   └── Table.tsx
│   ├── forms/
│   │   ├── MarksEntryForm.tsx
│   │   ├── StudentForm.tsx
│   │   └── SettingsForm.tsx
│   └── report/
│       ├── ReportCard.tsx            # HTML report template
│       └── ReportPreview.tsx
├── lib/
│   ├── supabase.ts                   # Supabase client
│   ├── grades.ts                     # Grade calculation logic
│   ├── courses.ts                    # Course/subject data
│   ├── pdf.ts                        # PDF generation (Puppeteer)
│   └── excel.ts                      # Bulk upload parser
├── types/
│   └── index.ts                      # TypeScript interfaces
├── supabase/
│   └── schema.sql                    # Database schema
├── .env.local.example
├── package.json
└── tailwind.config.ts
```

---

## ⚡ Quick Start

### 1. Create Next.js App

```bash
npx create-next-app@latest sharada-resultpro \
  --typescript --tailwind --eslint --app --src-dir=false
cd sharada-resultpro
```

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs \
  framer-motion puppeteer jspdf xlsx react-hot-toast \
  react-hook-form zod @hookform/resolvers lucide-react \
  date-fns class-variance-authority clsx tailwind-merge
```

### 3. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_INSTITUTE_NAME="Sharada Classes"
NEXT_PUBLIC_INSTITUTE_LOCATION="Dapoli"
```

### 4. Database Setup

Run `supabase/schema.sql` in your Supabase SQL editor.

### 5. Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## 🗄 Database Schema (Supabase)

```sql
-- Institutes
CREATE TABLE institutes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Sharada Classes',
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Courses
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subjects
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Students
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  roll_no TEXT NOT NULL UNIQUE,
  course_id UUID REFERENCES courses(id),
  batch TEXT NOT NULL DEFAULT '2024-25',
  parent_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Marks
CREATE TABLE marks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id),
  obtained_marks NUMERIC NOT NULL DEFAULT 0,
  total_marks NUMERIC NOT NULL DEFAULT 100,
  exam_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Results (generated report cards)
CREATE TABLE results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  exam_name TEXT NOT NULL,
  total_obtained NUMERIC,
  total_max NUMERIC,
  overall_pct NUMERIC,
  final_grade TEXT,
  pdf_url TEXT,
  marks_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed courses
INSERT INTO courses (name) VALUES ('PCM'),('PCMB'),('JEE'),('NEET'),('CET');

-- Seed subjects (PCM = course_id for PCM)
-- Run after getting the course IDs
```

---

## 📄 Key Files

### `lib/courses.ts`
```typescript
export const COURSES: Record<string, string[]> = {
  PCM:  ['Physics', 'Chemistry', 'Mathematics'],
  PCMB: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  JEE:  ['Physics', 'Chemistry', 'Mathematics'],
  NEET: ['Physics', 'Chemistry', 'Biology'],
  CET:  ['Physics', 'Chemistry', 'Mathematics'],
};

export const COURSE_DESCRIPTIONS: Record<string, string> = {
  PCM:  'Standard Science stream for engineering aspirants',
  PCMB: 'Combined stream for both medical and engineering',
  JEE:  'IIT-JEE focused preparation',
  NEET: 'Medical entrance preparation',
  CET:  'Maharashtra CET preparation',
};
```

### `lib/grades.ts`
```typescript
export function getGrade(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 75) return 'B';
  if (percentage >= 50) return 'C';
  return 'D';
}

export function calcPercentage(obtained: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((obtained / total) * 100);
}

export function findBestSubject(marks: SubjectMark[]): SubjectMark {
  return marks.reduce((best, m) => m.pct > best.pct ? m : best, marks[0]);
}

export function findWeakSubject(marks: SubjectMark[]): SubjectMark {
  return marks.reduce((weak, m) => m.pct < weak.pct ? m : weak, marks[0]);
}

export type SubjectMark = {
  subject: string;
  obtained: number;
  total: number;
  pct: number;
  grade: string;
};
```

### `lib/pdf.ts` (Server-side with Puppeteer)
```typescript
import puppeteer from 'puppeteer';

export async function generateReportPDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  await browser.close();
  return pdf;
}
```

### `app/api/pdf/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateReportPDF } from '@/lib/pdf';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { html, studentName, course } = await req.json();
  
  // Generate PDF
  const pdfBuffer = await generateReportPDF(html);
  
  // Upload to Supabase Storage
  const fileName = `${studentName.replace(/\s+/g,'_')}_${course}_${Date.now()}.pdf`;
  const { data, error } = await supabaseAdmin.storage
    .from('result-pdfs')
    .upload(fileName, pdfBuffer, { contentType: 'application/pdf' });
  
  if (error) return NextResponse.json({ error }, { status: 500 });
  
  // Return for download
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
```

### `lib/excel.ts` (Bulk Upload)
```typescript
import * as XLSX from 'xlsx';

export function parseStudentExcel(buffer: ArrayBuffer) {
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws) as any[];
  
  return rows.map(row => ({
    name:   row['Student Name'] || row['name'],
    roll:   String(row['Roll No'] || row['roll_no']),
    course: row['Course'] || 'PCM',
    batch:  String(row['Batch'] || '2024-25'),
  }));
}

// Excel template headers:
// Student Name | Roll No | Course | Batch | Parent Name | Phone
```

---

## 🎨 Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
      colors: {
        bg:      '#0d1117',
        surface: '#161b22',
        accent:  '#f0883e',
      },
    },
  },
  plugins: [],
};
export default config;
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```
Add environment variables in Vercel dashboard.

### Supabase Storage Bucket
Create a bucket called `result-pdfs` in Supabase Storage with public access for downloads.

---

## 📦 Key Features Summary

| Feature | Implementation |
|---|---|
| Auth | Supabase Auth (email/password) |
| Database | Supabase PostgreSQL |
| PDF Generation | Puppeteer (server) + jsPDF (client) |
| File Storage | Supabase Storage |
| Bulk Upload | XLSX parser → Supabase insert |
| Animations | Framer Motion |
| Form Validation | React Hook Form + Zod |
| State | React useState + Supabase realtime |

---

*Developed by **Saad Sahebwale** · Sharada ResultPro v1.0*
