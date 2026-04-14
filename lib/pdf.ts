import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import type { ReportCardData } from '@/types';
import * as fs from 'fs';
import * as path from 'path';

export async function generateReportPDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      pageRanges: '1',
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export function buildReportHTML(data: ReportCardData): string {
  const { student, institute, exam, marks, summary } = data;

  // ── logo ──────────────────────────────────────────────────
  let logoBase64 = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'sharadalogo.png');
    if (fs.existsSync(logoPath)) {
      logoBase64 = fs.readFileSync(logoPath).toString('base64');
    }
  } catch { }
  const logoSrc = logoBase64 ? `data:image/png;base64,${logoBase64}` : '';

  // ── helpers ───────────────────────────────────────────────
  const gradeColors: Record<string, string> = {
    A: '#15803d', B: '#1d4ed8', C: '#b45309', D: '#dc2626',
  };
  const gradeBg: Record<string, string> = {
    A: '#dcfce7', B: '#dbeafe', C: '#fef3c7', D: '#fee2e2',
  };
  const gradeLabel =
    summary.finalGrade === 'A' ? 'Outstanding' :
      summary.finalGrade === 'B' ? 'Good' :
        summary.finalGrade === 'C' ? 'Satisfactory' : 'Needs Improvement';

  // ── make sure marks pct/grade are correct ─────────────────
  const fixedMarks = marks.map(m => {
    const obtained = Number(m.obtained) || 0;
    const total = Number(m.total) || 100;
    const pct = total > 0 ? Math.round((obtained / total) * 100) : 0;
    const grade =
      pct >= 90 ? 'A' :
        pct >= 75 ? 'B' :
          pct >= 50 ? 'C' : 'D';
    return { ...m, obtained, total, pct, grade };
  });

  // ── recalculate summary from fixed marks ──────────────────
  const totalObtained = fixedMarks.reduce((s, m) => s + m.obtained, 0);
  const totalMax = fixedMarks.reduce((s, m) => s + m.total, 0);
  const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
  const finalGrade =
    overallPct >= 90 ? 'A' :
      overallPct >= 75 ? 'B' :
        overallPct >= 50 ? 'C' : 'D';
  const bestSubject = fixedMarks.reduce((b, m) => m.pct > b.pct ? m : b, fixedMarks[0]);
  const weakSubject = fixedMarks.reduce((w, m) => m.pct < w.pct ? m : w, fixedMarks[0]);

  // ── table rows ────────────────────────────────────────────
  const rows = fixedMarks.map(m => {
    const isBest = m.subject === bestSubject.subject;
    const isWeak = m.subject === weakSubject.subject;
    const rowBg = isBest ? '#f0fdf4' : isWeak ? '#fff7f7' : '#ffffff';
    const leftBorder = isBest ? '4px solid #22c55e' : isWeak ? '4px solid #ef4444' : '4px solid transparent';
    const badge = isBest
      ? `<span style="background:#dcfce7;color:#15803d;font-size:10px;padding:3px 10px;border-radius:20px;font-weight:700;margin-left:10px">★ BEST</span>`
      : isWeak
        ? `<span style="background:#fee2e2;color:#dc2626;font-size:10px;padding:3px 10px;border-radius:20px;font-weight:700;margin-left:10px">▾ FOCUS</span>`
        : '';
    const barColor = m.pct >= 90 ? '#22c55e' : m.pct >= 75 ? '#3b82f6' : m.pct >= 50 ? '#f59e0b' : '#ef4444';

    return `
      <tr style="background:${rowBg};border-left:${leftBorder}">
        <td style="padding:14px 18px;font-weight:600;font-size:15px;color:#1e293b;border-bottom:1px solid #f1f5f9">
          ${m.subject}${badge}
        </td>
        <td style="padding:14px 18px;text-align:center;font-size:15px;font-weight:700;color:#334155;border-bottom:1px solid #f1f5f9">${m.obtained}</td>
        <td style="padding:14px 18px;text-align:center;font-size:15px;color:#64748b;border-bottom:1px solid #f1f5f9">${m.total}</td>
        <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="flex:1;background:#e2e8f0;border-radius:6px;height:10px;overflow:hidden;min-width:80px">
              <div style="width:${m.pct}%;background:${barColor};height:100%;border-radius:6px"></div>
            </div>
            <span style="font-size:14px;font-weight:700;color:${gradeColors[m.grade]};min-width:44px">${m.pct}%</span>
          </div>
        </td>
        <td style="padding:14px 18px;text-align:center;border-bottom:1px solid #f1f5f9">
          <span style="background:${gradeBg[m.grade]};color:${gradeColors[m.grade]};font-weight:800;font-size:16px;padding:5px 16px;border-radius:20px">${m.grade}</span>
        </td>
      </tr>
    `;
  }).join('');

  // ── subject mini cards ────────────────────────────────────
  const subjectBreakdown = fixedMarks.map(m => `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center">
      <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">${m.subject}</div>
      <div style="font-size:22px;font-weight:800;color:${gradeColors[m.grade]}">${m.pct}%</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:4px">${m.obtained}/${m.total}</div>
      <div style="margin-top:8px;background:#e2e8f0;border-radius:4px;height:6px;overflow:hidden">
        <div style="width:${m.pct}%;background:${m.pct >= 75 ? '#22c55e' : m.pct >= 50 ? '#f59e0b' : '#ef4444'};height:100%;border-radius:4px"></div>
      </div>
    </div>
  `).join('');

  // ── performance remark ────────────────────────────────────
  const performanceSummary =
    overallPct >= 75
      ? `${student.name} has demonstrated excellent academic performance. ${bestSubject.subject} is the strongest subject with ${bestSubject.pct}%. Keep up the great work!`
      : overallPct >= 50
        ? `${student.name} has shown satisfactory performance. Focus more on ${weakSubject.subject} (${weakSubject.pct}%) to improve overall results. Consistent effort will lead to better outcomes.`
        : `${student.name} needs to put in more effort. Significant improvement is required in ${weakSubject.subject} (${weakSubject.pct}%). Regular practice and guidance from teachers is strongly recommended.`;

  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family:'Outfit','Arial',sans-serif;
    background:white;
    color:#1e293b;
    width:210mm;
    height:297mm;
    overflow:hidden;
  }
  .page {
    width:210mm;
    height:297mm;
    display:flex;
    flex-direction:column;
    background:white;
  }
  table { border-collapse:collapse; width:100%; }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#1d4ed8 100%);padding:24px 32px;display:flex;align-items:center;gap:20px;position:relative;overflow:hidden">
    <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,0.04)"></div>
    <div style="position:absolute;bottom:-30px;right:100px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.03)"></div>
    ${logoSrc
      ? `<img src="${logoSrc}" alt="Sharada Classes" style="width:80px;height:80px;object-fit:contain;border-radius:10px;background:white;padding:5px;flex-shrink:0;box-shadow:0 4px 16px rgba(0,0,0,0.4)" />`
      : `<div style="width:80px;height:80px;background:rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;border:2px solid rgba(255,255,255,0.3);flex-shrink:0">🎓</div>`
    }
    <div style="flex:1">
      <div style="font-size:11px;color:rgba(255,255,255,0.55);letter-spacing:0.18em;text-transform:uppercase;margin-bottom:3px">Mehendale's</div>
      <div style="font-size:28px;font-weight:900;color:white;letter-spacing:0.01em;line-height:1">Sharada Classes</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:5px">${institute.address} &nbsp;·&nbsp; ${institute.phone} &nbsp;·&nbsp; ${institute.email}</div>
    </div>
    <div style="text-align:right;flex-shrink:0">
      <div style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:12px;padding:12px 18px">
        <div style="font-size:9px;color:rgba(255,255,255,0.55);letter-spacing:0.14em;text-transform:uppercase">Report Card</div>
        <div style="font-size:16px;font-weight:800;color:white;margin-top:3px">${exam}</div>
        <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:3px">Batch ${student.batch}</div>
        <div style="font-size:9px;color:rgba(255,255,255,0.4);margin-top:2px">${date}</div>
      </div>
    </div>
  </div>

  <!-- Orange stripe -->
  <div style="height:5px;background:linear-gradient(90deg,#f97316,#fbbf24,#f97316)"></div>

  <!-- STUDENT INFO -->
  <div style="background:#f8fafc;border-bottom:2px solid #e2e8f0;padding:16px 32px;display:grid;grid-template-columns:repeat(4,1fr);gap:0">
    <div style="border-right:1px solid #e2e8f0;padding-right:20px">
      <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em">Student Name</div>
      <div style="font-size:17px;font-weight:800;color:#0f172a;margin-top:4px">${student.name}</div>
    </div>
    <div style="border-right:1px solid #e2e8f0;padding:0 20px">
      <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em">Roll Number</div>
      <div style="font-size:17px;font-weight:800;color:#0f172a;margin-top:4px">${student.roll}</div>
    </div>
    <div style="border-right:1px solid #e2e8f0;padding:0 20px">
      <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em">Course</div>
      <div style="font-size:17px;font-weight:800;color:#0f172a;margin-top:4px">${student.course}</div>
    </div>
    <div style="padding-left:20px">
      <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em">Academic Batch</div>
      <div style="font-size:17px;font-weight:800;color:#0f172a;margin-top:4px">${student.batch}</div>
    </div>
  </div>

  <!-- MARKS TABLE -->
  <div style="padding:20px 32px 0">
    <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:10px">Subject-wise Performance</div>
    <table>
      <thead>
        <tr style="background:#0f172a">
          <th style="padding:13px 18px;text-align:left;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.1em;text-transform:uppercase;width:35%">Subject</th>
          <th style="padding:13px 18px;text-align:center;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.1em;text-transform:uppercase">Marks Obtained</th>
          <th style="padding:13px 18px;text-align:center;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.1em;text-transform:uppercase">Out Of</th>
          <th style="padding:13px 18px;text-align:center;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.1em;text-transform:uppercase;width:30%">Progress</th>
          <th style="padding:13px 18px;text-align:center;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.1em;text-transform:uppercase">Grade</th>
        </tr>
      </thead>
      <tbody style="border:1px solid #e2e8f0;border-top:none">${rows}</tbody>
    </table>
  </div>

  <!-- SUBJECT MINI CARDS -->
  <div style="padding:16px 32px 0">
    <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:10px">Score Overview</div>
    <div style="display:grid;grid-template-columns:repeat(${fixedMarks.length},1fr);gap:10px">
      ${subjectBreakdown}
    </div>
  </div>

  <!-- RESULT SUMMARY -->
  <div style="padding:16px 32px 0;display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:12px">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px 18px">
      <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em">Total Marks</div>
      <div style="font-size:32px;font-weight:900;color:#0f172a;margin-top:5px;line-height:1">${totalObtained}</div>
      <div style="font-size:12px;color:#94a3b8;margin-top:3px">out of ${totalMax}</div>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px 18px">
      <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em">Percentage</div>
      <div style="font-size:32px;font-weight:900;color:#0f172a;margin-top:5px;line-height:1">${overallPct}%</div>
      <div style="font-size:12px;color:#94a3b8;margin-top:3px">overall score</div>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:16px 18px">
      <div style="font-size:9px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.1em">★ Best Subject</div>
      <div style="font-size:18px;font-weight:800;color:#14532d;margin-top:5px;line-height:1.2">${bestSubject.subject}</div>
      <div style="font-size:12px;color:#15803d;margin-top:3px">${bestSubject.pct}% · Grade ${bestSubject.grade}</div>
    </div>
    <div style="background:linear-gradient(135deg,${gradeColors[finalGrade]},${finalGrade === 'A' ? '#16a34a' :
      finalGrade === 'B' ? '#1d4ed8' :
        finalGrade === 'C' ? '#d97706' : '#dc2626'
    });border-radius:14px;padding:16px 22px;text-align:center;min-width:100px;display:flex;flex-direction:column;justify-content:center">
      <div style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.1em">Final Grade</div>
      <div style="font-size:48px;font-weight:900;color:white;line-height:1;margin-top:4px">${finalGrade}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.8);margin-top:5px">${gradeLabel}</div>
    </div>
  </div>

  <!-- PERFORMANCE REMARK -->
  <div style="padding:14px 32px 0">
    <div style="background:#f8fafc;border-left:5px solid #1d4ed8;border-radius:0 12px 12px 0;padding:14px 18px">
      <div style="font-size:10px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:5px">Teacher's Remark</div>
      <div style="font-size:13px;color:#475569;line-height:1.7">${performanceSummary}</div>
    </div>
  </div>

  <!-- GRADE LEGEND -->
  <div style="padding:14px 32px 0">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 18px;display:flex;align-items:center;gap:24px">
      <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em">Grade Scale:</div>
      <div style="display:flex;gap:20px">
        <span style="font-size:12px;color:#15803d;font-weight:600">A = 90%+ (Outstanding)</span>
        <span style="font-size:12px;color:#1d4ed8;font-weight:600">B = 75–89% (Good)</span>
        <span style="font-size:12px;color:#b45309;font-weight:600">C = 50–74% (Satisfactory)</span>
        <span style="font-size:12px;color:#dc2626;font-weight:600">D = Below 50%</span>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div style="margin-top:auto;padding:14px 32px;border-top:2px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center">
    
    <div style="text-align:center;width:180px">
      <div style="padding:8px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc">
        <div style="font-size:11px;color:#475569;font-weight:600;letter-spacing:0.5px">✔ Truly Authentic</div>
      </div>
    </div>

    <div style="text-align:center">
      <div style="font-size:11px;color:#94a3b8;font-weight:500">Sharada Classes, Dapoli</div>
      <div style="font-size:10px;color:#cbd5e1;margin-top:2px">
        Generated by <strong style="color:#94a3b8">Sharada ResultPro</strong> · Developed by <strong style="color:#94a3b8">Saad Sahebwale</strong>
      </div>
    </div>

    <div style="text-align:center;width:180px">
      <div style="padding:8px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc">
        <div style="font-size:11px;color:#475569;font-weight:600;letter-spacing:0.5px">🔒 Sharada Verified</div>
      </div>
    </div>

</div>
</body>
</html>`;
}