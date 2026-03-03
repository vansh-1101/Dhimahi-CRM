import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const partners = await prisma.partner.findMany({
            include: { _count: { select: { clients: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(partners);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch partners' });
    }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, mobile, email, commissionRate } = req.body;
        const partner = await prisma.partner.create({
            data: { name, mobile, email, commissionRate },
        });
        res.status(201).json(partner);
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Partner with this email already exists' });
            return;
        }
        res.status(500).json({ error: 'Failed to create partner' });
    }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, mobile, email, commissionRate } = req.body;
        const partner = await prisma.partner.update({
            where: { id: req.params.id },
            data: { name, mobile, email, commissionRate },
        });
        res.json(partner);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update partner' });
    }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.partner.delete({ where: { id: req.params.id } });
        res.json({ message: 'Partner deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete partner' });
    }
});

export default router;
