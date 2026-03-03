import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import leadRoutes from './routes/leads';
import insuranceRoutes from './routes/insurance';
import investmentRoutes from './routes/investments';
import loanRoutes from './routes/loans';
import activityRoutes from './routes/activities';
import reportRoutes from './routes/reports';
import partnerRoutes from './routes/partners';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'https://dhimahi-crm.netlify.app',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for now
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/partners', partnerRoutes);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/db-check', async (_req, res) => {
    try {
        const count = await prisma.client.count();
        res.json({ status: 'connected', clientCount: count, dbUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message, dbUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Dhimahi CRM Backend running on port ${PORT}`);
});

export default app;
