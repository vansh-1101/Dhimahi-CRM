'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/header';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Loan } from '@/lib/types';

export default function LoansPage() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [form, setForm] = useState({
        clientId: '', loanType: 'HOME', bankName: '', loanAmount: '', disbursementDate: '',
        emiAmount: '', tenureMonths: '', interestRate: '', emiDate: '', outstandingAmount: '',
    });

    useEffect(() => { fetchLoans(); }, [filterType, filterStatus]);

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterType) params.set('type', filterType);
            if (filterStatus) params.set('status', filterStatus);
            const data = await api.getLoans(params.toString());
            setLoans(data);
        } catch { toast.error('Failed to load loans'); }
        finally { setLoading(false); }
    };

    const openForm = async () => {
        try { const data = await api.getClients('limit=100'); setClients(data.clients); } catch { }
        setShowForm(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createLoan({
                ...form,
                loanAmount: form.loanAmount ? parseFloat(form.loanAmount) : undefined,
                emiAmount: form.emiAmount ? parseFloat(form.emiAmount) : undefined,
                tenureMonths: form.tenureMonths ? parseInt(form.tenureMonths) : undefined,
                interestRate: form.interestRate ? parseFloat(form.interestRate) : undefined,
                emiDate: form.emiDate ? parseInt(form.emiDate) : undefined,
                outstandingAmount: form.outstandingAmount ? parseFloat(form.outstandingAmount) : undefined,
            });
            toast.success('Loan added!');
            setShowForm(false);
            fetchLoans();
        } catch (err: any) { toast.error(err.message || 'Failed to add loan'); }
    };

    const totalOutstanding = loans.reduce((sum, l) => sum + (l.outstandingAmount || 0), 0);
    const totalEMI = loans.filter(l => l.status === 'ACTIVE').reduce((sum, l) => sum + (l.emiAmount || 0), 0);

    return (
        <>
            <Header title="Loans" />
            <div className="p-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="stat-card">
                        <p className="text-xs font-medium text-gray-500 uppercase">Total Loans</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{loans.length}</p>
                    </div>
                    <div className="stat-card">
                        <p className="text-xs font-medium text-gray-500 uppercase">Total Outstanding</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(totalOutstanding)}</p>
                    </div>
                    <div className="stat-card">
                        <p className="text-xs font-medium text-gray-500 uppercase">Monthly EMI Total</p>
                        <p className="text-2xl font-bold text-purple-600 mt-1">{formatCurrency(totalEMI)}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <select className="select-field w-auto" value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="">All Types</option>
                            <option value="HOME">Home</option>
                            <option value="PERSONAL">Personal</option>
                            <option value="CAR">Car</option>
                            <option value="BUSINESS">Business</option>
                            <option value="EDUCATION">Education</option>
                        </select>
                        <select className="select-field w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="CLOSED">Closed</option>
                            <option value="NPA">NPA</option>
                        </select>
                    </div>
                    <button onClick={openForm} className="btn-primary text-sm flex items-center gap-2">
                        <Plus size={16} /> Add Loan
                    </button>
                </div>

                <div className="card overflow-hidden">
                    <div className="table-container">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/80">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Bank</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Loan Amount</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">EMI</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Rate</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">EMI Date</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Outstanding</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i}>{Array.from({ length: 9 }).map((_, j) => (<td key={j} className="px-5 py-3"><div className="skeleton h-5 w-full" /></td>))}</tr>
                                )) : loans.map(loan => (
                                    <tr key={loan.id} className={`hover:bg-gray-50/50 ${loan.status === 'NPA' ? 'bg-red-50/30' : ''}`}>
                                        <td className="px-5 py-3 font-medium text-gray-900">{loan.client?.contactName || '-'}</td>
                                        <td className="px-5 py-3"><span className="badge bg-emerald-50 text-emerald-700">{loan.loanType}</span></td>
                                        <td className="px-5 py-3 hidden md:table-cell">{loan.bankName || '-'}</td>
                                        <td className="px-5 py-3">{formatCurrency(loan.loanAmount)}</td>
                                        <td className="px-5 py-3 hidden md:table-cell">{formatCurrency(loan.emiAmount)}</td>
                                        <td className="px-5 py-3 hidden lg:table-cell">{loan.interestRate ? `${loan.interestRate}%` : '-'}</td>
                                        <td className="px-5 py-3 hidden lg:table-cell">{loan.emiDate ? `${loan.emiDate}th` : '-'}</td>
                                        <td className="px-5 py-3 font-semibold text-amber-600 hidden md:table-cell">{formatCurrency(loan.outstandingAmount)}</td>
                                        <td className="px-5 py-3">
                                            <span className={`badge ${loan.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : loan.status === 'NPA' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {loan.status === 'NPA' && <AlertTriangle size={10} className="mr-1" />}
                                                {loan.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && loans.length === 0 && (
                                    <tr><td colSpan={9} className="text-center py-12 text-gray-400">No loans found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fade-in my-8">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900">Add Loan</h3>
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
                                    <label className="label">Loan Type *</label>
                                    <select className="select-field" value={form.loanType} onChange={e => setForm(f => ({ ...f, loanType: e.target.value }))}>
                                        {['HOME', 'PERSONAL', 'CAR', 'BUSINESS', 'EDUCATION'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Bank Name</label>
                                    <input className="input-field" value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Loan Amount</label>
                                    <input type="number" className="input-field" value={form.loanAmount} onChange={e => setForm(f => ({ ...f, loanAmount: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">EMI Amount</label>
                                    <input type="number" className="input-field" value={form.emiAmount} onChange={e => setForm(f => ({ ...f, emiAmount: e.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="label">Tenure (months)</label>
                                    <input type="number" className="input-field" value={form.tenureMonths} onChange={e => setForm(f => ({ ...f, tenureMonths: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Interest Rate %</label>
                                    <input type="number" step="0.1" className="input-field" value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">EMI Date</label>
                                    <input type="number" min="1" max="31" className="input-field" value={form.emiDate} onChange={e => setForm(f => ({ ...f, emiDate: e.target.value }))} />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
                                <button type="submit" className="btn-primary text-sm">Add Loan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
