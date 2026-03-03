'use client';

import { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header({ title }: { title: string }) {
    const [search, setSearch] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/clients?search=${encodeURIComponent(search.trim())}`);
        }
    };

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="pl-12 lg:pl-0">
                    <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Global Search */}
                    <form onSubmit={handleSearch} className="hidden md:flex items-center">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search clients by name, PAN, mobile..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-80 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                            />
                        </div>
                    </form>

                    {/* Notifications */}
                    <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <Bell size={20} className="text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                </div>
            </div>
        </header>
    );
}
