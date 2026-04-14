'use client';

import { useState } from 'react';

export default function SettingsPage() {
    const [name, setName] = useState('Sharada Classes');
    const [address, setAddress] = useState('Main Road, Dapoli, Ratnagiri – 415 712');
    const [phone, setPhone] = useState('+91 98765 43210');
    const [email, setEmail] = useState('info@sharadaclasses.in');
    const [saved, setSaved] = useState(false);

    async function handleSave() {
        await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, address, phone, email }),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }

    return (
        <div className="text-white max-w-2xl">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">⚙️ Settings</h1>
                <p className="text-gray-400 mt-1">Manage your institute information</p>
            </div>

            {/* Form */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">

                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Institute Name</label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Address</label>
                    <input
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Phone</label>
                    <input
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Email</label>
                    <input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                    />
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition"
                >
                    {saved ? '✅ Saved!' : 'Save Settings'}
                </button>

            </div>
        </div>
    );
}