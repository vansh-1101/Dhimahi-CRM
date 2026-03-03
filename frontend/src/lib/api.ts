const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
    token?: string;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...fetchOptions,
        headers,
        credentials: 'include',
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
}

export const api = {
    // Clients
    getClients: (params?: string) => fetchApi<any>(`/clients${params ? `?${params}` : ''}`),
    getClient: (id: string) => fetchApi<any>(`/clients/${id}`),
    createClient: (data: any) => fetchApi('/clients', { method: 'POST', body: JSON.stringify(data) }),
    updateClient: (id: string, data: any) => fetchApi(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteClient: (id: string) => fetchApi(`/clients/${id}`, { method: 'DELETE' }),

    // Leads
    getLeads: (params?: string) => fetchApi<any[]>(`/leads${params ? `?${params}` : ''}`),
    getLead: (id: string) => fetchApi<any>(`/leads/${id}`),
    createLead: (data: any) => fetchApi('/leads', { method: 'POST', body: JSON.stringify(data) }),
    updateLead: (id: string, data: any) => fetchApi(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateLeadStatus: (id: string, status: string) =>
        fetchApi(`/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    convertLead: (id: string) => fetchApi(`/leads/${id}/convert`, { method: 'POST' }),
    deleteLead: (id: string) => fetchApi(`/leads/${id}`, { method: 'DELETE' }),

    // Insurance
    getInsurance: (params?: string) => fetchApi<any[]>(`/insurance${params ? `?${params}` : ''}`),
    getRenewalsDue: () => fetchApi<any[]>('/insurance/renewals-due'),
    createInsurance: (data: any) => fetchApi('/insurance', { method: 'POST', body: JSON.stringify(data) }),
    updateInsurance: (id: string, data: any) => fetchApi(`/insurance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteInsurance: (id: string) => fetchApi(`/insurance/${id}`, { method: 'DELETE' }),

    // Investments
    getInvestments: (params?: string) => fetchApi<any[]>(`/investments${params ? `?${params}` : ''}`),
    getSipCalendar: () => fetchApi<any[]>('/investments/sip-calendar'),
    createInvestment: (data: any) => fetchApi('/investments', { method: 'POST', body: JSON.stringify(data) }),
    updateInvestment: (id: string, data: any) => fetchApi(`/investments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteInvestment: (id: string) => fetchApi(`/investments/${id}`, { method: 'DELETE' }),

    // Loans
    getLoans: (params?: string) => fetchApi<any[]>(`/loans${params ? `?${params}` : ''}`),
    createLoan: (data: any) => fetchApi('/loans', { method: 'POST', body: JSON.stringify(data) }),
    updateLoan: (id: string, data: any) => fetchApi(`/loans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteLoan: (id: string) => fetchApi(`/loans/${id}`, { method: 'DELETE' }),

    // Activities
    getActivities: (params?: string) => fetchApi<any[]>(`/activities${params ? `?${params}` : ''}`),
    createActivity: (data: any) => fetchApi('/activities', { method: 'POST', body: JSON.stringify(data) }),
    updateActivity: (id: string, data: any) => fetchApi(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    completeActivity: (id: string) => fetchApi(`/activities/${id}/complete`, { method: 'PATCH' }),
    deleteActivity: (id: string) => fetchApi(`/activities/${id}`, { method: 'DELETE' }),

    // Partners
    getPartners: () => fetchApi<any[]>('/partners'),
    createPartner: (data: any) => fetchApi('/partners', { method: 'POST', body: JSON.stringify(data) }),

    // Reports
    getDashboardStats: () => fetchApi<any>('/reports/dashboard-stats'),
    getReportRenewals: () => fetchApi<any[]>('/reports/renewals-due'),
    getReportNewClients: () => fetchApi<any[]>('/reports/new-clients'),
    getReportSipsMaturing: () => fetchApi<any[]>('/reports/sips-maturing'),
    getReportCommission: () => fetchApi<any[]>('/reports/commission-summary'),
};
