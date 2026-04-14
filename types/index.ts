import type { SubjectMark } from '@/lib/grades';

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

export interface ReportCardData {
    resultId?: string;
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