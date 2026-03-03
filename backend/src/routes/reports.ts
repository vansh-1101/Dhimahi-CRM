import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Dashboard stats
router.get('/dashboard-stats', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);

        const [
            totalClients,
            activeLeads,
            renewingPolicies,
            activeSIPs,
            recentActivities,
            clientsByMonth,
            serviceDistribution,
        ] = await Promise.all([
            prisma.client.count(),
            prisma.lead.count({ where: { status: { in: ['NEW', 'CONTACTED', 'QUALIFIED'] } } }),
            prisma.insurancePolicy.count({
                where: { status: 'ACTIVE', renewalDate: { gte: today, lte: thirtyDaysLater } },
            }),
            prisma.investment.count({ where: { type: 'SIP', status: 'ACTIVE' } }),
            prisma.activity.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    client: { select: { contactName: true } },
                    lead: { select: { name: true } },
                    createdBy: { select: { name: true } },
                },
            }),
            // Clients per month for last 6 months
            prisma.$queryRaw`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') AS month,
          CAST(COUNT(*) AS INTEGER) AS count
        FROM clients
        WHERE "createdAt" >= ${sixMonthsAgo}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
      `,
            // Service distribution
            prisma.$queryRaw`
        SELECT unnest("otherServices") AS service, CAST(COUNT(*) AS INTEGER) AS count
        FROM clients
        GROUP BY service
      `,
        ]);

        res.json({
            stats: { totalClients, activeLeads, renewingPolicies, activeSIPs },
            recentActivities,
            clientsByMonth,
            serviceDistribution,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// Renewals due this month
router.get('/renewals-due', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const today = new Date();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const policies = await prisma.insurancePolicy.findMany({
            where: {
                status: 'ACTIVE',
                renewalDate: { gte: today, lte: endOfMonth },
            },
            include: { client: { select: { contactName: true, mobileNumber: true, email: true } } },
            orderBy: { renewalDate: 'asc' },
        });

        res.json(policies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch renewals' });
    }
});

// New clients this month
router.get('/new-clients', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const clients = await prisma.client.findMany({
            where: { createdAt: { gte: startOfMonth } },
            include: { associatePartner: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        });

        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch new clients' });
    }
});

// SIPs maturing
router.get('/sips-maturing', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const today = new Date();
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(today.getMonth() + 3);

        const sips = await prisma.investment.findMany({
            where: {
                type: 'SIP',
                status: 'ACTIVE',
                endDate: { gte: today, lte: threeMonthsLater },
            },
            include: { client: { select: { contactName: true, mobileNumber: true } } },
            orderBy: { endDate: 'asc' },
        });

        res.json(sips);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch maturing SIPs' });
    }
});

// Commission summary by partner
router.get('/commission-summary', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const partners = await prisma.partner.findMany({
            include: {
                _count: { select: { clients: true } },
                clients: {
                    include: {
                        _count: {
                            select: { insurancePolicies: true, investments: true, loans: true },
                        },
                    },
                },
            },
        });

        const summary = partners.map((p) => ({
            id: p.id,
            name: p.name,
            commissionRate: p.commissionRate,
            totalClients: p._count.clients,
            totalPolicies: p.clients.reduce((sum, c) => sum + c._count.insurancePolicies, 0),
            totalInvestments: p.clients.reduce((sum, c) => sum + c._count.investments, 0),
            totalLoans: p.clients.reduce((sum, c) => sum + c._count.loans, 0),
        }));

        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch commission summary' });
    }
});

export default router;
