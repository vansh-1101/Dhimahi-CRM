import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { activitySchema } from '../lib/validators';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { clientId, leadId, type, today } = req.query;
        const where: any = {};
        if (clientId) where.clientId = String(clientId);
        if (leadId) where.leadId = String(leadId);
        if (type) where.type = String(type);
        if (today === 'true') {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            where.scheduledAt = { gte: start, lte: end };
        }

        const activities = await prisma.activity.findMany({
            where,
            include: {
                client: { select: { contactName: true } },
                lead: { select: { name: true } },
                createdBy: { select: { name: true } },
            },
            orderBy: { scheduledAt: 'desc' },
        });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = activitySchema.parse(req.body);
        const activity = await prisma.activity.create({
            data: {
                ...data,
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
                completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
                createdById: req.user?.id,
            },
        });
        res.status(201).json(activity);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to create activity' });
    }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = activitySchema.parse(req.body);
        const activity = await prisma.activity.update({
            where: { id: req.params.id },
            data: {
                ...data,
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
                completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
            },
        });
        res.json(activity);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to update activity' });
    }
});

// Mark activity as complete
router.patch('/:id/complete', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const activity = await prisma.activity.update({
            where: { id: req.params.id },
            data: { completedAt: new Date() },
        });
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: 'Failed to complete activity' });
    }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.activity.delete({ where: { id: req.params.id } });
        res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete activity' });
    }
});

export default router;
