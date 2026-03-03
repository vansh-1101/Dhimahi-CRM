'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/header';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Investment } from '@/lib/types';

export default function InvestmentsPage() {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [sipCalendar, setSipCalendar] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [filterType, setFilterType] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [form, setForm] = useState({
        clientId: '', type: 'SIP', fundName: '', folioNumber: '', amount: '',
        sipDate: '', startDate: '', endDate: '', currentValue: '', unitsHeld: '',
    });

    useEffect(() => {
        fetchData();
    }, [filterType]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = filterType ? `type=${filterType}` : '';
            const [inv, sips] = await Promise.all([
                api.getInvestments(params),
                api.getSipCalendar(),
            ]);
            setInvestments(inv);
            setSipCalendar(sips);
        } catch { toast.error('Failed to load investments'); }
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
            await api.createInvestment({
                ...form,
                amount: form.amount ? parseFloat(form.amount) : undefined,
                sipDate: form.sipDate ? parseInt(form.sipDate) : undefined,
                currentValue: form.currentValue ? parseFloat(form.currentValue) : undefined,
                unitsHeld: form.unitsHeld ? parseFloat(form.unitsHeld) : undefined,
            });
            toast.success('Investment added!');
            setShowForm(false);
            fetchData();
        } catch (err: any) { toast.error(err.message || 'Failed to add investment'); }
    };

    const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    return (
        <>
            <Header title="Investments" />
            <div className="p-6 animate-fade-in">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="stat-card">
                        <p className="text-xs font-medium text-gray-500 uppercase">Total Investments</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{investments.length}</p>
                    </div>
                    <div className="stat-card">
                        <p className="text-xs font-medium text-gray-500 uppercase">Total Invested</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(totalInvested)}</p>
                    </div>
                    <div className="stat-card">
                        <p className="text-xs font-medium text-gray-500 uppercase">Current Value</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalValue)}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <select className="select-field w-auto" value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="">All Types</option>
                            <option value="SIP">SIP</option>
                            <option value="LUMPSUM">Lumpsum</option>
                            <option value="PPF">PPF</option>
                            <option value="NPS">NPS</option>
                            <option value="FD">FD</option>
                        </select>
                        <div className="flex bg-gray-100 rounded-xl p-0.5">
                            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                                List
                            </button>
                            <button onClick={() => setView('calendar')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'calendar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                                SIP Calendar
                            </button>
                        </div>
                    </div>
                    <button onClick={openForm} className="btn-primary text-sm flex items-center gap-2">
                        <Plus size={16} /> Add Investment
                    </button>
                </div>

                {view === 'list' ? (
                    <div className="card overflow-hidden">
                        <div className="table-container">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/80">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Fund</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Folio</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Current Value</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">SIP Date</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? Array.from({ length: 4 }).map((_, i) => (
                                        <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (<td key={j} className="px-5 py-3"><div className="skeleton h-5 w-full" /></td>))}</tr>
                                    )) : investments.map(inv => (
                                        <tr key={inv.id} className="hover:bg-gray-50/50">
                                            <td className="px-5 py-3 font-medium text-gray-900">{inv.client?.contactName || '-'}</td>
                                            <td className="px-5 py-3"><span className="badge bg-blue-50 text-blue-700">{inv.type}</span></td>
                                            <td className="px-5 py-3 hidden md:table-cell">{inv.fundName || '-'}</td>
                                            <td className="px-5 py-3 font-mono text-xs hidden lg:table-cell">{inv.folioNumber || '-'}</td>
                                            <td className="px-5 py-3">{formatCurrency(inv.amount)}</td>
                                            <td className="px-5 py-3 font-semibold text-emerald-600 hidden md:table-cell">{formatCurrency(inv.currentValue)}</td>
                                            <td className="px-5 py-3 hidden lg:table-cell">{inv.sipDate ? `${inv.sipDate}th` : '-'}</td>
                                            <td className="px-5 py-3">
                                                <span className={`badge ${inv.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : inv.status === 'PAUSED' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && investments.length === 0 && (
                                        <tr><td colSpan={8} className="text-center py-12 text-gray-400">No investments found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* SIP Calendar View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                            const sipsOnDay = sipCalendar.filter(s => s.sipDate === day);
                            if (sipsOnDay.length === 0) return null;
                            return (
                                <div key={day} className="card p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                                            {day}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{day}{['st', 'nd', 'rd'][((day + 90) % 100 - 10) % 10 - 1] || 'th'} of month</p>
                                            <p className="text-xs text-gray-400">{sipsOnDay.length} SIP(s)</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {sipsOnDay.map(sip => (
                                            <div key={sip.id} className="bg-gray-50 rounded-xl p-3">
                                                <p className="text-xs font-medium text-gray-900">{sip.client?.contactName}</p>
                                                <p className="text-xs text-gray-500">{sip.fundName}</p>
                                                <p className="text-xs font-semibold text-purple-600 mt-1">{formatCurrency(sip.amount)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Investment Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fade-in my-8">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900">Add Investment</h3>
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
                                    <label className="label">Type *</label>
                                    <select className="select-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                        <option value="SIP">SIP</option>
                                        <option value="LUMPSUM">Lumpsum</option>
                                        <option value="PPF">PPF</option>
                                        <option value="NPS">NPS</option>
                                        <option value="FD">FD</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Fund Name</label>
                                    <input className="input-field" value={form.fundName} onChange={e => setForm(f => ({ ...f, fundName: e.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Amount</label>
                                    <input type="number" className="input-field" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">SIP Date (Day)</label>
                                    <input type="number" min="1" max="31" className="input-field" value={form.sipDate} onChange={e => setForm(f => ({ ...f, sipDate: e.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Start Date</label>
                                    <input type="date" className="input-field" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Folio Number</label>
                                    <input className="input-field" value={form.folioNumber} onChange={e => setForm(f => ({ ...f, folioNumber: e.target.value }))} />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
                                <button type="submit" className="btn-primary text-sm">Add Investment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
