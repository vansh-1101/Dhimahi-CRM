import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function formatCurrency(amount: number | undefined): string {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function daysUntil(date: string | undefined): number {
    if (!date) return Infinity;
    const target = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getServiceColor(service: string): string {
    const colors: Record<string, string> = {
        INSURANCE: '#7C3AED',
        INVESTMENT: '#2563EB',
        LOAN: '#059669',
        BROKING: '#D97706',
        CREDIT_CARD: '#DC2626',
    };
    return colors[service] || '#6B7280';
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        ACTIVE: '#059669',
        NEW: '#2563EB',
        CONTACTED: '#D97706',
        QUALIFIED: '#7C3AED',
        CONVERTED: '#059669',
        LOST: '#DC2626',
        LAPSED: '#DC2626',
        EXPIRED: '#6B7280',
        CLOSED: '#6B7280',
        NPA: '#DC2626',
        PAUSED: '#D97706',
        REDEEMED: '#6B7280',
    };
    return colors[status] || '#6B7280';
}
