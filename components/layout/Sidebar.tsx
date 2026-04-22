'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const mainLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '▣', desc: 'Overview' },
    { href: '/students', label: 'Students', icon: '◉', desc: 'Manage' },
    { href: '/results', label: 'Results', icon: '◈', desc: 'Reports' },
    { href: '/results/generate', label: 'Generate', icon: '◆', desc: 'New result' },
    { href: '/courses', label: 'Courses', icon: '◎', desc: 'Subjects' },
    { href: '/bulk-import', label: 'Bulk Import', icon: '⊞', desc: 'Excel' },
];

const schoolLinks = [
    { href: '/school', label: 'School Section', icon: '◐', desc: 'Class 5–10' },
];

const systemLinks = [
    { href: '/settings', label: 'Settings', icon: '◍', desc: 'Config' },
];

export default function Sidebar() {
    const pathname = usePathname();

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
                .sb-root { position:fixed; top:0; left:0; height:100vh; width:220px; background:#080c14; border-right:1px solid rgba(255,255,255,.04); display:flex; flex-direction:column; z-index:50; font-family:'Inter',sans-serif; }
                .sb-top { padding:20px 16px 18px; border-bottom:1px solid rgba(255,255,255,.04); display:flex; align-items:center; gap:10px; }
                .sb-logo-wrap { width:36px; height:36px; flex-shrink:0; border-radius:10px; overflow:hidden; border:1px solid rgba(249,115,22,.2); box-shadow:0 0 16px rgba(249,115,22,.1); }
                .sb-brand { flex:1; min-width:0; }
                .sb-brand-name { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#f1f5f9; letter-spacing:-.01em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
                .sb-brand-sub { font-size:9.5px; color:#374151; font-weight:500; letter-spacing:.06em; text-transform:uppercase; margin-top:1px; }
                .sb-nav { flex:1; padding:12px 10px; overflow-y:auto; }
                .sb-nav::-webkit-scrollbar { display:none; }
                .sb-section-label { font-size:9px; font-weight:700; color:#1e293b; letter-spacing:.14em; text-transform:uppercase; padding:0 8px; margin:10px 0 4px; }
                .sb-link { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:10px; cursor:pointer; text-decoration:none; transition:all .18s ease; margin-bottom:2px; position:relative; overflow:hidden; border:1px solid transparent; }
                .sb-link:hover { background:rgba(255,255,255,.04); border-color:rgba(255,255,255,.04); }
                .sb-link.active { background:rgba(249,115,22,.08); border-color:rgba(249,115,22,.15); }
                .sb-link.active::before { content:''; position:absolute; left:0; top:20%; bottom:20%; width:2px; border-radius:2px; background:#f97316; }
                .sb-link.school-active { background:rgba(99,102,241,.08); border-color:rgba(99,102,241,.15); }
                .sb-link.school-active::before { content:''; position:absolute; left:0; top:20%; bottom:20%; width:2px; border-radius:2px; background:#6366f1; }
                .sb-icon { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; transition:all .18s; background:rgba(255,255,255,.04); color:#475569; }
                .sb-link.active .sb-icon { background:rgba(249,115,22,.15); color:#f97316; }
                .sb-link.school-active .sb-icon { background:rgba(99,102,241,.15); color:#818cf8; }
                .sb-link:hover .sb-icon { background:rgba(255,255,255,.07); color:#94a3b8; }
                .sb-text { flex:1; }
                .sb-label { font-size:12.5px; font-weight:500; color:#475569; line-height:1.2; transition:color .18s; }
                .sb-link.active .sb-label { color:#f1f5f9; font-weight:600; }
                .sb-link.school-active .sb-label { color:#f1f5f9; font-weight:600; }
                .sb-link:hover .sb-label { color:#94a3b8; }
                .sb-desc { font-size:9.5px; color:#1e293b; font-weight:400; margin-top:1px; transition:color .18s; }
                .sb-link.active .sb-desc { color:#f97316; opacity:.7; }
                .sb-link.school-active .sb-desc { color:#818cf8; opacity:.7; }
                .sb-link:hover .sb-desc { color:#374151; }
                .sb-bottom { padding:12px 10px; border-top:1px solid rgba(255,255,255,.04); }
                .sb-logout { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:10px; cursor:pointer; width:100%; border:1px solid transparent; background:transparent; transition:all .18s; }
                .sb-logout:hover { background:rgba(239,68,68,.06); border-color:rgba(239,68,68,.1); }
                .sb-logout-icon { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:12px; background:rgba(239,68,68,.08); color:#ef4444; transition:all .18s; }
                .sb-logout:hover .sb-logout-icon { background:rgba(239,68,68,.15); }
                .sb-logout-text { font-size:12.5px; font-weight:500; color:#7f1d1d; transition:color .18s; }
                .sb-logout:hover .sb-logout-text { color:#fca5a5; }
                .sb-dev { text-align:center; margin-top:10px; font-size:9.5px; color:#111827; letter-spacing:.04em; }
                .sb-dev span { color:#374151; font-weight:600; }
                .status-dot { width:6px; height:6px; border-radius:50%; background:#22c55e; box-shadow:0 0 6px rgba(34,197,94,.5); flex-shrink:0; animation:statusPulse 2s ease-in-out infinite; }
                @keyframes statusPulse { 0%,100%{box-shadow:0 0 6px rgba(34,197,94,.5);} 50%{box-shadow:0 0 12px rgba(34,197,94,.8);} }
                .sb-school-pill { display:inline-block; background:rgba(99,102,241,.12); border:1px solid rgba(99,102,241,.2); color:#818cf8; font-size:8px; font-weight:700; padding:1px 6px; border-radius:8px; margin-left:4px; letter-spacing:.04em; vertical-align:middle; }
            `}</style>

            <aside className="sb-root">
                <div className="sb-top">
                    <div className="sb-logo-wrap">
                        <Image src="/sharadalogo.png" alt="Sharada" width={36} height={36} className="object-contain" />
                    </div>
                    <div className="sb-brand">
                        <div className="sb-brand-name">ResultPro</div>
                        <div className="sb-brand-sub">Sharada Classes</div>
                    </div>
                    <div className="status-dot" title="System Online" />
                </div>

                <nav className="sb-nav">
                    <div className="sb-section-label">Main</div>
                    {mainLinks.map(link => {
                        const active = pathname === link.href;
                        return (
                            <Link key={link.href} href={link.href} className={`sb-link ${active ? 'active' : ''}`}>
                                <div className="sb-icon">{link.icon}</div>
                                <div className="sb-text">
                                    <div className="sb-label">{link.label}</div>
                                    <div className="sb-desc">{link.desc}</div>
                                </div>
                            </Link>
                        );
                    })}

                    <div className="sb-section-label" style={{ marginTop: 14 }}>School</div>
                    {schoolLinks.map(link => {
                        const active = pathname === link.href || pathname.startsWith(link.href + '/');
                        return (
                            <Link key={link.href} href={link.href} className={`sb-link ${active ? 'school-active' : ''}`}>
                                <div className="sb-icon">{link.icon}</div>
                                <div className="sb-text">
                                    <div className="sb-label">{link.label} <span className="sb-school-pill">NEW</span></div>
                                    <div className="sb-desc">{link.desc}</div>
                                </div>
                            </Link>
                        );
                    })}

                    <div className="sb-section-label" style={{ marginTop: 14 }}>System</div>
                    {systemLinks.map(link => {
                        const active = pathname === link.href;
                        return (
                            <Link key={link.href} href={link.href} className={`sb-link ${active ? 'active' : ''}`}>
                                <div className="sb-icon">{link.icon}</div>
                                <div className="sb-text">
                                    <div className="sb-label">{link.label}</div>
                                    <div className="sb-desc">{link.desc}</div>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="sb-bottom">
                    <button className="sb-logout" onClick={handleLogout}>
                        <div className="sb-logout-icon">⏻</div>
                        <div className="sb-logout-text">Sign Out</div>
                    </button>
                    <div className="sb-dev">by <span>Saad Sahebwale</span></div>
                </div>
            </aside>
        </>
    );
}