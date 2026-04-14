export type GradeType = 'A' | 'B' | 'C' | 'D';

export type SubjectMark = {
    subject: string;
    obtained: number;
    total: number;
    pct: number;
    grade: GradeType;
};

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