"use strict";(()=>{var e={};e.id=809,e.ids=[809],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},1017:e=>{e.exports=require("path")},4200:(e,t,i)=>{i.r(t),i.d(t,{originalPathname:()=>w,patchFetch:()=>z,requestAsyncStorage:()=>m,routeModule:()=>h,serverHooks:()=>y,staticGenerationAsyncStorage:()=>v});var r={};i.r(r),i.d(r,{POST:()=>u});var o=i(9303),d=i(8716),a=i(670),p=i(7070),n=i(5662);let s=require("@sparticuz/chromium");var l=i.n(s);let c=require("puppeteer-core");var f=i.n(c);let g=require("fs");var x=i(1017);async function b(e){let t=await f().launch({args:l().args,executablePath:await l().executablePath(),headless:!0});try{let i=await t.newPage();await i.setContent(e,{waitUntil:"networkidle0"});let r=await i.pdf({format:"A4",printBackground:!0,pageRanges:"1",margin:{top:"0mm",right:"0mm",bottom:"0mm",left:"0mm"}});return Buffer.from(r)}finally{await t.close()}}async function u(e){let t=await e.json(),i=function(e){let{student:t,institute:i,exam:r,marks:o,summary:d}=e,a="";try{let e=x.join(process.cwd(),"public","sharadalogo.png");g.existsSync(e)&&(a=g.readFileSync(e).toString("base64"))}catch{}let p=a?`data:image/png;base64,${a}`:"",n={A:"#15803d",B:"#1d4ed8",C:"#b45309",D:"#dc2626"},s={A:"#dcfce7",B:"#dbeafe",C:"#fef3c7",D:"#fee2e2"},l="A"===d.finalGrade?"Outstanding":"B"===d.finalGrade?"Good":"C"===d.finalGrade?"Satisfactory":"Needs Improvement",c=o.map(e=>{let t=Number(e.obtained)||0,i=Number(e.total)||100,r=i>0?Math.round(t/i*100):0;return{...e,obtained:t,total:i,pct:r,grade:r>=90?"A":r>=75?"B":r>=50?"C":"D"}}),f=c.reduce((e,t)=>e+t.obtained,0),b=c.reduce((e,t)=>e+t.total,0),u=b>0?Math.round(f/b*100):0,h=u>=90?"A":u>=75?"B":u>=50?"C":"D",m=c.reduce((e,t)=>t.pct>e.pct?t:e,c[0]),v=c.reduce((e,t)=>t.pct<e.pct?t:e,c[0]),y=c.map(e=>{let t=e.subject===m.subject,i=e.subject===v.subject,r=t?`<span style="background:#dcfce7;color:#15803d;font-size:10px;padding:3px 10px;border-radius:20px;font-weight:700;margin-left:10px">★ BEST</span>`:i?`<span style="background:#fee2e2;color:#dc2626;font-size:10px;padding:3px 10px;border-radius:20px;font-weight:700;margin-left:10px">▾ FOCUS</span>`:"",o=e.pct>=90?"#22c55e":e.pct>=75?"#3b82f6":e.pct>=50?"#f59e0b":"#ef4444";return`
      <tr style="background:${t?"#f0fdf4":i?"#fff7f7":"#ffffff"};border-left:${t?"4px solid #22c55e":i?"4px solid #ef4444":"4px solid transparent"}">
        <td style="padding:14px 18px;font-weight:600;font-size:15px;color:#1e293b;border-bottom:1px solid #f1f5f9">
          ${e.subject}${r}
        </td>
        <td style="padding:14px 18px;text-align:center;font-size:15px;font-weight:700;color:#334155;border-bottom:1px solid #f1f5f9">${e.obtained}</td>
        <td style="padding:14px 18px;text-align:center;font-size:15px;color:#64748b;border-bottom:1px solid #f1f5f9">${e.total}</td>
        <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="flex:1;background:#e2e8f0;border-radius:6px;height:10px;overflow:hidden;min-width:80px">
              <div style="width:${e.pct}%;background:${o};height:100%;border-radius:6px"></div>
            </div>
            <span style="font-size:14px;font-weight:700;color:${n[e.grade]};min-width:44px">${e.pct}%</span>
          </div>
        </td>
        <td style="padding:14px 18px;text-align:center;border-bottom:1px solid #f1f5f9">
          <span style="background:${s[e.grade]};color:${n[e.grade]};font-weight:800;font-size:16px;padding:5px 16px;border-radius:20px">${e.grade}</span>
        </td>
      </tr>
    `}).join(""),w=c.map(e=>`
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center">
      <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">${e.subject}</div>
      <div style="font-size:22px;font-weight:800;color:${n[e.grade]}">${e.pct}%</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:4px">${e.obtained}/${e.total}</div>
      <div style="margin-top:8px;background:#e2e8f0;border-radius:4px;height:6px;overflow:hidden">
        <div style="width:${e.pct}%;background:${e.pct>=75?"#22c55e":e.pct>=50?"#f59e0b":"#ef4444"};height:100%;border-radius:4px"></div>
      </div>
    </div>
  `).join(""),z=u>=75?`${t.name} has demonstrated excellent academic performance. ${m.subject} is the strongest subject with ${m.pct}%. Keep up the great work!`:u>=50?`${t.name} has shown satisfactory performance. Focus more on ${v.subject} (${v.pct}%) to improve overall results. Consistent effort will lead to better outcomes.`:`${t.name} needs to put in more effort. Significant improvement is required in ${v.subject} (${v.pct}%). Regular practice and guidance from teachers is strongly recommended.`,$=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});return`<!DOCTYPE html>
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
    ${p?`<img src="${p}" alt="Sharada Classes" style="width:80px;height:80px;object-fit:contain;border-radius:10px;background:white;padding:5px;flex-shrink:0;box-shadow:0 4px 16px rgba(0,0,0,0.4)" />`:`<div style="width:80px;height:80px;background:rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;border:2px solid rgba(255,255,255,0.3);flex-shrink:0">🎓</div>`}
    <div style="flex:1">
      <div style="font-size:11px;color:rgba(255,255,255,0.55);letter-spacing:0.18em;text-transform:uppercase;margin-bottom:3px">Mehendale's</div>
      <div style="font-size:28px;font-weight:900;color:white;letter-spacing:0.01em;line-height:1">Sharada Classes</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:5px">${i.address} &nbsp;\xb7&nbsp; ${i.phone} &nbsp;\xb7&nbsp; ${i.email}</div>
    </div>
    <div style="text-align:right;flex-shrink:0">
      <div style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:12px;padding:12px 18px">
        <div style="font-size:9px;color:rgba(255,255,255,0.55);letter-spacing:0.14em;text-transform:uppercase">Report Card</div>
        <div style="font-size:16px;font-weight:800;color:white;margin-top:3px">${r}</div>
        <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:3px">Batch ${t.batch}</div>
        <div style="font-size:9px;color:rgba(255,255,255,0.4);margin-top:2px">${$}</div>
      </div>
    </div>
  </div>

  <!-- Orange stripe -->
  <div style="height:5px;background:linear-gradient(90deg,#f97316,#fbbf24,#f97316)"></div>

  <!-- STUDENT INFO -->
  <div style="background:#f8fafc;border-bottom:2px solid #e2e8f0;padding:16px 32px;display:grid;grid-template-columns:repeat(4,1fr);gap:0">
    <div style="border-right:1px solid #e2e8f0;padding-right:20px">
      <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em">Student Name</div>
      <div style="font-size:17px;font-weight:800;color:#0f172a;margin-top:4px">${t.name}</div>
    </div>
    <div style="border-right:1px solid #e2e8f0;padding:0 20px">
      <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em">Roll Number</div>
      <div style="font-size:17px;font-weight:800;color:#0f172a;margin-top:4px">${t.roll}</div>
    </div>
    <div style="border-right:1px solid #e2e8f0;padding:0 20px">
      <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em">Course</div>
      <div style="font-size:17px;font-weight:800;color:#0f172a;margin-top:4px">${t.course}</div>
    </div>
    <div style="padding-left:20px">
      <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em">Academic Batch</div>
      <div style="font-size:17px;font-weight:800;color:#0f172a;margin-top:4px">${t.batch}</div>
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
      <tbody style="border:1px solid #e2e8f0;border-top:none">${y}</tbody>
    </table>
  </div>

  <!-- SUBJECT MINI CARDS -->
  <div style="padding:16px 32px 0">
    <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:10px">Score Overview</div>
    <div style="display:grid;grid-template-columns:repeat(${c.length},1fr);gap:10px">
      ${w}
    </div>
  </div>

  <!-- RESULT SUMMARY -->
  <div style="padding:16px 32px 0;display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:12px">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px 18px">
      <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em">Total Marks</div>
      <div style="font-size:32px;font-weight:900;color:#0f172a;margin-top:5px;line-height:1">${f}</div>
      <div style="font-size:12px;color:#94a3b8;margin-top:3px">out of ${b}</div>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px 18px">
      <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em">Percentage</div>
      <div style="font-size:32px;font-weight:900;color:#0f172a;margin-top:5px;line-height:1">${u}%</div>
      <div style="font-size:12px;color:#94a3b8;margin-top:3px">overall score</div>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:16px 18px">
      <div style="font-size:9px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.1em">★ Best Subject</div>
      <div style="font-size:18px;font-weight:800;color:#14532d;margin-top:5px;line-height:1.2">${m.subject}</div>
      <div style="font-size:12px;color:#15803d;margin-top:3px">${m.pct}% \xb7 Grade ${m.grade}</div>
    </div>
    <div style="background:linear-gradient(135deg,${n[h]},${"A"===h?"#16a34a":"B"===h?"#1d4ed8":"C"===h?"#d97706":"#dc2626"});border-radius:14px;padding:16px 22px;text-align:center;min-width:100px;display:flex;flex-direction:column;justify-content:center">
      <div style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.1em">Final Grade</div>
      <div style="font-size:48px;font-weight:900;color:white;line-height:1;margin-top:4px">${h}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.8);margin-top:5px">${l}</div>
    </div>
  </div>

  <!-- PERFORMANCE REMARK -->
  <div style="padding:14px 32px 0">
    <div style="background:#f8fafc;border-left:5px solid #1d4ed8;border-radius:0 12px 12px 0;padding:14px 18px">
      <div style="font-size:10px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:5px">Teacher's Remark</div>
      <div style="font-size:13px;color:#475569;line-height:1.7">${z}</div>
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
        Generated by <strong style="color:#94a3b8">Sharada ResultPro</strong> \xb7 Developed by <strong style="color:#94a3b8">Saad Sahebwale</strong>
      </div>
    </div>

    <div style="text-align:center;width:180px">
      <div style="padding:8px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc">
        <div style="font-size:11px;color:#475569;font-weight:600;letter-spacing:0.5px">🔒 Sharada Verified</div>
      </div>
    </div>

</div>
</body>
</html>`}(t),r=await b(i),o=`${t.student.name.replace(/\s+/g,"_")}_${t.student.course}_${Date.now()}.pdf`,{data:d,error:a}=await n.p.storage.from("result-pdfs").upload(o,r,{contentType:"application/pdf",upsert:!1});if(a&&console.error("Storage upload failed:",a),t.resultId&&d){let{data:e}=n.p.storage.from("result-pdfs").getPublicUrl(o);await n.p.from("results").update({pdf_url:e.publicUrl}).eq("id",t.resultId)}let s=`${t.student.name.replace(/\s+/g,"_")}_${t.student.course}_Result.pdf`;return new p.NextResponse(r,{status:200,headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${s}"`,"Content-Length":r.length.toString()}})}let h=new o.AppRouteRouteModule({definition:{kind:d.x.APP_ROUTE,page:"/api/pdf/route",pathname:"/api/pdf",filename:"route",bundlePath:"app/api/pdf/route"},resolvedPagePath:"E:\\CRAX DEVELOPER\\sharada resultpro\\app\\api\\pdf\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:m,staticGenerationAsyncStorage:v,serverHooks:y}=h,w="/api/pdf/route";function z(){return(0,a.patchFetch)({serverHooks:y,staticGenerationAsyncStorage:v})}},5662:(e,t,i)=>{i.d(t,{p:()=>d});var r=i(8336);let o="https://xufutgfscdkcssyyjhyx.supabase.co";(0,r.eI)(o,"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZnV0Z2ZzY2RrY3NzeXlqaHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzE3NTcsImV4cCI6MjA5MTQwNzc1N30.4OOOE1T6E0pDMmsiAcN3T0fBN7NSA6YpK49IOHncpik");let d=(0,r.eI)(o,process.env.SUPABASE_SERVICE_ROLE_KEY)}};var t=require("../../../webpack-runtime.js");t.C(e);var i=e=>t(t.s=e),r=t.X(0,[948,972,336],()=>i(4200));module.exports=r})();