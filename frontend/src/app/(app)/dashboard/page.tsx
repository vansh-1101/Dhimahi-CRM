'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/header';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Users, Target, Shield, TrendingUp, Phone, Mail, Calendar as CalIcon, CheckCircle } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import type { DashboardStats, Activity } from '@/lib/types';

const COLORS = ['#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626', '#6366F1'];

export default function DashboardPage() {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getDashboardStats()
            .then(setData)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const stats = [
        { label: 'Total Clients', value: data?.stats.totalClients || 0, icon: Users, color: 'from-purple-500 to-purple-700', bg: 'bg-purple-50' },
        { label: 'Active Leads', value: data?.stats.activeLeads || 0, icon: Target, color: 'from-blue-500 to-blue-700', bg: 'bg-blue-50' },
        { label: 'Renewals This Month', value: data?.stats.renewingPolicies || 0, icon: Shield, color: 'from-amber-500 to-amber-700', bg: 'bg-amber-50' },
        { label: 'Active SIPs', value: data?.stats.activeSIPs || 0, icon: TrendingUp, color: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-50' },
    ];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'CALL': return <Phone size={14} />;
            case 'EMAIL': return <Mail size={14} />;
            case 'MEETING': return <CalIcon size={14} />;
            default: return <CheckCircle size={14} />;
        }
    };

    if (loading) {
        return (
            <>
                <Header title="Dashboard" />
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="card p-5"><div className="skeleton h-20 w-full" /></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card p-6"><div className="skeleton h-72 w-full" /></div>
                        <div className="card p-6"><div className="skeleton h-72 w-full" /></div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header title="Dashboard" />
            <div className="p-6 space-y-6 animate-fade-in">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="stat-card group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 rounded-full -translate-y-6 translate-x-6 group-hover:opacity-10 transition-opacity" />
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <div className="card p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">New Clients (Last 6 Months)</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data?.clientsByMonth || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                                />
                                <Bar dataKey="count" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div className="card p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Clients by Service Type</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={data?.serviceDistribution || []}
                                    dataKey="count"
                                    nameKey="service"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={50}
                                    paddingAngle={2}
                                    label={({ service, percent }: any) => `${service} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {(data?.serviceDistribution || []).map((_: any, i: number) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="card">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Recent Activities</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {(data?.recentActivities || []).map((activity: Activity) => (
                            <div key={activity.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{activity.subject}</p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {activity.client?.contactName || activity.lead?.name || 'General'}
                                        {activity.createdBy && ` · by ${activity.createdBy.name}`}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="badge bg-purple-50 text-purple-700">{activity.type}</span>
                                    <p className="text-[10px] text-gray-400 mt-1">{formatDate(activity.createdAt)}</p>
                                </div>
                            </div>
                        ))}
                        {(data?.recentActivities || []).length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-8">No recent activities</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
