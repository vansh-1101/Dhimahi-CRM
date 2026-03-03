import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { loanSchema } from '../lib/validators';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { type, status, clientId } = req.query;
        const where: any = {};
        if (type) where.loanType = String(type);
        if (status) where.status = String(status);
        if (clientId) where.clientId = String(clientId);

        const loans = await prisma.loan.findMany({
            where,
            include: { client: { select: { contactName: true, mobileNumber: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = loanSchema.parse(req.body);
        const loan = await prisma.loan.create({
            data: {
                ...data,
                disbursementDate: data.disbursementDate ? new Date(data.disbursementDate) : undefined,
            },
        });
        res.status(201).json(loan);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to create loan' });
    }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = loanSchema.parse(req.body);
        const loan = await prisma.loan.update({
            where: { id: req.params.id },
            data: {
                ...data,
                disbursementDate: data.disbursementDate ? new Date(data.disbursementDate) : undefined,
            },
        });
        res.json(loan);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to update loan' });
    }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.loan.delete({ where: { id: req.params.id } });
        res.json({ message: 'Loan deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete loan' });
    }
});

export default router;
