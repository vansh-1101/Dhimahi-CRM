'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import {
    LayoutDashboard,
    Users,
    Target,
    Shield,
    TrendingUp,
    Landmark,
    Calendar,
    FileBarChart,
    ChevronLeft,
    Menu,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/clients', label: 'Clients', icon: Users },
    { href: '/leads', label: 'Leads', icon: Target },
    { href: '/insurance', label: 'Insurance', icon: Shield },
    { href: '/investments', label: 'Investments', icon: TrendingUp },
    { href: '/loans', label: 'Loans', icon: Landmark },
    { href: '/activities', label: 'Activities', icon: Calendar },
    { href: '/reports', label: 'Reports', icon: FileBarChart },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [renewalCount, setRenewalCount] = useState(0);

    useEffect(() => {
        api.getRenewalsDue()
            .then((data: any) => {
                const items = Array.isArray(data) ? data : [];
                setRenewalCount(items.length);
            })
            .catch(() => { });
    }, []);

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden bg-purple-600 text-white p-2 rounded-lg shadow-lg"
            >
                <Menu size={20} />
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-950 text-white z-40 flex flex-col transition-all duration-300 shadow-2xl',
                    collapsed ? 'w-[72px]' : 'w-[260px]',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-purple-700/50">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-lg shrink-0">
                        DF
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <h1 className="font-bold text-sm leading-tight">Dhimahi Finserve</h1>
                            <p className="text-[10px] text-purple-300 leading-tight">&amp; Investment Hub</p>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="ml-auto hidden lg:flex w-6 h-6 rounded-full bg-purple-700/50 items-center justify-center hover:bg-purple-600 transition-colors"
                    >
                        <ChevronLeft size={14} className={cn('transition-transform', collapsed && 'rotate-180')} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                                    isActive
                                        ? 'bg-white/20 text-white shadow-lg shadow-purple-900/30'
                                        : 'text-purple-200 hover:bg-white/10 hover:text-white'
                                )}
                            >
                                <item.icon size={20} className="shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                                {item.href === '/insurance' && renewalCount > 0 && (
                                    <span className={cn(
                                        'bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse',
                                        collapsed ? 'absolute -top-1 -right-1 w-4 h-4' : 'ml-auto w-5 h-5'
                                    )}>
                                        {renewalCount}
                                    </span>
                                )}
                                {collapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="border-t border-purple-700/50 p-3">
                    <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
                        <div className="w-8 h-8 rounded-full bg-purple-500/50 flex items-center justify-center text-xs font-bold shrink-0">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{user?.name || 'User'}</p>
                                <p className="text-[10px] text-purple-300 truncate">{user?.role || 'ADMIN'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
