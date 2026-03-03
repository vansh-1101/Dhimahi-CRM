import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { clientSchema } from '../lib/validators';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all clients with search and pagination
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { search, page = '1', limit = '20' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = search ? {
            OR: [
                { contactName: { contains: String(search), mode: 'insensitive' as const } },
                { panNumber: { contains: String(search), mode: 'insensitive' as const } },
                { mobileNumber: { contains: String(search) } },
                { email: { contains: String(search), mode: 'insensitive' as const } },
                { familyName: { contains: String(search), mode: 'insensitive' as const } },
            ],
        } : {};

        const [clients, total] = await Promise.all([
            prisma.client.findMany({
                where,
                include: { associatePartner: { select: { name: true } } },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.client.count({ where }),
        ]);

        res.json({ clients, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
});

// Get single client with all related data
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const client = await prisma.client.findUnique({
            where: { id: req.params.id },
            include: {
                associatePartner: true,
                insurancePolicies: { orderBy: { createdAt: 'desc' } },
                investments: { orderBy: { createdAt: 'desc' } },
                loans: { orderBy: { createdAt: 'desc' } },
                creditCards: { orderBy: { createdAt: 'desc' } },
                activities: { orderBy: { createdAt: 'desc' }, take: 20, include: { createdBy: { select: { name: true } } } },
            },
        });

        if (!client) {
            res.status(404).json({ error: 'Client not found' });
            return;
        }

        res.json(client);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch client' });
    }
});

// Create client
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = clientSchema.parse(req.body);
        const client = await prisma.client.create({
            data: {
                ...data,
                dob: data.dob ? new Date(data.dob) : undefined,
                email: data.email || undefined,
            },
        });
        res.status(201).json(client);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'A client with this PAN number already exists' });
            return;
        }
        res.status(500).json({ error: 'Failed to create client' });
    }
});

// Update client
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = clientSchema.parse(req.body);
        const client = await prisma.client.update({
            where: { id: req.params.id },
            data: {
                ...data,
                dob: data.dob ? new Date(data.dob) : undefined,
                email: data.email || undefined,
            },
        });
        res.json(client);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to update client' });
    }
});

// Delete client
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.client.delete({ where: { id: req.params.id } });
        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete client' });
    }
});

export default router;
