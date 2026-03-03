import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { loginSchema } from '../lib/validators';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', async (req, res: Response): Promise<void> => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/register', async (req, res: Response): Promise<void> => {
    try {
        const { name, email, password, role, mobile } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, passwordHash, role: role || 'AGENT', mobile },
        });

        res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { id: true, name: true, email: true, role: true, mobile: true },
        });
        res.json({ user });
    } catch {
        res.status(500).json({ error: 'Failed to get user' });
    }
});

router.post('/logout', (_req, res: Response): void => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

export default router;
