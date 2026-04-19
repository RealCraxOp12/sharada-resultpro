'use client';
import { useEffect, useState } from 'react';

interface Result {
  id: string;
  exam_name: string;
  overall_pct: number;
  final_grade: string;
  total_obtained: number;
  total_max: number;
  marks_data: Record<string, unknown>[];
  created_at: string;
  student?: { name: string; roll_no: string; course?: { name: string } };
}

const GRADE_STYLE: Record<string, { bg: string; color: string }> = {
  A: { bg: 'rgba(34,197,94,0.1)', color: '#4ade80' },
  B: { bg: 'rgba(59,130,246,0.1)', color: '#60a5fa' },
  C: { bg: 'rgba(234,179,8,0.1)', color: '#facc15' },
  D: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
};
const COURSE_COLORS: Record<string, string> = {
  PCM: '#3b82f6', PCMB: '#a855f7', JEE: '#f97316', NEET: '#22c55e', CET: '#eab308',
};

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [dlAll, setDlAll] = useState(false);
  const [delAll, setDelAll] = useState(false);
  const [progress, setProgress] = useState('');
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch('/api/results').then(r => r.json()).then(d => {
      setResults(d.results || []);
      setLoading(false);
    });
    setTimeout(() => setVisible(true), 50);
  }, []);

  const filtered = results.filter(r =>
    (r.student?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    r.exam_name.toLowerCase().includes(search.toLowerCase())
  );

  async function downloadPDF(r: Result) {
    const inst = await fetch('/api/settings').then(x => x.json());
    const marks = r.marks_data || [];
    const best = marks.length ? marks.reduce((b: Record<string, unknown>, m: Record<string, unknown>) => (m.pct as number) > (b.pct as number) ? m : b, marks[0]) : null;
    const weak = marks.length ? marks.reduce((w: Record<string, unknown>, m: Record<string, unknown>) => (m.pct as number) < (w.pct as number) ? m : w, marks[0]) : null;
    const res = await fetch('/api/pdf', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student: { name: r.student?.name || '—', roll: r.student?.roll_no || '—', course: r.student?.course?.name || '—', batch: '2025-26' },
        institute: inst.institute, exam: r.exam_name, marks,
        summary: { totalObtained: r.total_obtained, totalMax: r.total_max, overallPct: r.overall_pct, finalGrade: r.final_grade, bestSubject: best, weakSubject: weak },
      }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${r.student?.name}_${r.exam_name}.pdf`; a.click();
      URL.revokeObjectURL(url);
    }
  }

  async function downloadAll() {
    if (!results.length || !confirm(`Download ${results.length} PDFs?`)) return;
    setDlAll(true);
    for (let i = 0; i < results.length; i++) {
      setProgress(`${i + 1} / ${results.length}`);
      await downloadPDF(results[i]);
      await new Promise(r => setTimeout(r, 800));
    }
    setProgress(''); setDlAll(false);
  }

  async function deleteAll() {
    if (!results.length || !confirm(`Delete ALL ${results.length} results?`)) return;
    setDelAll(true);
    const res = await fetch('/api/results/all', { method: 'DELETE' });
    if (res.ok) setResults([]);
    setDelAll(false);
  }

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
                .rp-root {
                    font-family: 'Inter', sans-serif; color: #f1f5f9;
                    opacity: 0; transform: translateY(16px);
                    transition: opacity 0.5s ease, transform 0.5s ease;
                }
                .rp-root.show { opacity: 1; transform: translateY(0); }

                .rp-header {
                    display: flex; align-items: flex-start;
                    justify-content: space-between; gap: 16px;
                    margin-bottom: 20px; flex-wrap: wrap;
                }
                .rp-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 24px; font-weight: 800;
                    letter-spacing: -0.03em;
                }
                .rp-sub { font-size: 12px; color: #334155; margin-top: 3px; }

                .rp-actions { display: flex; gap: 8px; flex-wrap: wrap; }
                .rp-btn {
                    padding: 9px 16px; border-radius: 10px;
                    font-size: 12.5px; font-weight: 600;
                    cursor: pointer; border: none;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.18s; display: flex; align-items: center; gap: 6px;
                }
                .rp-btn-blue {
                    background: rgba(59,130,246,0.1);
                    border: 1px solid rgba(59,130,246,0.2);
                    color: #60a5fa;
                }
                .rp-btn-blue:hover:not(:disabled) { background: rgba(59,130,246,0.18); }
                .rp-btn-red {
                    background: rgba(239,68,68,0.08);
                    border: 1px solid rgba(239,68,68,0.15);
                    color: #f87171;
                }
                .rp-btn-red:hover:not(:disabled) { background: rgba(239,68,68,0.14); }
                .rp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .rp-search-wrap { position: relative; margin-bottom: 16px; max-width: 320px; }
                .rp-search {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 10px; padding: 10px 14px 10px 34px;
                    font-size: 13px; color: #e2e8f0;
                    font-family: 'Inter', sans-serif; outline: none;
                    transition: border-color 0.18s;
                }
                .rp-search:focus { border-color: rgba(249,115,22,0.3); }
                .rp-search::placeholder { color: #1e293b; }
                .rp-search-icon {
                    position: absolute; left: 11px; top: 50%;
                    transform: translateY(-50%);
                    font-size: 12px; color: #1e293b; pointer-events: none;
                }

                .rp-table-wrap {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px; overflow: hidden;
                }
                .rp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .rp-thead tr {
                    background: rgba(255,255,255,0.02);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .rp-thead th {
                    padding: 12px 16px; text-align: left;
                    font-size: 10px; font-weight: 700; color: #1e293b;
                    text-transform: uppercase; letter-spacing: 0.1em;
                }
                .rp-tbody tr {
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    transition: background 0.15s;
                }
                .rp-tbody tr:last-child { border-bottom: none; }
                .rp-tbody tr:hover { background: rgba(255,255,255,0.025); }
                .rp-tbody td { padding: 13px 16px; vertical-align: middle; }

                .rp-name { font-weight: 500; color: #e2e8f0; }
                .rp-roll { font-size: 11px; color: #334155; margin-top: 1px; font-family: monospace; }

                .rp-badge {
                    display: inline-block; padding: 3px 10px;
                    border-radius: 20px; font-size: 10.5px; font-weight: 700;
                }
                .rp-grade-badge {
                    display: inline-block; padding: 4px 12px;
                    border-radius: 20px; font-size: 12px; font-weight: 800;
                    letter-spacing: 0.04em;
                }

                .rp-pct-bar {
                    display: flex; align-items: center; gap: 8px;
                }
                .rp-bar-track {
                    width: 60px; height: 4px; border-radius: 4px;
                    background: rgba(255,255,255,0.06); overflow: hidden;
                }
                .rp-bar-fill { height: 100%; border-radius: 4px; }

                .rp-empty {
                    text-align: center; padding: 48px;
                    color: #1e293b; font-size: 13px;
                }
            `}</style>

      <div className={`rp-root ${visible ? 'show' : ''}`}>

        <div className="rp-header">
          <div>
            <div className="rp-title">Results</div>
            <div className="rp-sub">{results.length} total report cards</div>
          </div>
          {results.length > 0 && (
            <div className="rp-actions">
              <button className="rp-btn rp-btn-blue" onClick={downloadAll} disabled={dlAll}>
                {dlAll ? `⏳ ${progress}` : `⬇ Download All (${results.length})`}
              </button>
              <button className="rp-btn rp-btn-red" onClick={deleteAll} disabled={delAll}>
                {delAll ? '⏳' : `🗑 Delete All`}
              </button>
            </div>
          )}
        </div>

        <div className="rp-search-wrap">
          <span className="rp-search-icon">⊙</span>
          <input className="rp-search" placeholder="Search student or exam…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="rp-table-wrap">
          {loading ? (
            <div className="rp-empty">Loading results…</div>
          ) : filtered.length === 0 ? (
            <div className="rp-empty">{search ? 'No results match.' : 'No results yet. Generate your first report card!'}</div>
          ) : (
            <table className="rp-table">
              <thead className="rp-thead">
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Exam</th>
                  <th>Marks</th>
                  <th>%</th>
                  <th>Grade</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody className="rp-tbody">
                {filtered.map((r, i) => {
                  const c = r.student?.course?.name || '—';
                  const color = COURSE_COLORS[c] || '#94a3b8';
                  const gs = GRADE_STYLE[r.final_grade] || GRADE_STYLE.D;
                  const pctColor = r.overall_pct >= 75 ? '#4ade80' : r.overall_pct >= 50 ? '#facc15' : '#f87171';
                  return (
                    <tr key={r.id}>
                      <td style={{ color: '#1e293b', fontSize: 11 }}>{i + 1}</td>
                      <td>
                        <div className="rp-name">{r.student?.name || '—'}</div>
                        <div className="rp-roll">{r.student?.roll_no || '—'}</div>
                      </td>
                      <td>
                        <span className="rp-badge" style={{ background: `${color}14`, color }}>
                          {c}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontSize: 12 }}>{r.exam_name}</td>
                      <td style={{ color: '#475569', fontSize: 12 }}>{r.total_obtained}/{r.total_max}</td>
                      <td>
                        <div className="rp-pct-bar">
                          <div className="rp-bar-track">
                            <div className="rp-bar-fill" style={{ width: `${r.overall_pct}%`, background: pctColor }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: pctColor }}>{r.overall_pct}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="rp-grade-badge" style={{ background: gs.bg, color: gs.color }}>
                          {r.final_grade}
                        </span>
                      </td>
                      <td>
                        <button
                          className="rp-btn rp-btn-blue"
                          style={{ padding: '6px 12px', fontSize: 11 }}
                          onClick={() => downloadPDF(r)}
                        >
                          ⬇ PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </>
  );
}