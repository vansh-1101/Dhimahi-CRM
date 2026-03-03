import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { insuranceSchema } from '../lib/validators';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all policies with filters
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { type, status, renewalMonth, clientId } = req.query;
        const where: any = {};

        if (type) where.insuranceType = String(type);
        if (status) where.status = String(status);
        if (clientId) where.clientId = String(clientId);
        if (renewalMonth) {
            const month = Number(renewalMonth);
            const year = new Date().getFullYear();
            where.renewalDate = {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
            };
        }

        const policies = await prisma.insurancePolicy.findMany({
            where,
            include: { client: { select: { contactName: true, mobileNumber: true } } },
            orderBy: { renewalDate: 'asc' },
        });

        res.json(policies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch policies' });
    }
});

// Get renewals due within 30 days
router.get('/renewals-due', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);

        const policies = await prisma.insurancePolicy.findMany({
            where: {
                status: 'ACTIVE',
                renewalDate: { gte: today, lte: thirtyDaysLater },
            },
            include: { client: { select: { contactName: true, mobileNumber: true, email: true } } },
            orderBy: { renewalDate: 'asc' },
        });

        res.json(policies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch renewals' });
    }
});

// Create policy
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = insuranceSchema.parse(req.body);
        const policy = await prisma.insurancePolicy.create({
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                renewalDate: data.renewalDate ? new Date(data.renewalDate) : undefined,
            },
        });
        res.status(201).json(policy);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to create policy' });
    }
});

// Update policy
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = insuranceSchema.parse(req.body);
        const policy = await prisma.insurancePolicy.update({
            where: { id: req.params.id },
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                renewalDate: data.renewalDate ? new Date(data.renewalDate) : undefined,
            },
        });
        res.json(policy);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to update policy' });
    }
});

// Delete policy
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.insurancePolicy.delete({ where: { id: req.params.id } });
        res.json({ message: 'Policy deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete policy' });
    }
});

export default router;
