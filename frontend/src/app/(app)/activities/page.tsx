'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/header';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus, X, CheckCircle, Phone, Mail, Calendar, Users, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Activity } from '@/lib/types';

const TYPES = ['CALL', 'MEETING', 'TASK', 'WHATSAPP', 'EMAIL'];

const typeIcon: Record<string, any> = {
    CALL: Phone, MEETING: Calendar, TASK: CheckCircle, WHATSAPP: MessageCircle, EMAIL: Mail,
};
const typeColor: Record<string, string> = {
    CALL: 'bg-blue-50 text-blue-600', MEETING: 'bg-purple-50 text-purple-600',
    TASK: 'bg-emerald-50 text-emerald-600', WHATSAPP: 'bg-green-50 text-green-600',
    EMAIL: 'bg-amber-50 text-amber-600',
};

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [showToday, setShowToday] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [form, setForm] = useState({ clientId: '', type: 'CALL', subject: '', notes: '', scheduledAt: '' });

    useEffect(() => { fetchActivities(); }, [showToday]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const params = showToday ? 'today=true' : '';
            const data = await api.getActivities(params);
            setActivities(data);
        } catch { toast.error('Failed to load activities'); }
        finally { setLoading(false); }
    };

    const openForm = async () => {
        try { const data = await api.getClients('limit=100'); setClients(data.clients); } catch { }
        setShowForm(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createActivity({
                ...form,
                clientId: form.clientId || undefined,
            });
            toast.success('Activity created!');
            setShowForm(false);
            setForm({ clientId: '', type: 'CALL', subject: '', notes: '', scheduledAt: '' });
            fetchActivities();
        } catch (err: any) { toast.error(err.message || 'Failed to create activity'); }
    };

    const markComplete = async (id: string) => {
        try {
            await api.completeActivity(id);
            toast.success('Activity completed!');
            fetchActivities();
        } catch { toast.error('Failed to complete activity'); }
    };

    const pending = activities.filter(a => !a.completedAt);
    const completed = activities.filter(a => a.completedAt);

    return (
        <>
            <Header title="Activities" />
            <div className="p-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 rounded-xl p-0.5">
                            <button onClick={() => setShowToday(false)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${!showToday ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                                All
                            </button>
                            <button onClick={() => setShowToday(true)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${showToday ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                                Today
                            </button>
                        </div>
                        <span className="text-sm text-gray-500">{pending.length} pending · {completed.length} completed</span>
                    </div>
                    <button onClick={openForm} className="btn-primary text-sm flex items-center gap-2">
                        <Plus size={16} /> Add Activity
                    </button>
                </div>

                {/* Pending Activities */}
                {pending.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Pending</h3>
                        <div className="space-y-2">
                            {pending.map(act => {
                                const Icon = typeIcon[act.type] || CheckCircle;
                                return (
                                    <div key={act.id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-all">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColor[act.type] || 'bg-gray-50 text-gray-600'}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">{act.subject}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                {act.client && <span className="text-xs text-gray-500 flex items-center gap-1"><Users size={10} /> {act.client.contactName}</span>}
                                                {act.scheduledAt && <span className="text-xs text-gray-400">{formatDate(act.scheduledAt)}</span>}
                                                {act.createdBy && <span className="text-xs text-gray-400">by {act.createdBy.name}</span>}
                                            </div>
                                            {act.notes && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{act.notes}</p>}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="badge bg-purple-50 text-purple-700 text-[10px]">{act.type}</span>
                                            <button onClick={() => markComplete(act.id)} className="p-2 rounded-xl hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors" title="Mark complete">
                                                <CheckCircle size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Completed Activities */}
                {completed.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-3">Completed</h3>
                        <div className="space-y-2">
                            {completed.map(act => {
                                const Icon = typeIcon[act.type] || CheckCircle;
                                return (
                                    <div key={act.id} className="card p-4 flex items-center gap-4 opacity-60">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 line-through">{act.subject}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                {act.client && <span className="text-xs text-gray-500">{act.client.contactName}</span>}
                                                <span className="text-xs text-green-500">✓ {formatDate(act.completedAt!)}</span>
                                            </div>
                                        </div>
                                        <span className="badge bg-gray-100 text-gray-500 text-[10px]">{act.type}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {!loading && activities.length === 0 && (
                    <div className="card p-12 text-center text-gray-400">No activities found</div>
                )}

                {loading && (
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map(i => <div key={i} className="card p-4"><div className="skeleton h-12 w-full" /></div>)}
                    </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900">Add Activity</h3>
                            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="label">Type *</label>
                                <select className="select-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Subject *</label>
                                <input className="input-field" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="label">Client (optional)</label>
                                <select className="select-field" value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}>
                                    <option value="">-- No client --</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.contactName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Scheduled At</label>
                                <input type="datetime-local" className="input-field" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
                            </div>
                            <div>
                                <label className="label">Notes</label>
                                <textarea className="input-field" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
                                <button type="submit" className="btn-primary text-sm">Create Activity</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
