'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/header';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils';
import { FileBarChart, Shield, TrendingUp, Users, Award, Download } from 'lucide-react';
import toast from 'react-hot-toast';

type ReportTab = 'renewals' | 'sips' | 'new-clients' | 'commission';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<ReportTab>('renewals');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchReport(); }, [activeTab]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            let result: any[] = [];
            switch (activeTab) {
                case 'renewals': result = await api.getReportRenewals(); break;
                case 'sips': result = await api.getReportSipsMaturing(); break;
                case 'new-clients': result = await api.getReportNewClients(); break;
                case 'commission': result = await api.getReportCommission(); break;
            }
            setData(result);
        } catch { toast.error('Failed to load report'); }
        finally { setLoading(false); }
    };

    const tabs = [
        { key: 'renewals' as ReportTab, label: 'Renewals Due', icon: Shield, color: 'text-amber-600' },
        { key: 'sips' as ReportTab, label: 'SIPs Maturing', icon: TrendingUp, color: 'text-blue-600' },
        { key: 'new-clients' as ReportTab, label: 'New Clients', icon: Users, color: 'text-emerald-600' },
        { key: 'commission' as ReportTab, label: 'Commission Summary', icon: Award, color: 'text-purple-600' },
    ];

    return (
        <>
            <Header title="Reports" />
            <div className="p-6 animate-fade-in">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                    : 'bg-white text-gray-600 border border-gray-100 hover:bg-purple-50 hover:text-purple-600'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {!loading && <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'}`}>{data.length}</span>}
                        </button>
                    ))}
                </div>

                {/* Report Content */}
                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-12 w-full" />)}
                        </div>
                    ) : (
                        <>
                            {activeTab === 'renewals' && (
                                <div className="table-container">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50/80">
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Policy #</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Insurer</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Premium</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Renewal Date</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Contact</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {data.map((p: any) => {
                                                const days = daysUntil(p.renewalDate);
                                                return (
                                                    <tr key={p.id} className={days <= 7 ? 'bg-red-50/50' : days <= 15 ? 'bg-amber-50/50' : ''}>
                                                        <td className="px-5 py-3 font-medium text-gray-900">{p.client?.contactName || '-'}</td>
                                                        <td className="px-5 py-3 font-mono text-xs hidden md:table-cell">{p.policyNumber || '-'}</td>
                                                        <td className="px-5 py-3">{p.insurerName}</td>
                                                        <td className="px-5 py-3"><span className="badge bg-purple-50 text-purple-700">{p.insuranceType}</span></td>
                                                        <td className="px-5 py-3 hidden md:table-cell">{formatCurrency(p.premiumAmount)}</td>
                                                        <td className="px-5 py-3">
                                                            <span className={days <= 7 ? 'text-red-600 font-bold' : days <= 15 ? 'text-amber-600 font-semibold' : ''}>
                                                                {formatDate(p.renewalDate)}
                                                            </span>
                                                            <span className="block text-[10px] text-gray-400">{days} days left</span>
                                                        </td>
                                                        <td className="px-5 py-3 text-xs text-gray-500 hidden md:table-cell">{p.client?.mobileNumber}</td>
                                                    </tr>
                                                );
                                            })}
                                            {data.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400">No renewals due this month</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'sips' && (
                                <div className="table-container">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50/80">
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Fund</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">SIP Amount</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Current Value</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">End Date</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Contact</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {data.map((s: any) => (
                                                <tr key={s.id} className="hover:bg-gray-50/50">
                                                    <td className="px-5 py-3 font-medium text-gray-900">{s.client?.contactName || '-'}</td>
                                                    <td className="px-5 py-3">{s.fundName || '-'}</td>
                                                    <td className="px-5 py-3 hidden md:table-cell">{formatCurrency(s.amount)}</td>
                                                    <td className="px-5 py-3 text-emerald-600 font-semibold hidden md:table-cell">{formatCurrency(s.currentValue)}</td>
                                                    <td className="px-5 py-3">{formatDate(s.endDate)}</td>
                                                    <td className="px-5 py-3 text-xs text-gray-500 hidden md:table-cell">{s.client?.mobileNumber}</td>
                                                </tr>
                                            ))}
                                            {data.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400">No SIPs maturing in the next 3 months</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'new-clients' && (
                                <div className="table-container">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50/80">
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Mobile</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Email</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Services</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Partner</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {data.map((c: any) => (
                                                <tr key={c.id} className="hover:bg-gray-50/50">
                                                    <td className="px-5 py-3 font-medium text-gray-900">{c.contactName}</td>
                                                    <td className="px-5 py-3 hidden md:table-cell">{c.mobileNumber}</td>
                                                    <td className="px-5 py-3 text-xs hidden md:table-cell">{c.email || '-'}</td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            {(c.otherServices || []).map((s: string) => (
                                                                <span key={s} className="badge bg-purple-50 text-purple-700 text-[10px]">{s}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-xs hidden md:table-cell">{c.associatePartner?.name || '-'}</td>
                                                    <td className="px-5 py-3 text-xs text-gray-500">{formatDate(c.createdAt)}</td>
                                                </tr>
                                            ))}
                                            {data.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400">No new clients this month</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'commission' && (
                                <div className="table-container">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50/80">
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Partner</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Commission Rate</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Clients</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Policies</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Investments</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Loans</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {data.map((p: any) => (
                                                <tr key={p.id} className="hover:bg-gray-50/50">
                                                    <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                                                    <td className="px-5 py-3">
                                                        <span className="badge bg-purple-50 text-purple-700">{p.commissionRate || 0}%</span>
                                                    </td>
                                                    <td className="px-5 py-3 font-semibold">{p.totalClients}</td>
                                                    <td className="px-5 py-3 hidden md:table-cell">{p.totalPolicies}</td>
                                                    <td className="px-5 py-3 hidden md:table-cell">{p.totalInvestments}</td>
                                                    <td className="px-5 py-3 hidden md:table-cell">{p.totalLoans}</td>
                                                </tr>
                                            ))}
                                            {data.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400">No partner data available</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
