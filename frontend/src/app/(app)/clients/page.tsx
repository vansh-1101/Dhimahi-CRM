'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/header';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Client } from '@/lib/types';

export default function ClientsPage() {
    const searchParams = useSearchParams();
    const [clients, setClients] = useState<Client[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchClients = async (p = page, s = search) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (s) params.set('search', s);
            params.set('page', String(p));
            params.set('limit', '15');
            const data = await api.getClients(params.toString());
            setClients(data.clients);
            setTotal(data.total);
        } catch {
            toast.error('Failed to load clients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchClients(); }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchClients(1, search);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.deleteClient(deleteId);
            toast.success('Client deleted');
            setDeleteId(null);
            fetchClients();
        } catch {
            toast.error('Failed to delete client');
        }
    };

    const totalPages = Math.ceil(total / 15);

    return (
        <>
            <Header title="Client Master" />
            <div className="p-6 animate-fade-in">
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-80">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search name, PAN, mobile..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field pl-9"
                            />
                        </div>
                        <button type="submit" className="btn-primary text-sm">Search</button>
                    </form>
                    <Link href="/clients/new" className="btn-primary text-sm flex items-center gap-2">
                        <Plus size={16} /> Add Client
                    </Link>
                </div>

                {/* Table */}
                <div className="card overflow-hidden">
                    <div className="table-container">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/80">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">PAN</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Services</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Partner</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Created</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 7 }).map((_, j) => (
                                                <td key={j} className="px-5 py-3"><div className="skeleton h-5 w-full" /></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : clients.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-400">
                                            No clients found. <Link href="/clients/new" className="text-purple-600 hover:underline">Add your first client</Link>
                                        </td>
                                    </tr>
                                ) : (
                                    clients.map((client) => (
                                        <tr key={client.id} className="hover:bg-purple-50/30 transition-colors">
                                            <td className="px-5 py-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{client.contactName}</p>
                                                    {client.familyName && <p className="text-xs text-gray-400">{client.familyName}</p>}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-gray-600 hidden md:table-cell font-mono text-xs">{client.panNumber || '-'}</td>
                                            <td className="px-5 py-3 text-gray-600">{client.mobileNumber}</td>
                                            <td className="px-5 py-3 hidden lg:table-cell">
                                                <div className="flex flex-wrap gap-1">
                                                    {(client.otherServices || []).slice(0, 3).map((s) => (
                                                        <span key={s} className="badge bg-purple-50 text-purple-700 text-[10px]">{s}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-gray-600 hidden lg:table-cell text-xs">{client.associatePartner?.name || '-'}</td>
                                            <td className="px-5 py-3 text-gray-500 hidden md:table-cell text-xs">{formatDate(client.createdAt)}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/clients/${client.id}`} className="p-2 rounded-lg hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition-colors">
                                                        <Eye size={16} />
                                                    </Link>
                                                    <Link href={`/clients/${client.id}/edit`} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors">
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button onClick={() => setDeleteId(client.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">Showing {(page - 1) * 15 + 1}-{Math.min(page * 15, total)} of {total}</p>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs px-3 py-1 bg-purple-50 text-purple-700 rounded-lg font-medium">{page} / {totalPages}</span>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Client</h3>
                        <p className="text-sm text-gray-500 mb-6">Are you sure? This will permanently delete the client and all associated data.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setDeleteId(null)} className="btn-secondary text-sm">Cancel</button>
                            <button onClick={handleDelete} className="btn-danger text-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
