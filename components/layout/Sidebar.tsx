'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/students', label: 'Students', icon: '👨‍🎓' },
    { href: '/results', label: 'Results', icon: '📄' },
    { href: '/results/generate', label: 'Generate Result', icon: '✏️' },
    { href: '/courses', label: 'Courses', icon: '📊' },
    { href: '/bulk-import', label: 'Bulk Import', icon: '📥' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
    const pathname = usePathname();
    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    }
    return (
        <aside className="fixed top-0 left-0 h-screen w-56 bg-gray-900 border-r border-gray-800 flex flex-col z-50">
            <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                <Image src="/sharadalogo.png" alt="Sharada Classes" width={40} height={40} className="object-contain rounded" />
                <div>
                    <p className="text-sm font-bold text-white leading-tight">ResultPro</p>
                    <p className="text-xs text-gray-500 leading-tight">Sharada Classes</p>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {links.map(link => {
                    const active = pathname === link.href;
                    return (
                        <Link key={link.href} href={link.href}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                                ${active ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                            <span>{link.icon}</span>
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-800 space-y-3">
                <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all">
                    <span>🔒</span>
                    <span>Logout</span>
                </button>
                <p className="text-xs text-gray-600 text-center">Made by Saad Sahebwale</p>
            </div>
        </aside>
    );
}