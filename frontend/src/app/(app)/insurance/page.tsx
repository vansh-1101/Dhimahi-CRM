'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/header';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils';
import { Plus, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import type { InsurancePolicy } from '@/lib/types';

export default function InsurancePage() {
    const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [form, setForm] = useState({
        clientId: '', policyNumber: '', insurerName: '', insuranceType: 'LIFE',
        subType: '', sumAssured: '', premiumAmount: '', premiumFrequency: 'ANNUAL',
        startDate: '', renewalDate: '', nomineeName: '', status: 'ACTIVE',
    });

    useEffect(() => { fetchPolicies(); }, [filterType, filterStatus]);

    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterType) params.set('type', filterType);
            if (filterStatus) params.set('status', filterStatus);
            const data = await api.getInsurance(params.toString());
            setPolicies(data);
        } catch { toast.error('Failed to load policies'); }
        finally { setLoading(false); }
    };

    const openForm = async () => {
        try {
            const data = await api.getClients('limit=100');
            setClients(data.clients);
        } catch { }
        setShowForm(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createInsurance({
                ...form,
                sumAssured: form.sumAssured ? parseFloat(form.sumAssured) : undefined,
                premiumAmount: form.premiumAmount ? parseFloat(form.premiumAmount) : undefined,
            });
            toast.success('Policy added!');
            setShowForm(false);
            fetchPolicies();
        } catch (err: any) { toast.error(err.message || 'Failed to add policy'); }
    };

    return (
        <>
            <Header title="Insurance Policies" />
            <div className="p-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Filter size={16} className="text-gray-400" />
                        <select className="select-field w-auto" value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="">All Types</option>
                            <option value="LIFE">Life</option>
                            <option value="MEDICLAIM">Mediclaim</option>
                            <option value="VEHICLE">Vehicle</option>
                            <option value="NON_LIFE">Non-Life</option>
                        </select>
                        <select className="select-field w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="LAPSED">Lapsed</option>
                            <option value="EXPIRED">Expired</option>
                        </select>
                    </div>
                    <button onClick={openForm} className="btn-primary text-sm flex items-center gap-2">
                        <Plus size={16} /> Add Policy
                    </button>
                </div>

                <div className="card overflow-hidden">
                    <div className="table-container">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/80">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Policy #</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Insurer</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Sum Assured</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Premium</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Renewal</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 8 }).map((_, j) => (
                                            <td key={j} className="px-5 py-3"><div className="skeleton h-5 w-full" /></td>
                                        ))}
                                    </tr>
                                )) : policies.map(p => {
                                    const days = daysUntil(p.renewalDate);
                                    const isUrgent = days <= 30 && days > 0;
                                    return (
                                        <tr key={p.id} className={`hover:bg-gray-50/50 ${isUrgent ? 'bg-red-50/30' : ''}`}>
                                            <td className="px-5 py-3 font-medium text-gray-900">{p.client?.contactName || '-'}</td>
                                            <td className="px-5 py-3 font-mono text-xs hidden md:table-cell">{p.policyNumber || '-'}</td>
                                            <td className="px-5 py-3">{p.insurerName}</td>
                                            <td className="px-5 py-3"><span className="badge bg-purple-50 text-purple-700">{p.insuranceType}</span></td>
                                            <td className="px-5 py-3 hidden lg:table-cell">{formatCurrency(p.sumAssured)}</td>
                                            <td className="px-5 py-3 hidden lg:table-cell">{formatCurrency(p.premiumAmount)}</td>
                                            <td className="px-5 py-3">
                                                <span className={isUrgent ? 'text-red-600 font-bold' : ''}>{formatDate(p.renewalDate)}</span>
                                                {isUrgent && <span className="block text-[10px] text-red-500 font-medium animate-pulse">⚠ {days} days left</span>}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`badge ${p.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : p.status === 'LAPSED' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {!loading && policies.length === 0 && (
                                    <tr><td colSpan={8} className="text-center py-12 text-gray-400">No policies found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Policy Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fade-in my-8">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900">Add Insurance Policy</h3>
                            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="label">Client *</label>
                                <select className="select-field" value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} required>
                                    <option value="">Select Client</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.contactName}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Policy Number</label>
                                    <input className="input-field" value={form.policyNumber} onChange={e => setForm(f => ({ ...f, policyNumber: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Insurer Name *</label>
                                    <input className="input-field" value={form.insurerName} onChange={e => setForm(f => ({ ...f, insurerName: e.target.value }))} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Insurance Type *</label>
                                    <select className="select-field" value={form.insuranceType} onChange={e => setForm(f => ({ ...f, insuranceType: e.target.value }))}>
                                        <option value="LIFE">Life</option>
                                        <option value="MEDICLAIM">Mediclaim</option>
                                        <option value="VEHICLE">Vehicle</option>
                                        <option value="NON_LIFE">Non-Life</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Sub Type</label>
                                    <input className="input-field" value={form.subType} onChange={e => setForm(f => ({ ...f, subType: e.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Sum Assured</label>
                                    <input type="number" className="input-field" value={form.sumAssured} onChange={e => setForm(f => ({ ...f, sumAssured: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Premium Amount</label>
                                    <input type="number" className="input-field" value={form.premiumAmount} onChange={e => setForm(f => ({ ...f, premiumAmount: e.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Start Date</label>
                                    <input type="date" className="input-field" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Renewal Date</label>
                                    <input type="date" className="input-field" value={form.renewalDate} onChange={e => setForm(f => ({ ...f, renewalDate: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="label">Nominee Name</label>
                                <input className="input-field" value={form.nomineeName} onChange={e => setForm(f => ({ ...f, nomineeName: e.target.value }))} />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
                                <button type="submit" className="btn-primary text-sm">Add Policy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
