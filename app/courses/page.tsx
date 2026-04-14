'use client';

const COURSE_SUBJECTS: Record<string, string[]> = {
    PCM: ['Physics', 'Chemistry', 'Mathematics'],
    PCMB: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    JEE: ['Physics', 'Chemistry', 'Mathematics'],
    NEET: ['Physics', 'Chemistry', 'Biology'],
    CET: ['Physics', 'Chemistry', 'Mathematics'],
};

const COURSE_DESCRIPTIONS: Record<string, string> = {
    PCM: 'Standard science stream — engineering aspirants',
    PCMB: 'Combined stream — medical & engineering',
    JEE: 'IIT-JEE focused preparation',
    NEET: 'Medical entrance (NEET-UG) preparation',
    CET: 'Maharashtra CET state entrance preparation',
};

const SUBJECT_ICONS: Record<string, string> = {
    Physics: '📘',
    Chemistry: '🧪',
    Mathematics: '📐',
    Biology: '🌿',
};

const COURSE_COLORS: Record<string, string> = {
    PCM: 'border-blue-500',
    PCMB: 'border-purple-500',
    JEE: 'border-orange-500',
    NEET: 'border-green-500',
    CET: 'border-yellow-500',
};

export default function CoursesPage() {
    return (
        <div className="text-white">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">📊 Courses</h1>
                <p className="text-gray-400 mt-1">All available courses and their subjects</p>
            </div>

            {/* Course Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(COURSE_SUBJECTS).map(([course, subjects]) => (
                    <div
                        key={course}
                        className={`bg-gray-900 border-l-4 ${COURSE_COLORS[course]} border border-gray-800 rounded-2xl p-6`}
                    >
                        {/* Course Name */}
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold">{course}</h2>
                            <span className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
                                {subjects.length} subjects
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-400 text-sm mb-4">{COURSE_DESCRIPTIONS[course]}</p>

                        {/* Subjects */}
                        <div className="space-y-2">
                            {subjects.map(subject => (
                                <div
                                    key={subject}
                                    className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-2.5"
                                >
                                    <span>{SUBJECT_ICONS[subject]}</span>
                                    <span className="text-sm font-medium">{subject}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}