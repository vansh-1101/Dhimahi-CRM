import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { leadSchema, leadStatusUpdateSchema } from '../lib/validators';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all leads with filters
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status, service, search } = req.query;
        const where: any = {};

        if (status) where.status = String(status);
        if (service) where.serviceInterested = String(service);
        if (search) {
            where.OR = [
                { name: { contains: String(search), mode: 'insensitive' } },
                { phone: { contains: String(search) } },
                { email: { contains: String(search), mode: 'insensitive' } },
            ];
        }

        const leads = await prisma.lead.findMany({
            where,
            include: {
                assignedTo: { select: { name: true } },
                convertedClient: { select: { contactName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

// Get single lead
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const lead = await prisma.lead.findUnique({
            where: { id: req.params.id },
            include: {
                assignedTo: { select: { name: true } },
                convertedClient: true,
                activities: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!lead) {
            res.status(404).json({ error: 'Lead not found' });
            return;
        }
        res.json(lead);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch lead' });
    }
});

// Create lead
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = leadSchema.parse(req.body);
        const lead = await prisma.lead.create({
            data: {
                ...data,
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
                email: data.email || undefined,
            },
        });
        res.status(201).json(lead);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to create lead' });
    }
});

// Update lead
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = leadSchema.parse(req.body);
        const lead = await prisma.lead.update({
            where: { id: req.params.id },
            data: {
                ...data,
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
                email: data.email || undefined,
            },
        });
        res.json(lead);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

// Update lead status (for drag-drop Kanban)
router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status } = leadStatusUpdateSchema.parse(req.body);
        const lead = await prisma.lead.update({
            where: { id: req.params.id },
            data: { status },
        });
        res.json(lead);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to update lead status' });
    }
});

// Convert lead to client
router.post('/:id/convert', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
        if (!lead) {
            res.status(404).json({ error: 'Lead not found' });
            return;
        }
        if (lead.status === 'CONVERTED') {
            res.status(400).json({ error: 'Lead already converted' });
            return;
        }

        // Create client from lead data
        const client = await prisma.client.create({
            data: {
                contactName: lead.name,
                mobileNumber: lead.phone || '',
                email: lead.email || undefined,
                otherServices: lead.serviceInterested ? [lead.serviceInterested] : [],
            },
        });

        // Update lead status
        await prisma.lead.update({
            where: { id: req.params.id },
            data: { status: 'CONVERTED', convertedClientId: client.id },
        });

        res.json({ lead: { ...lead, status: 'CONVERTED' }, client });
    } catch (error) {
        res.status(500).json({ error: 'Failed to convert lead' });
    }
});

// Delete lead
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.lead.delete({ where: { id: req.params.id } });
        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete lead' });
    }
});

export default router;
