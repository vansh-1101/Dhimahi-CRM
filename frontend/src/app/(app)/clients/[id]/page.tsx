'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/header';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils';
import { Pencil, Phone, Mail, MapPin, Calendar, Shield, TrendingUp, Landmark, CreditCard, Activity as ActivityIcon } from 'lucide-react';
import type { Client } from '@/lib/types';

export default function ClientDetailPage() {
    const { id } = useParams();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('insurance');

    useEffect(() => {
        api.getClient(id as string)
            .then(setClient)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <>
                <Header title="Client Details" />
                <div className="p-6 space-y-4">
                    <div className="card p-6"><div className="skeleton h-32 w-full" /></div>
                    <div className="card p-6"><div className="skeleton h-64 w-full" /></div>
                </div>
            </>
        );
    }

    if (!client) {
        return (
            <>
                <Header title="Client Details" />
                <div className="p-6"><div className="card p-12 text-center text-gray-400">Client not found</div></div>
            </>
        );
    }

    const tabs = [
        { key: 'insurance', label: 'Insurance', icon: Shield, count: client.insurancePolicies?.length || 0 },
        { key: 'investments', label: 'Investments', icon: TrendingUp, count: client.investments?.length || 0 },
        { key: 'loans', label: 'Loans', icon: Landmark, count: client.loans?.length || 0 },
        { key: 'activities', label: 'Activities', icon: ActivityIcon, count: client.activities?.length || 0 },
    ];

    return (
        <>
            <Header title="Client Details" />
            <div className="p-6 animate-fade-in space-y-6">
                {/* Profile Card */}
                <div className="card p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {client.contactName.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900">{client.contactName}</h2>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><Phone size={14} /> {client.mobileNumber}</span>
                                {client.email && <span className="flex items-center gap-1"><Mail size={14} /> {client.email}</span>}
                                {client.placeOfBirth && <span className="flex items-center gap-1"><MapPin size={14} /> {client.placeOfBirth}</span>}
                                {client.dob && <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(client.dob)}</span>}
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {(client.otherServices || []).map(s => (
                                    <span key={s} className="badge bg-purple-50 text-purple-700">{s}</span>
                                ))}
                            </div>
                        </div>
                        <Link href={`/clients/${client.id}/edit`} className="btn-primary text-sm flex items-center gap-2">
                            <Pencil size={14} /> Edit
                        </Link>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                        {[
                            { label: 'PAN', value: client.panNumber },
                            { label: 'Aadhar', value: client.aadharNumber },
                            { label: 'Constitution', value: client.constitution },
                            { label: 'Status', value: client.residentStatus },
                            { label: 'Annual Income', value: client.annualIncome ? formatCurrency(client.annualIncome) : '-' },
                            { label: 'Family Name', value: client.familyName },
                            { label: 'Mother\'s Name', value: client.motherName },
                            { label: 'Partner', value: client.associatePartner?.name },
                        ].map((item, i) => (
                            <div key={i}>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                                <p className="text-sm font-medium text-gray-900 mt-0.5">{item.value || '-'}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {tab.count > 0 && (
                                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] flex items-center justify-center font-bold">{tab.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="card overflow-hidden">
                    {activeTab === 'insurance' && (
                        <div className="table-container">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/80">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Policy #</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Insurer</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Sum Assured</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Premium</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Renewal</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(client.insurancePolicies || []).map(p => {
                                        const days = daysUntil(p.renewalDate);
                                        return (
                                            <tr key={p.id} className="hover:bg-gray-50/50">
                                                <td className="px-5 py-3 font-mono text-xs">{p.policyNumber || '-'}</td>
                                                <td className="px-5 py-3">{p.insurerName}</td>
                                                <td className="px-5 py-3"><span className="badge bg-purple-50 text-purple-700">{p.insuranceType}</span></td>
                                                <td className="px-5 py-3">{formatCurrency(p.sumAssured)}</td>
                                                <td className="px-5 py-3">{formatCurrency(p.premiumAmount)}</td>
                                                <td className="px-5 py-3">
                                                    <span className={days <= 30 ? 'text-red-600 font-semibold' : ''}>{formatDate(p.renewalDate)}</span>
                                                    {days <= 30 && days > 0 && <span className="text-[10px] text-red-500 block">{days} days left</span>}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`badge ${p.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {(!client.insurancePolicies || client.insurancePolicies.length === 0) && (
                                        <tr><td colSpan={7} className="text-center py-8 text-gray-400">No insurance policies</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'investments' && (
                        <div className="table-container">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/80">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Fund</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Folio</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Current Value</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(client.investments || []).map(inv => (
                                        <tr key={inv.id} className="hover:bg-gray-50/50">
                                            <td className="px-5 py-3"><span className="badge bg-blue-50 text-blue-700">{inv.type}</span></td>
                                            <td className="px-5 py-3">{inv.fundName || '-'}</td>
                                            <td className="px-5 py-3 font-mono text-xs">{inv.folioNumber || '-'}</td>
                                            <td className="px-5 py-3">{formatCurrency(inv.amount)}</td>
                                            <td className="px-5 py-3 font-semibold text-emerald-600">{formatCurrency(inv.currentValue)}</td>
                                            <td className="px-5 py-3">
                                                <span className={`badge ${inv.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{inv.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!client.investments || client.investments.length === 0) && (
                                        <tr><td colSpan={6} className="text-center py-8 text-gray-400">No investments</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'loans' && (
                        <div className="table-container">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/80">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Bank</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">EMI</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Outstanding</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(client.loans || []).map(loan => (
                                        <tr key={loan.id} className="hover:bg-gray-50/50">
                                            <td className="px-5 py-3"><span className="badge bg-emerald-50 text-emerald-700">{loan.loanType}</span></td>
                                            <td className="px-5 py-3">{loan.bankName || '-'}</td>
                                            <td className="px-5 py-3">{formatCurrency(loan.loanAmount)}</td>
                                            <td className="px-5 py-3">{formatCurrency(loan.emiAmount)}</td>
                                            <td className="px-5 py-3 font-semibold text-amber-600">{formatCurrency(loan.outstandingAmount)}</td>
                                            <td className="px-5 py-3">
                                                <span className={`badge ${loan.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : loan.status === 'NPA' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{loan.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!client.loans || client.loans.length === 0) && (
                                        <tr><td colSpan={6} className="text-center py-8 text-gray-400">No loans</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'activities' && (
                        <div className="divide-y divide-gray-50">
                            {(client.activities || []).map(act => (
                                <div key={act.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold">{act.type.charAt(0)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{act.subject}</p>
                                        <p className="text-xs text-gray-400">{act.notes}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="badge bg-purple-50 text-purple-700">{act.type}</span>
                                        <p className="text-[10px] text-gray-400 mt-1">{formatDate(act.scheduledAt || act.createdAt)}</p>
                                        {act.completedAt && <p className="text-[10px] text-green-500">✓ Completed</p>}
                                    </div>
                                </div>
                            ))}
                            {(!client.activities || client.activities.length === 0) && (
                                <p className="text-sm text-gray-400 text-center py-8">No activities</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
