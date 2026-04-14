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