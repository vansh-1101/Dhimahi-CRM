'use client';

import Sidebar from '@/components/layout/sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 lg:ml-[260px] transition-all duration-300">
                {children}
            </main>
        </div>
    );
}
