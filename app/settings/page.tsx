'use client';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
    const [name, setName] = useState('Sharada Classes');
    const [address, setAddress] = useState('Main Road, Dapoli, Ratnagiri – 415 712');
    const [phone, setPhone] = useState('+91 98765 43210');
    const [email, setEmail] = useState('info@sharadaclasses.in');
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

    async function handleSave() {
        setSaving(true);
        await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, address, phone, email }) });
        setSaving(false); setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }

    const fields = [
        { label: 'Institute Name', value: name, set: setName, placeholder: 'e.g. Sharada Classes', icon: '◈' },
        { label: 'Address', value: address, set: setAddress, placeholder: 'Full address', icon: '◉' },
        { label: 'Phone', value: phone, set: setPhone, placeholder: '+91 XXXXX XXXXX', icon: '◎' },
        { label: 'Email', value: email, set: setEmail, placeholder: 'info@institute.in', icon: '◆' },
    ];

    return (
        <>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
            .sp2-root { font-family:'Inter',sans-serif; color:#f1f5f9; max-width:560px; opacity:0; transform:translateY(16px); transition:opacity .5s ease,transform .5s ease; }
            .sp2-root.show { opacity:1; transform:translateY(0); }
            .sp2-title { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; letter-spacing:-.03em; }
            .sp2-sub { font-size:12px; color:#334155; margin-top:3px; }
            .sp2-card { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); border-radius:18px; padding:24px; }
            .sp2-field { margin-bottom:18px; }
            .sp2-label { font-size:9.5px; font-weight:700; color:#1e293b; text-transform:uppercase; letter-spacing:.1em; display:flex; align-items:center; gap:6px; margin-bottom:7px; }
            .sp2-label-icon { font-size:11px; color:#334155; }
            .sp2-inp {
                width:100%; background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07);
                border-radius:12px; padding:12px 16px; font-size:13.5px; color:#e2e8f0;
                font-family:'Inter',sans-serif; outline:none; transition:all .2s;
            }
            .sp2-inp:focus { border-color:rgba(249,115,22,.4); background:rgba(249,115,22,.02); box-shadow:0 0 0 3px rgba(249,115,22,.05); }
            .sp2-inp::placeholder { color:#1e293b; }
            .sp2-divider { height:1px; background:rgba(255,255,255,.04); margin:20px 0; }
            .sp2-btn {
                width:100%; border:none; border-radius:12px; padding:14px;
                font-size:14px; font-weight:700; font-family:'Inter',sans-serif;
                cursor:pointer; transition:all .2s; position:relative; overflow:hidden;
            }
            .sp2-btn-default { background:#f97316; color:white; box-shadow:0 4px 16px rgba(249,115,22,.25); }
            .sp2-btn-default:hover:not(:disabled) { background:#ea580c; transform:translateY(-2px); box-shadow:0 8px 24px rgba(249,115,22,.3); }
            .sp2-btn-saved { background:#16a34a; color:white; box-shadow:0 4px 16px rgba(34,197,94,.25); }
            .sp2-btn:disabled { opacity:.6; cursor:not-allowed; }
            .sp2-info { background:rgba(59,130,246,.05); border:1px solid rgba(59,130,246,.1); border-radius:12px; padding:14px 16px; margin-top:16px; }
            .sp2-info-title { font-size:10px; font-weight:700; color:#334155; text-transform:uppercase; letter-spacing:.1em; margin-bottom:6px; }
            .sp2-info-text { font-size:12px; color:#1e293b; line-height:1.6; }
            .sp2-info-text b { color:#334155; }
        `}</style>
            <div className={`sp2-root ${visible ? 'show' : ''}`}>
                <div style={{ marginBottom: 24 }}>
                    <div className="sp2-title">Settings</div>
                    <div className="sp2-sub">Manage institute information shown on all report cards</div>
                </div>

                <div className="sp2-card">
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 18 }}>Institute Details</div>

                    {fields.map(f => (
                        <div key={f.label} className="sp2-field">
                            <label className="sp2-label">
                                <span className="sp2-label-icon">{f.icon}</span>
                                {f.label}
                            </label>
                            <input className="sp2-inp" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
                        </div>
                    ))}

                    <div className="sp2-divider" />

                    <button className={`sp2-btn ${saved ? 'sp2-btn-saved' : 'sp2-btn-default'}`} onClick={handleSave} disabled={saving}>
                        {saved ? '✓ Saved Successfully' : saving ? 'Saving…' : 'Save Settings'}
                    </button>

                    <div className="sp2-info" style={{ marginTop: 16 }}>
                        <div className="sp2-info-title">Where this appears</div>
                        <div className="sp2-info-text">
                            This information appears on <b>every PDF report card</b> generated by the system — institute name, address, phone and email are all printed in the report header.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}