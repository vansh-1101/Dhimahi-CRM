'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/header';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus, X, ArrowRight, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Lead } from '@/lib/types';

const COLUMNS = [
    { key: 'NEW', label: 'New', color: 'border-blue-400', bg: 'bg-blue-50' },
    { key: 'CONTACTED', label: 'Contacted', color: 'border-amber-400', bg: 'bg-amber-50' },
    { key: 'QUALIFIED', label: 'Qualified', color: 'border-purple-400', bg: 'bg-purple-50' },
    { key: 'CONVERTED', label: 'Converted', color: 'border-green-400', bg: 'bg-green-50' },
    { key: 'LOST', label: 'Lost', color: 'border-red-400', bg: 'bg-red-50' },
];

const SERVICES = ['INSURANCE', 'INVESTMENT', 'LOAN', 'BROKING', 'CREDIT_CARD'];
const SOURCES = ['WALKIN', 'WHATSAPP', 'REFERRAL', 'ONLINE'];

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', email: '', serviceInterested: 'INSURANCE', source: 'WALKIN', notes: '' });

    useEffect(() => { fetchLeads(); }, []);

    const fetchLeads = async () => {
        try {
            const data = await api.getLeads();
            setLeads(data);
        } catch { toast.error('Failed to load leads'); }
        finally { setLoading(false); }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createLead(form);
            toast.success('Lead created!');
            setShowModal(false);
            setForm({ name: '', phone: '', email: '', serviceInterested: 'INSURANCE', source: 'WALKIN', notes: '' });
            fetchLeads();
        } catch (err: any) { toast.error(err.message || 'Failed to create lead'); }
    };

    const moveToNext = async (lead: Lead) => {
        const order = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED'];
        const currentIdx = order.indexOf(lead.status);
        if (currentIdx < 0 || currentIdx >= order.length - 1) return;
        const nextStatus = order[currentIdx + 1];
        try {
            await api.updateLeadStatus(lead.id, nextStatus);
            toast.success(`Lead moved to ${nextStatus}`);
            fetchLeads();
        } catch { toast.error('Failed to update lead'); }
    };

    const convertLead = async (leadId: string) => {
        try {
            await api.convertLead(leadId);
            toast.success('Lead converted to client!');
            fetchLeads();
        } catch (err: any) { toast.error(err.message || 'Failed to convert'); }
    };

    const getLeadsByStatus = (status: string) => leads.filter(l => l.status === status);

    const serviceColor: Record<string, string> = {
        INSURANCE: 'bg-purple-100 text-purple-700',
        INVESTMENT: 'bg-blue-100 text-blue-700',
        LOAN: 'bg-green-100 text-green-700',
        BROKING: 'bg-amber-100 text-amber-700',
        CREDIT_CARD: 'bg-red-100 text-red-700',
    };

    if (loading) {
        return (
            <>
                <Header title="Lead Pipeline" />
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {COLUMNS.map(c => (
                            <div key={c.key} className="card p-4"><div className="skeleton h-48 w-full" /></div>
                        ))}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header title="Lead Pipeline" />
            <div className="p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-500">{leads.length} total leads</p>
                    <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-2">
                        <Plus size={16} /> Add Lead
                    </button>
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
                    {COLUMNS.map(col => (
                        <div key={col.key} className="min-w-[250px]">
                            <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-xl ${col.bg} border-l-4 ${col.color}`}>
                                <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                                <span className="w-5 h-5 rounded-full bg-white text-gray-600 text-xs flex items-center justify-center font-bold shadow-sm">
                                    {getLeadsByStatus(col.key).length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {getLeadsByStatus(col.key).map(lead => (
                                    <div key={lead.id} className="card p-4 hover:shadow-md transition-all duration-200 animate-slide-in">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="text-sm font-semibold text-gray-900">{lead.name}</h4>
                                            <span className={`badge text-[10px] ${serviceColor[lead.serviceInterested] || 'bg-gray-100 text-gray-600'}`}>
                                                {lead.serviceInterested}
                                            </span>
                                        </div>
                                        <div className="space-y-1 mb-3">
                                            {lead.phone && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10} /> {lead.phone}</p>}
                                            {lead.email && <p className="text-xs text-gray-500 flex items-center gap-1"><Mail size={10} /> {lead.email}</p>}
                                        </div>
                                        {lead.notes && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{lead.notes}</p>}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-gray-400">{lead.source} · {formatDate(lead.createdAt)}</span>
                                            <div className="flex gap-1">
                                                {col.key === 'QUALIFIED' && (
                                                    <button onClick={() => convertLead(lead.id)} className="text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium transition-colors">
                                                        Convert
                                                    </button>
                                                )}
                                                {['NEW', 'CONTACTED', 'QUALIFIED'].includes(col.key) && col.key !== 'QUALIFIED' && (
                                                    <button onClick={() => moveToNext(lead)} className="p-1 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors">
                                                        <ArrowRight size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {getLeadsByStatus(col.key).length === 0 && (
                                    <div className="text-center py-8 text-gray-300 text-xs">No leads</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Lead Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900">Add New Lead</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="label">Name *</label>
                                <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Phone</label>
                                    <input className="input-field" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Email</label>
                                    <input type="email" className="input-field" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Service Interest *</label>
                                    <select className="select-field" value={form.serviceInterested} onChange={e => setForm(f => ({ ...f, serviceInterested: e.target.value }))}>
                                        {SERVICES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Source</label>
                                    <select className="select-field" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                                        {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="label">Notes</label>
                                <textarea className="input-field" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-sm">Cancel</button>
                                <button type="submit" className="btn-primary text-sm">Create Lead</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
