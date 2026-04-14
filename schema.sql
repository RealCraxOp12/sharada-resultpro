-- ============================================================
--  Sharada ResultPro · Supabase Schema
--  Run this in your Supabase SQL Editor
--  Developed by Saad Sahebwale
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Institutes ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS institutes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT 'Sharada Classes',
  logo_url   TEXT,
  address    TEXT DEFAULT 'Main Road, Dapoli, Ratnagiri – 415 712',
  phone      TEXT DEFAULT '+91 98765 43210',
  email      TEXT DEFAULT 'info@sharadaclasses.in',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Default institute record
INSERT INTO institutes (name, address, phone, email)
VALUES ('Sharada Classes', 'Main Road, Dapoli, Ratnagiri – 415 712', '+91 98765 43210', 'info@sharadaclasses.in')
ON CONFLICT DO NOTHING;

-- ─── Courses ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO courses (name) VALUES
  ('PCM'), ('PCMB'), ('JEE'), ('NEET'), ('CET')
ON CONFLICT DO NOTHING;

-- ─── Subjects ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  course_id  UUID REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, course_id)
);

-- Seed subjects per course
DO $$
DECLARE
  pcm_id  UUID; pcmb_id UUID; jee_id UUID; neet_id UUID; cet_id UUID;
BEGIN
  SELECT id INTO pcm_id  FROM courses WHERE name='PCM';
  SELECT id INTO pcmb_id FROM courses WHERE name='PCMB';
  SELECT id INTO jee_id  FROM courses WHERE name='JEE';
  SELECT id INTO neet_id FROM courses WHERE name='NEET';
  SELECT id INTO cet_id  FROM courses WHERE name='CET';

  INSERT INTO subjects (name, course_id) VALUES
    ('Physics',     pcm_id),  ('Chemistry', pcm_id),  ('Mathematics', pcm_id),
    ('Physics',     pcmb_id), ('Chemistry', pcmb_id), ('Mathematics', pcmb_id), ('Biology', pcmb_id),
    ('Physics',     jee_id),  ('Chemistry', jee_id),  ('Mathematics', jee_id),
    ('Physics',     neet_id), ('Chemistry', neet_id), ('Biology',     neet_id),
    ('Physics',     cet_id),  ('Chemistry', cet_id),  ('Mathematics', cet_id)
  ON CONFLICT DO NOTHING;
END $$;

-- ─── Students ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  roll_no     TEXT NOT NULL UNIQUE,
  course_id   UUID REFERENCES courses(id),
  batch       TEXT NOT NULL DEFAULT '2024-25',
  parent_name TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_course ON students(course_id);
CREATE INDEX IF NOT EXISTS idx_students_batch  ON students(batch);

-- ─── Marks ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marks (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id      UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id      UUID REFERENCES subjects(id),
  obtained_marks  NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_marks     NUMERIC(5,2) NOT NULL DEFAULT 100,
  exam_name       TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marks_student ON marks(student_id);

-- ─── Results (generated report cards) ─────────────────────────
CREATE TABLE IF NOT EXISTS results (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id      UUID REFERENCES students(id) ON DELETE CASCADE,
  exam_name       TEXT NOT NULL,
  total_obtained  NUMERIC(7,2),
  total_max       NUMERIC(7,2),
  overall_pct     NUMERIC(5,2),
  final_grade     TEXT CHECK (final_grade IN ('A','B','C','D')),
  pdf_url         TEXT,
  marks_data      JSONB,  -- snapshot of marks at time of generation
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_results_student ON results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_grade   ON results(final_grade);

-- ─── Row Level Security ───────────────────────────────────────
-- Enable RLS (add your auth policies here for production)
ALTER TABLE institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects   ENABLE ROW LEVEL SECURITY;
ALTER TABLE students   ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE results    ENABLE ROW LEVEL SECURITY;

-- For development: allow all (restrict in production with auth)
CREATE POLICY "allow_all_institutes" ON institutes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_courses"    ON courses    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_subjects"   ON subjects   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_students"   ON students   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_marks"      ON marks      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_results"    ON results    FOR ALL USING (true) WITH CHECK (true);

-- ─── Storage ──────────────────────────────────────────────────
-- Run this to create the PDF storage bucket (or do it in Dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('result-pdfs', 'result-pdfs', true);

-- ─── Computed Views ───────────────────────────────────────────
CREATE OR REPLACE VIEW student_performance AS
SELECT
  s.id,
  s.name,
  s.roll_no,
  c.name AS course,
  s.batch,
  COUNT(r.id) AS total_results,
  ROUND(AVG(r.overall_pct), 1) AS avg_percentage,
  MAX(r.overall_pct) AS best_percentage,
  MIN(r.overall_pct) AS lowest_percentage
FROM students s
LEFT JOIN courses c ON c.id = s.course_id
LEFT JOIN results r ON r.student_id = s.id
GROUP BY s.id, s.name, s.roll_no, c.name, s.batch;

-- ─── Done ─────────────────────────────────────────────────────
-- Schema created successfully for Sharada ResultPro
-- Developed by Saad Sahebwale
