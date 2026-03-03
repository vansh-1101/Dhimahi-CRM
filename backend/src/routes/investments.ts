import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { investmentSchema } from '../lib/validators';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { type, status, clientId } = req.query;
        const where: any = {};
        if (type) where.type = String(type);
        if (status) where.status = String(status);
        if (clientId) where.clientId = String(clientId);

        const investments = await prisma.investment.findMany({
            where,
            include: { client: { select: { contactName: true, mobileNumber: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(investments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch investments' });
    }
});

router.get('/sip-calendar', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sips = await prisma.investment.findMany({
            where: { type: 'SIP', status: 'ACTIVE' },
            include: { client: { select: { contactName: true, mobileNumber: true } } },
            orderBy: { sipDate: 'asc' },
        });
        res.json(sips);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch SIP calendar' });
    }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = investmentSchema.parse(req.body);
        const investment = await prisma.investment.create({
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
        res.status(201).json(investment);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to create investment' });
    }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = investmentSchema.parse(req.body);
        const investment = await prisma.investment.update({
            where: { id: req.params.id },
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
        res.json(investment);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to update investment' });
    }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.investment.delete({ where: { id: req.params.id } });
        res.json({ message: 'Investment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete investment' });
    }
});

export default router;
